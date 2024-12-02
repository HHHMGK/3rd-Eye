document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('getUrlButton');
    const urlDisplay = document.getElementById('urlDisplay');

    button.addEventListener('click', function() {
        const url = window.location.href;
        urlDisplay.textContent = `URL: ${url}`;

        fetch('/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ article_url: url })
        })
        .then(response => response.json())
        .then(data => {
            urlDisplay.textContent = `Processed Content: ${JSON.stringify(data)}`;
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
