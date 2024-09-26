const checkLanguageAttribute = () => {
  const htmlElement = document.documentElement;
  const langAttribute = htmlElement.getAttribute('lang');
  
  if (langAttribute) {
    return {
      hasLanguageAttribute: true,
      language: langAttribute
    };
  } else {
    return {
      hasLanguageAttribute: false,
      language: null
    };
  }
};

export default checkLanguageAttribute;