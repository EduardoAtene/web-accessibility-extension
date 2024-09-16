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
    if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
      window.chrome.runtime.sendMessage(
        { action: 'checkKeyboardAccessibility' },
        (response) => {
          console.log('Response:', response);
        }
      );
    } else {
      console.error('Chrome API is not available. Make sure you are running this in a Chrome extension context.');
    }
  };
  const handleCheckboxChange = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedDirective(''); 
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
          id="directiveSelect"
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