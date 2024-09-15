import React from 'react';

const App = () => {
  const handleCaptureDOM = () => {
    window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      window.chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            window.chrome.runtime.sendMessage({ action: 'getDOM' }, (response) => {
              console.log('DOM capturado:', response.dom);
            });
          },
        }
      );
    });
  };

  const handleCheckAccessibility = () => {
    window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      window.chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          func: () => {
            window.chrome.runtime.sendMessage({ action: 'checkKeyboardAccessibility' }, (response) => {
              console.log('Resultados da verificação de acessibilidade por teclado:', response);
              // Aqui você pode fazer o que quiser com os resultados da verificação
            });
          },
        }
      );
    });
  };

  return (
    <div>
      <h1>Bem-vindo</h1>
      <button onClick={handleCaptureDOM}>Capturar DOM</button>
      <button onClick={handleCheckAccessibility}>Verificar Acessibilidade por Teclado</button>
    </div>
  );
};

export default App;