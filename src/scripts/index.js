import checkKeyboardAccessibility from './operable/keyboardAccessible/index';
import checkLanguageAttribute from './understandable/3.1.1/index';
import checkAllDirectives from './checkAllDirectives';

const getPageDOM = () => {
  return document.documentElement.outerHTML;
};

const handleCheckDirective = async (directive) => {
  switch (directive) {
    case '2.1.1':
      return await checkKeyboardAccessibility();
    case '3.1.1':
      return await checkLanguageAttribute();
    default:
      return { result: 'Diretriz não reconhecida' };
  }
};

window.chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDOM') {
    sendResponse({ dom: getPageDOM() });
  } else if (message.action === 'checkDirective') {
    handleCheckDirective(message.directive).then(sendResponse);
  } else if (message.action === 'checkAllDirectives') {
    checkAllDirectives().then(sendResponse);
  }

  return true; // Indica que a resposta será enviada de forma assíncrona
});