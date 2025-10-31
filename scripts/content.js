// // use chrome ai to get the translation

// // -----advance----
// // change the word 
// // have a hover: 
// // word of the website: conversion
// // mic icon: pronunciation + phonetic using some prompt api
// // translator use+ prompt+ audio answer can i get it

// //language and laga kae return

// function wordChoice(article) {
//   if (!article) return;

//   const text = article.textContent;
//   const wordMatchRegExp = /\S+/g; 
//   const wordsArr = [...text.matchAll(wordMatchRegExp)].map(match => match[0]);

//   const wordCount = wordsArr.length;
//   if (wordCount===0) return;

//   const wordIndex=Math.floor(Math.random() * wordCount);
  
//   console.log("Random index:", wordIndex);
//   console.log("Random word:", wordsArr[wordIndex]);

//   return wordsArr[wordIndex];
// }

// // wordChoice(document.querySelector(".available-content"));


// async function translation(source, target,word){
// if(navigator.userActivation.isActive ){

//   // Create a translator that translates from English to French.
//   const translator = await Translator.create({
//   sourceLanguage: source,
//   targetLanguage: target,
//   monitor(m) {
//     m.addEventListener('downloadprogress', (e) => {
//       console.log(`Downloaded ${e.loaded * 100}%`);
//     });
//   },
// });
// console.log(await translator.translate(word));
// }

// console.log('activation fail')
// }

// translation('en', 'es', wordChoice(document.querySelector(".available-content")));


function wordChoice(articleSelector) {
    const article = document.querySelector(articleSelector);
    if (!article) return null;

    const text = article.textContent;
    const wordMatchRegExp = /\S+/g;
    const wordsArr = (text.match(wordMatchRegExp) || []);

    const wordCount = wordsArr.length;
    if (wordCount === 0) return null;

    const wordIndex = Math.floor(Math.random() * wordCount);

    const randomWord = wordsArr[wordIndex];
    
    console.log("word choosen from page:", randomWord);

    return randomWord;
}

async function translation(source, target, word) {
    try {
        const translator = await Translator.create({
            sourceLanguage: source,
            targetLanguage: target,
            // monitor(m) {
            //     m.addEventListener('downloadprogress', (e) => {
            //         console.log(`Model Download Progress: ${Math.round(e.loaded * 100)}%`);
            //     });
            // },
        });

        const translatedWord = await translator.translate(word);
        
        console.log(`Translation Success:${translatedWord}`);
        return { original: word, translation: translatedWord, targetLang: target };

    } catch (e) {
        console.error("Translation Error:");
        return { 
            original: word, 
            translation: `Translation failed with: ${e.name}`, 
            targetLang: target 
        };
    }
}

console.log("Content script loaded.");

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.action === "triggerTranslation") {
            
            const word = wordChoice(".available-content");
            if (!word) {
                 sendResponse({ original: "N/A", translation: "No words found in content.", targetLang: 'es' });
                 return true; 
            }

            const source = request.sourceLang || 'en';
            const target = request.targetLang || 'es';

            translation(source, target, word)
                .then(sendResponse);
            
            return true; 
        }
    }
);
