chrome.runtime.onInstalled.addListener(() => {
  console.log('Background script está rodando baybbb.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') { // verificando só se está chamando o scriptszim por traz. ação é ping
    console.log('Recebido ping do content script');
    sendResponse({ result: 'pong' });
  }
  if (message.action === 'getDOM') { // verificar se ta puxando o html da página.
    console.log('DOM recebido do content script:', message.dom);
    sendResponse({ result: 'DOM recebido com sucesso' });
  }

  if (message.action === 'checkKeyboardAccessibility') {
    console.log('Resultado da verificação do key board acessibility:', message.result);
    sendResponse({ result: 'Verificação do atributo de linguagem realizada com sucesso', data: message.result });
  }

  if (message.action === 'checkLanguageAttribute') {
    console.log('Resultado da verificação do atributo de linguagem:', message.result);
    sendResponse({ result: 'Verificação do atributo de linguagem realizada com sucesso', data: message.result });
  }

});