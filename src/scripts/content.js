import checkLanguageAttribute from '../scripts/understandable/language/index';  
import checkKeyboardAccessibility from '../scripts/operable/keyboardAccessible/index';  

chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
  console.log('Resposta do background script:', response.result);
});

const getPageDOM = () => {
  return document.documentElement.outerHTML;
};

const languageCheckResult = checkLanguageAttribute();
const keyboardAccessibility = checkKeyboardAccessibility();

chrome.runtime.sendMessage({ action: 'getDOM', dom: getPageDOM() }, (response) => {
  console.log('Resposta do background script:', response);
});

chrome.runtime.sendMessage({ action: 'checkKeyboardAccessibility', result: keyboardAccessibility }, (response) => {
  console.log('Resposta do background script:', response);
});

chrome.runtime.sendMessage({ action: 'checkLanguageAttribute', result: languageCheckResult }, (response) => {
  console.log('Resposta do background script:', response);
});


