chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Verifica se o sender.tab está definido
    const tabId = message.tabId;

    // Processa a mensagem recebida
  if (message.action === 'checkAllAccessibility' || message.action === 'checkSpecificAccessibility') {
    console.log(`Ação recebida: ${message.action}, Tab ID: ${tabId}`);
    debugger
    // Injeta o script axe.min.js na aba correspondente
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        files: ['scripts/axe.min.js']
      },
      () => {
        console.log('axe.min.js injetado na aba:', tabId);

        // Executa a função de análise após o script ser injetado
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: runAxAenalysis,
        });
      }
    );

    // Responde ao popup
    sendResponse({ status: 'success', message: 'Análise de acessibilidade iniciada.'});
  } else {
    console.error('Ação não reconhecida:', message.action);
    sendResponse({ status: 'error', message: 'Ação não reconhecida.' });
  }
  // Retorna true para indicar que a resposta será enviada de forma assíncrona
  return true;
});

// Função que realiza a análise de acessibilidade
function runAxAenalysis() {
  axe.run((err, results) => {
    if (err) {
      console.error('Erro ao executar axe-core:', err);
      return;
    }
    console.log('Resultados da análise de acessibilidade:', results);
    
    sendResponse({ status: 'success', message: resu});

    // Envia os resultados de volta para o popup ou processa conforme necessário
    chrome.runtime.sendMessage({ accessibilityResults: results });
  });
}