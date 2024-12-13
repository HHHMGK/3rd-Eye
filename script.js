document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('getUrlButton');
    const urlDisplay = document.getElementById('urlDisplay');

    button.addEventListener('click', function() {
        // Query the active tab
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tabs) {
            let url = tabs[0].url;
            console.log('Current URL:', url);
            urlDisplay.textContent = 'Processing url: ' + url + ' ...';

            // Send the URL to the Flask backend
            fetch('http://localhost:5000/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ article_url: url })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Processed Content:', data);
                urlDisplay.textContent = JSON.stringify(data, null, 2);
            })
            .catch(error => {
                console.error('Error:', error);
                urlDisplay.textContent = 'An error occurred while processing the URL.';
            });
        });
    });
});
