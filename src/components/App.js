import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from './Button/Button';
import Header from './Header/Header';
import { DIRECTIVES } from '../const/config';

const App = () => {
  const [results, setResults] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // Novo estado para filtro

  const getDirectiveLinkFromTag = (tags) => {
    const directiveTag = tags.find((tag) => DIRECTIVES.some((directive) => directive.value === tag));
  
    if (directiveTag) {
      const directive = DIRECTIVES.find((d) => d.value === directiveTag);
      
      return {
        url: `https://www.w3.org/TR/WCAG21/${directive.tag}`,
        label: directive.label,
      };
    }
  
    return {
      url: 'https://www.w3.org/TR/WCAG21/',
      label: 'Best Practice', 
    };
  };

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
        return 'bg-serious text-dark'; // Laranja
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

  // Filtrando resultados com base no impacto selecionado
  const filteredResults = filter === 'all' 
    ? results 
    : results.filter(result => result.impact === filter);

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

    </div>
  );
};

export default App;