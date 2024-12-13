# 3rd-Eye
3rd Eye is a Chromium extension that helps individuals with visual impairment to have better web browsing experience by summarizing the content of the web page and reading it out loud. 

## Installation and Usage
1. Clone the repository
2. Open Chrome (or any Chromium) and go to `chrome://extensions/`
3. Enable Developer mode
4. Click on `Load unpacked` and select the folder where the repository is cloned, the extension should now be installed
5. Create an environment for python and install the required packages using the following commands:
```bash
pip install -r requirements.txt
```
- You might need to install dependencies for `pyttsx3` manually by following the instructions [here](https://pyttsx3.readthedocs.io/en/latest/install.html)
- Make sure to install CUDAToolkit and cuDNN (and torch CUDA) if you want to use GPU for inference
6. Run the server using the following command:
```bash
python app.py
```
7. Open the extension and click on the microphone icon to start summarizing the content of the web page
