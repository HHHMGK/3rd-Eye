from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline, AutoProcessor, AutoModelForCausalLM, SummarizationPipeline, AutoTokenizer, BitsAndBytesConfig
import torch
from PIL import Image
from io import BytesIO
from time import time
import logging
import requests

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
CORS(app)

# Image captioning model
image_captioning_model_name = "microsoft/Florence-2-large-ft"
processor = AutoProcessor.from_pretrained(image_captioning_model_name, trust_remote_code=True)
imgcap_model = AutoModelForCausalLM.from_pretrained(image_captioning_model_name, trust_remote_code=True)
# Text summarization model
text_summarization_model_name = "microsoft/Phi-3.5-mini-instruct"
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type='q4_k_m',
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.float16
)
textsum_model = AutoModelForCausalLM.from_pretrained(
    text_summarization_model_name,
    quantization_config=bnb_config,
    device_map='auto'
)
tokenizer = AutoTokenizer.from_pretrained(text_summarization_model_name, trust_remote_code=True)
summerizer = SummarizationPipeline(model=textsum_model, tokenizer=tokenizer)


@app.route('/process', methods=['POST'])
def process():
    data = request.json
    article_url = data.get('article_url', '')
    
    # Fetch the article content
    response = requests.get(article_url)
    article_content = response.json()  # Assuming the article content is in JSON format
    
    # Process the article content
    processed_content = []
    for item in article_content:
        if item['type'] == 'text':
            processed_content.append(item['content'])
        elif item['type'] == 'image':
            image_url = item['content']
            image_response = requests.get(image_url)
            image = BytesIO(image_response.content)
            caption = imgcap(image)
            processed_content.append(caption)
    
    return jsonify(processed_content)

def summarize_text(inputs, min_length=50, max_length=100):
    text = ""
    for x in inputs:
        if isinstance(x, str):
            text += x
        else:
            text += imgcap(x)
    return summerizer(text, min_length=min_length, max_length=max_length, do_sample=False)
    

def imgcap(image_file):
    img = Image.open(BytesIO(image_file.read()))
    img = img.convert('RGB')
    task = '<MORE_DETAILED_CAPTION>'
    prompt = task 
    inputs = processor(images=img, text=prompt, return_tensors="pt")
    start_time = time()
    out = imgcap_model.generate(
        input_ids=inputs["input_ids"],
        pixel_values=inputs["pixel_values"],
        max_new_tokens=1024,
        do_sample=False,
        num_beams=3,
    )
    logger.info(f"Model generation done! {time() - start_time}")
    prediction = processor.batch_decode(out, skip_special_tokens=False)[0]
    parsed_answer = processor.post_process_generation(prediction, task=task, image_size=(img.width, img.height))

    logger.info(prediction)
    return parsed_answer[task]

@app.route('/text2speech', methods=['POST'])
def text2speech():
    return jsonify({'text': text})

if __name__ == '__main__':
    app.run(debug=True)
