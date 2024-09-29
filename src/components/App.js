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
        setResults(message.results); 
        console.log('Resultados da análise:', message.results);
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
      
    </div>
  );
};

export default App;
