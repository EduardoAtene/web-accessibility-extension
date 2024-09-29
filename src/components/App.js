import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from './Button/Button';
import Header from './Header/Header';
const App = () => {
  const [selectedDirective, setSelectedDirective] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [results, setResults] = useState(null);
  const [openIndex, setOpenIndex] = useState(null); 

  const handleVerify = () => {
    const action = selectAll ? 'checkAllAccessibility' : 'checkSpecificAccessibility';
    const directiveToCheck = selectAll ? null : selectedDirective;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        chrome.runtime.sendMessage(
          { action, directive: directiveToCheck, tabId: currentTab.id },
          (response) => {
            console.log('Resposta do background:', response);
          }
        );
      } else {
        console.error('Nenhuma aba ativa encontrada.');
      }
    });
  };

  useEffect(() => {
    const handleMessage = (message) => {
      if (message.status === 'success') {
        setResults(message.results.violations);
        console.log('Resultados da análise:', message.results.violations);
      } else if (message.status === 'error') {
        console.error('Erro:', message.message);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container">
      <Header size="medium">Verificador de Diretrizes de Acessibilidade</Header>
      <Button onClick={handleVerify}>Verificar</Button>
      {results && (
        <div className="accordion" id="accordionExample">
          <h3>Resultados da Análise:</h3>
          {results.map((result, index) => (
            <div className="accordion-item" key={index}>
              <h2 className="accordion-header" id={`heading${index}`}>
                <button
                  className={`accordion-button ${openIndex === index ? '' : 'collapsed'}`}
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  aria-expanded={openIndex === index}
                  aria-controls={`collapse${index}`}
                >
                  {result.description} (Impacto: {result.impact})
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse ${openIndex === index ? 'show' : ''}`}
                aria-labelledby={`heading${index}`}
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <p><strong>ID:</strong> {result.id}</p>
                  <p><strong>Impacto:</strong> {result.impact}</p>
                  <p><strong>Descrição:</strong> {result.description}</p>
                  <p><strong>Tags:</strong></p>
                  <ul>
                    {result.tags.map((tag, tagIndex) => (
                      <li key={tagIndex}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
