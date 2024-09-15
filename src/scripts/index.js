// contentScript.js

// Função para capturar o DOM da página
const getPageDOM = () => {
  return document.documentElement.outerHTML;
};

// Função para verificar a acessibilidade por teclado
const checkKeyboardAccessibility = () => {
  const focusableElements = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  const elements = document.querySelectorAll(focusableElements.join(','));
  
  const results = {
    allFocusableElements: [],
    accessibleByKeyboard: []
  };

  elements.forEach(element => {
    const isTabbable = element.tabIndex >= 0;
    results.allFocusableElements.push({
      tag: element.tagName.toLowerCase(),
      id: element.id,
      tabindex: element.tabIndex,
      tabbable: isTabbable
    });

    if (isTabbable) {
      results.accessibleByKeyboard.push(element);
    }
  });

  return results;
};

// Listener para mensagens do popup ou background
window.chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getDOM') {
    sendResponse({ dom: getPageDOM() });
  } else if (message.action === 'checkKeyboardAccessibility') {
    sendResponse(checkKeyboardAccessibility());
  }
});