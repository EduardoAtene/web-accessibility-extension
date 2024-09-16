import checkKeyboardAccessibility from './operable/keyboardAccessible/index';
import checkLanguageAttribute from './understandable/language/index';
// import checkFocusChange from './understandable/focus/focusChange';

const checkAllDirectives = async () => {
  const keyboardAccessibilityResults = await checkKeyboardAccessibility();
  const languageAttributeResults = await checkLanguageAttribute();
  const focusChangeResults = await checkFocusChange();
  
  return {
    keyboardAccessibility: keyboardAccessibilityResults,
    languageAttribute: languageAttributeResults,
    // focusChange: focusChangeResults,
    // Inclua outros resultados de diretrizes conforme necessário
  };
};

export default checkAllDirectives;