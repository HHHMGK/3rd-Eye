from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoProcessor, AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch
from time import time
import logging, gc
import pyttsx3
from crawler import crawl_article

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
CORS(app)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")
if device.type == 'cuda':
    gc.collect()
    torch.cuda.empty_cache()

# Image captioning model
image_captioning_model_name = "microsoft/Florence-2-large-ft"
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type='nf4',
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.float16
)
processor = AutoProcessor.from_pretrained(image_captioning_model_name, trust_remote_code=True)
imgcap_model = AutoModelForCausalLM.from_pretrained(
    image_captioning_model_name, 
    trust_remote_code=True, 
    quantization_config=bnb_config,
    device_map=device
)
logger.info('@@Loading image captioning model done@@')
# Text summarization model
text_summarization_model_name = "microsoft/Phi-3.5-mini-instruct"
textsum_model = AutoModelForCausalLM.from_pretrained(
    text_summarization_model_name,
    quantization_config=bnb_config,
    device_map='auto'
)
tokenizer = AutoTokenizer.from_pretrained(text_summarization_model_name, trust_remote_code=True)
logger.info('@@Loading text summarization model done@@')
tts_engine = pyttsx3.init()


@app.route('/process', methods=['POST'])
def process():
    data = request.json
    article_url = data.get('article_url', '')
    runtype = data.get('runtype', 'summarize') # 'summarize' or 'full'
    logger.info(f'Received URL: {article_url}') 
    
    article_content = crawl_article(article_url, logger)
    if article_content is None:
        logger.info('Empty or error article content')
        return jsonify({'error': 'Failed to retrieve article content'})
    
    if runtype == 'full':
        text2speech(article_content['text'])
        logger.info(f'Full content: {article_content["text"]}')
        return jsonify({'result': article_content['text']})
    else:
        processed_text = summarize_text(article_content['text'])
        gc.collect()
        torch.cuda.empty_cache()
        processed_img = ''
        for img in article_content['img']:
            processed_img += imgcap(img)
            gc.collect()
            torch.cuda.empty_cache()    

        summary = processed_text + '\n The article also contain:\n' + processed_img
        logger.info(f'Processed content: {summary}')
        text2speech(summary)
        return jsonify({'result': summary})

def summarize_text(text, max_length=200):
    try:
        prompt = f"""<|system|>
            You are a helpful assistant.<|end|>
            <|user|>
            Give a short summarize of the following: {text}<|end|>
            <|assistant|>
            """
        inputs = tokenizer(prompt, return_tensors="pt",).input_ids.to(device)
        logger.info(f'Processing text with length: {len(inputs[0])}')
        outputs = textsum_model.generate(inputs, max_new_tokens=max_length, do_sample=False)
        outputs = outputs[:, inputs.shape[1]:]
        summary = tokenizer.batch_decode(
            outputs, 
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False)[0]
        logger.info(f'=== Summarized text: {summary}')
        return summary
        
    except Exception as e:
        logger.error(f'Error processing content: {e}')
        return ''
    
def imgcap(img):
    try:
        logger.info(f'Processing image ======')
        img = img.convert('RGB')
        task = '<MORE_DETAILED_CAPTION>'
        prompt = task 
        inputs = processor(images=img, text=prompt, return_tensors="pt")
        start_time = time()
        out = imgcap_model.generate(
            input_ids=inputs["input_ids"].to(device, dtype=torch.int),
            pixel_values=inputs["pixel_values"].to(device, dtype=torch.float16),
            max_new_tokens=1024,
            do_sample=False,
            num_beams=3,
        )
        logger.info(f"Model generation done! {time() - start_time}")
        prediction = processor.batch_decode(out, skip_special_tokens=False)[0]
        parsed_answer = processor.post_process_generation(prediction, task=task, image_size=(img.width, img.height))

        logger.info(f'=== Image rediction :{prediction}')
        return 'An image of ' + parsed_answer[task] + '\n'
    except Exception as e:
        logger.error(f'Error processing content: {e}')
        return ''


def text2speech(text):
    if tts_engine.isBusy():
        tts_engine.stop() 
    tts_engine.say(text)
    tts_engine.runAndWait()   

if __name__ == '__main__':
    app.run(debug=False)
