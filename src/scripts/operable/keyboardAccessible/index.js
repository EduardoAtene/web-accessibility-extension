const checkKeyboardAccessibility = () => {
  // Seletores para elementos focáveis
  const focusableElements = [
    'a[href]',
    'button',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])'
  ];
  
  // Seleciona todos os elementos focáveis na página
  const elements = document.querySelectorAll(focusableElements.join(','));
  
  // Inicializa os resultados
  const results = {
    allFocusableElements: [],
    accessibleByKeyboard: []
  };

  // Itera sobre os elementos e classifica-os
  elements.forEach(element => {
    const isTabbable = element.tabIndex >= 0; // Verifica se o elemento é tabulável

    // Adiciona o elemento à lista de todos os elementos focáveis
    results.allFocusableElements.push({
      tag: element.tagName.toLowerCase(), // Nome da tag em minúsculas
      id: element.id || 'N/A', // ID do elemento ou 'N/A' se não houver
      tabindex: element.tabIndex, // Valor do tabindex
      tabbable: isTabbable // Se o elemento é tabulável
    });

    // Se o elemento for tabulável, adiciona à lista de acessíveis por teclado
    if (isTabbable) {
      results.accessibleByKeyboard.push({
        tag: element.tagName.toLowerCase(),
        id: element.id || 'N/A',
        tabindex: element.tabIndex
      });
    }
  });

  console.log(results);
  return results;
};

export default checkKeyboardAccessibility;