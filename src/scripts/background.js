chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = message.tabId;

  if (message.action === 'checkAllAccessibility' || message.action === 'checkSpecificAccessibility') {
    console.log(`Ação recebida: ${message.action}, Tab ID: ${tabId}`);

    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ['scripts/axe.min.js']
      },
      () => {
        console.log('axe.min.js injetado na aba:', tabId);

        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: runAxAenalysis,
        });
      }
    );

    return true; // Indica que a resposta será enviada de forma assíncrona
  } else {
    console.error('Ação não reconhecida:', message.action);
    sendResponse({ status: 'error', message: 'Ação não reconhecida.' });
    return true;
  }
});

function runAxAenalysis() {
  axe.run((err, results) => {
    if (err) {
      console.error('Erro ao executar axe-core:', err);
      chrome.runtime.sendMessage({ status: 'error', message: 'Erro ao executar a análise de acessibilidade.' });
      return;
    }

    console.log('Resultados da análise de acessibilidade:', results);
    chrome.runtime.sendMessage({ status: 'success', results: results });
  });
}