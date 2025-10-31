document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.startBtn');
    
    startButton.addEventListener('click', () => {
        
        const sourceLangCode = 'en';
        const targetLangCode = 'es';

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                        chrome.tabs.sendMessage(
                tabs[0].id, 
                { 
                    action: "triggerTranslation", 
                    sourceLang: sourceLangCode, 
                    targetLang: targetLangCode 
                }, 
                (response) => {
                    if (chrome.runtime.lastError) {
                        resultDisplay.innerHTML = `<p style="color:red;">Error: Connection failed. Refresh page and try again.</p>`;
                        console.error("Connection Error:", chrome.runtime.lastError.message);
                        return;
                    } 
                    
                }
            );
        });
    });
});