import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from './Select/Select';
import Button from './Button/Button';
import Header from './Header/Header';
import Checkbox from './Checkbox/Checkbox';
import { DIRECTIVES } from './../const/config';

const App = () => {
  const [selectedDirective, setSelectedDirective] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [results, setResults] = useState(null); // Para armazenar os resultados

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
        debugger 
        
        console.log('Resultados da análise:', message.results.violations);
      } else if (message.status === 'error') {
        console.error('Erro:', message.message);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);

    // Limpa o listener ao desmontar o componente
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleCheckboxChange = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedDirective(''); // Limpa a seleção de diretrizes se "Selecionar Todas" estiver marcado
    }
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
                <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${index}`} aria-expanded={index === 0 ? "true" : "false"} aria-controls={`collapse${index}`}>
                  {result.description} (Impacto: {result.impact})
                </button>
              </h2>
              <div id={`collapse${index}`} className={`accordion-collapse collapse ${index === 0 ? "show" : ""}`} aria-labelledby={`heading${index}`} data-bs-parent="#accordionExample">
                <div className="accordion-body">
                  <p><strong>ID:</strong> {result.id}</p>
                  <p><strong>Impacto:</strong> {result.impact}</p>
                  <p><strong>Descrição:</strong> {result.description}</p>
                  <p><strong>Ajuda:</strong> <a href={result.helpUrl} target="_blank" rel="noopener noreferrer">{result.help}</a></p>
                  <strong>Resumo de Falha:</strong>
                  <ul>
                    {result.nodes.map((node, nodeIndex) => (
                      <li key={nodeIndex}>
                        <p><strong>Impacto:</strong> {node.impact}</p>
                        <p><strong>Mensagem:</strong> {node.any.length > 0 ? node.any[0].message : "N/A"}</p>
                        <p><strong>HTML:</strong> <code>{node.html}</code></p>
                        <p><strong>Target:</strong> {node.target.join(", ")}</p>
                        <p><strong>Resumo de Falha:</strong> {node.failureSummary}</p>
                      </li>
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
