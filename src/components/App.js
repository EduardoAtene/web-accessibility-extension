import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from './Select/Select';
import Button from './Button/Button';
import Header from './Header/Header';
import Checkbox from './Checkbox/Checkbox';
import { DIRECTIVES } from './../const/config';

const App = () => {
  const [selectedDirective, setSelectedDirective] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  const handleVerify = () => {
    const action = selectAll ? 'checkAllAccessibility' : 'checkSpecificAccessibility';
    const directiveToCheck = selectAll ? null : selectedDirective;

    // Obtém a aba ativa antes de enviar a mensagem
    debugger

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('Tabs:', tabs);
      debugger
      const currentTab = tabs[0];
      if (currentTab) {
        // Envia a mensagem com o ID da aba e os dados relevantes
        window.chrome.runtime.sendMessage(
          { action, directive: directiveToCheck, tabId: currentTab.id },
          (response) => {
            console.log('ResponsAQQQ:', response);
          }
        );
      } else {
        console.error('Nenhuma aba ativa encontrada.');
      }
    });
  };

  const handleCheckboxChange = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedDirective(''); // Limpa a seleção de diretrizes se "Selecionar Todas" estiver marcado
    }
  };

  return (
    <div className="container">
      <Header size="medium">Verificador de Diretrizes de Acessibilidade</Header>
      <Checkbox
        id="selectAll"
        checked={selectAll}
        onChange={handleCheckboxChange}
        label="Verificar Todas Diretrizes"
      />
      {!selectAll && (
        <Select
          id="getDOM"
          value={selectedDirective}
          onChange={(e) => setSelectedDirective(e.target.value)}
          options={DIRECTIVES}
          label="Selecione uma Diretriz:"
        />
      )}
      <Button onClick={handleVerify}>Verificar</Button>
    </div>
  );
};

export default App;
