const capturePageState = () => {
  return {
    url: window.location.href,
    innerHTML: document.documentElement.innerHTML
  };
};

const checkFocusChange = () => {
  const focusableElements = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])'
  ];

  const elements = document.querySelectorAll(focusableElements.join(','));

  let previousState = capturePageState();

  elements.forEach(element => {
    element.addEventListener('focus', () => {
      setTimeout(() => {
        const currentState = capturePageState();
        if (previousState.url !== currentState.url || previousState.innerHTML !== currentState.innerHTML) {
          console.warn('Mudança de contexto detectada ao focar em:', element);
        }
      }, 100); // Atraso para capturar mudanças após o foco
    });
  });
};

const checkLanguageAttribute = () => {
  const htmlElement = document.documentElement;
  const langAttribute = htmlElement.getAttribute('lang');
  
  if (langAttribute) {
    console.log('Idioma da página:', langAttribute);
  } else {
    console.warn('O atributo "lang" não está definido no elemento <html>.');
  }
};

checkFocusChange();
checkLanguageAttribute();