const translationCache = new Map();
function wordChoice(articleSelector) {
    const article = document.querySelector(articleSelector) || document.body;
    if (!article) return null;

    const text = article.textContent;
    const wordMatchRegExp = /\b[A-Za-z]{3,}\b/g; 
    const wordsArr = (text.match(wordMatchRegExp) || []);

    const uniqueWords = Array.from(new Set(wordsArr)).filter(word => word.length > 2);
    
    const wordCount = uniqueWords.length;
    if (wordCount === 0) return null;

    const randomWord = uniqueWords[Math.floor(Math.random() * wordCount)];
    
    console.log("Word chosen for translation:", randomWord);
    return randomWord;
}

async function translateAndCache(source, target, word) {
    if (translationCache.has(word)) return; 

    try {
        const translator = await Translator.create({
            sourceLanguage: source,
            targetLanguage: target,
        });

        const translatedWord = await translator.translate(word);
        translationCache.set(word, translatedWord);
        return { original: word, translation: translatedWord, targetLang: target };

    } catch (e) {
        console.error(`Translation Error for ${word}:`, e.name);
        translationCache.set(word, `Error (${e.name})`);
        return { original: word, translation: `Error (${e.name})`, targetLang: target };
    }
}

function createHoverPopup() {
    let popup = document.getElementById('anuvad-hover-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'anuvad-hover-popup';
        popup.style.cssText = `
            position: absolute;
            background: #222;
            color: #fff;
            border: 1px solid #7de847ff;
            padding: 8px 12px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            z-index: 2147483647; 
            display: none; 
            font-size: 14px;
            line-height: 1.4;
            pointer-events: none;
        `;
        document.body.appendChild(popup);
    }
    return popup;
}


function wrapAndAttachEvents(word) {
    const popup = createHoverPopup();
    
    let bodyHtml = document.body.innerHTML;

    const regex = new RegExp(`\\b(${word})\\b(?!([^<]+)?>)`, 'gi');

    bodyHtml = bodyHtml.replace(regex, (match) => {
        return `<span class="anuvad-word-wrapper" data-original-word="${match}" style="border-bottom: 2px dashed #4CAF50; cursor: help; font-weight: 500;">${match}</span>`;
    });

    document.body.innerHTML = bodyHtml; 
    
    document.body.addEventListener('mouseover', (e) => {
        const currentPopup = document.getElementById('anuvad-hover-popup');
        
        if (e.target.classList.contains('anuvad-word-wrapper') && currentPopup) {
            const originalWord = e.target.getAttribute('data-original-word');
            const translatedWord = translationCache.get(originalWord);
            
            if (translatedWord && !translatedWord.startsWith('Error')) {
                currentPopup.innerHTML = `
                    <div style="color: #4CAF50; font-weight: bold;">${translatedWord}</div>
                    <div style="font-size: 12px; opacity: 0.7;">Original: ${originalWord}</div>
                `;
                
                const rect = e.target.getBoundingClientRect();
                currentPopup.style.left = `${rect.left + window.scrollX}px`;
                currentPopup.style.top = `${rect.bottom + window.scrollY + 5}px`;
                currentPopup.style.display = 'block';
            }
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        const currentPopup = document.getElementById('anuvad-hover-popup');
        if (e.target.classList.contains('anuvad-word-wrapper') && currentPopup) {
            currentPopup.style.display = 'none';
        }
    });
}


console.log("Content script loaded.");

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.action === "triggerTranslation") {
            
            const source = request.sourceLang || 'en';
            const target = request.targetLang || 'es';
            
            const wordToTranslate = wordChoice("body"); 
            
            if (!wordToTranslate) {
                 sendResponse({ original: "N/A", translation: "No appropriate words found on the page.", targetLang: target });
                 return true; 
            }

            translateAndCache(source, target, wordToTranslate)
                .then((result) => {
                    const translatedWord = translationCache.get(wordToTranslate);
                    
                    if (translatedWord && !translatedWord.startsWith('Error')) {
                        wrapAndAttachEvents(wordToTranslate);
                        
                        sendResponse({ 
                            translation: `Successfully marked one word: "${wordToTranslate}". Now hover over it!`, 
                            original: "Status", 
                            targetLang: target 
                        });
                    } else {
                        sendResponse({ 
                            translation: `Translation failed for "${wordToTranslate}": ${translatedWord}`, 
                            original: "Status", 
                            targetLang: target 
                        });
                    }
                })
                .catch(error => {
                    console.error("Translation processing failed:", error);
                    sendResponse({ original: "Error", translation: `Feature failed: ${error.message}`, targetLang: target });
                });
            
            return true; 
        }
    }
);