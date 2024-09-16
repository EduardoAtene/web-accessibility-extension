import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Select from './Select/Select';
import Button from './Button/Button';
import Header from './Header/Header';
import Checkbox from './Checkbox/Checkbox';
import { DIRECTIVES } from './../const/config';

const App = () => {
  const [selectedDirective, setSelectedDirective] = useState('');
  const [selectAll, setSelectAll] = useState(true);

  const handleVerify = () => {
    if (selectAll) {
      console.log('Verificando todas as diretrizes');
    } else {
      console.log('Diretriz selecionada:', selectedDirective);
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