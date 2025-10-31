document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.querySelector('.startBtn');
    const firstLangSelect = document.getElementById('firstLang');
    const targetLangSelect = document.getElementById('targetLang');

    chrome.storage.sync.get(['sourceLangPref', 'targetLangPref'], (data) => {
        firstLangSelect.value = data.sourceLangPref;
        targetLangSelect.value = data.targetLangPref;
    });

    const savePrefs = () => {
        chrome.storage.sync.set({
            sourceLangPref: firstLangSelect.value,
            targetLangPref: targetLangSelect.value
        });
    };

    firstLangSelect.addEventListener('change', savePrefs);
    targetLangSelect.addEventListener('change', savePrefs);


    startButton.addEventListener('click', () => {
        const sourceLangCode = firstLangSelect.value;
        const targetLangCode = targetLangSelect.value;

        if (!sourceLangCode || !targetLangCode) {
            resultDisplay.innerHTML = '<p style="color:red;">Error: Invalid language selection. Both must be chosen.</p>';
            return;
        }


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