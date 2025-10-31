// use chrome ai to get the translation

// -----advance----
// change the word 
// have a hover: 
// word of the website: conversion
// mic icon: pronunciation + phonetic using some prompt api
// translator use+ prompt+ audio answer can i get it

//language and laga kae return

function wordChoice(article) {
  if (!article) return;

  const text = article.textContent;
  const wordMatchRegExp = /\S+/g; 
  const wordsArr = [...text.matchAll(wordMatchRegExp)].map(match => match[0]);

  const wordCount = wordsArr.length;
  if (wordCount===0) return;

  const wordIndex=Math.floor(Math.random() * wordCount);
  
  console.log("Random index:", wordIndex);
  console.log("Random word:", wordsArr[wordIndex]);

  return wordsArr[wordIndex];
}

wordChoice(document.querySelector(".available-content"));
