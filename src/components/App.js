import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from './Button/Button';
import Header from './Header/Header';

const App = () => {
  const [results, setResults] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(false); 

  const handleVerify = () => {
    setLoading(true);
    const action = 'checkAllAccessibility';
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (currentTab) {
        chrome.runtime.sendMessage(
          { action, tabId: currentTab.id },
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
        setLoading(false);
        console.log('Resultados da análise:', message.results.violations);
      } else if (message.status === 'error') {
        setLoading(false);
        console.error('Erro:', message.message);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const getPriorityValue = (impact) => {
    switch (impact) {
      case 'critical':
        return 1;
      case 'serious':
        return 2;
      case 'moderate':
        return 3;
      case 'minor':
        return 4;
      default:
        return 5;
    }
  };

  const getColor = (impact) => {
    switch (impact) {
      case 'critical':
        return 'bg-danger text-white'; // Vermelho
      case 'serious':
        return 'bg-warning text-dark'; // Laranja
      case 'moderate':
        return 'bg-warning text-dark'; // Amarelo
      case 'minor':
        return 'bg-success text-white'; // Verde
      default:
        return 'bg-light text-dark'; // Cinza para outros
    }
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container">
      <Header size="medium">Verificador de Diretrizes de Acessibilidade</Header>
      <Button onClick={handleVerify}>Verificar</Button>

      {loading && (
        <div className="text-center mt-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Verificando...</span>
          </div>
          <p className='textLoading'>Aguarde, a análise está em andamento...</p>
        </div>
      )}

      {!loading && results && (
        <div className="accordion" id="accordionExample">
          <h3>Resultados da Análise</h3>
          <h3>Violações: {results.length} </h3>
          {results
            .sort((a, b) => getPriorityValue(a.impact) - getPriorityValue(b.impact)) 
            .map((result, index) => (
              <div className="accordion-item" key={index}>
                <h2 className="accordion-header" id={`heading${index}`}>
                  <button
                    className={`accordion-button ${openIndex === index ? '' : 'collapsed'} ${getColor(result.impact)}`}
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
