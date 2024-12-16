# Inclusite

O **Inclusite** é uma extensão para navegadores que automatiza a verificação de acessibilidade em websites com base nas diretrizes WCAG. A extensão ajuda desenvolvedores a identificar problemas de acessibilidade em seus sites e sugere ajustes para melhorar a experiência de navegação para pessoas com deficiência.

## Funcionalidades

- Verificação de conformidade com diretrizes WCAG 2.1.
- Identificação de problemas de acessibilidade, como contraste de cores, navegação por teclado, e uso de ARIA.
- Sugestões de correção para cada problema encontrado.
- Relatórios detalhados sobre a acessibilidade de uma página web.

## Pré-requisitos

Antes de começar, certifique-se de ter o **Node.js** e o **npm** instalados na sua máquina. Você pode verificar se eles estão instalados com os seguintes comandos:

```bash
node -v npm -v
```

Se não tiver o **Node.js** instalado, acesse [https://nodejs.org](https://nodejs.org) para fazer o download e instalação.

## Instalação


### Usando a Chrome Web Store

A extensão **Inclusite** também está disponível para instalação diretamente pela [Chrome Web Store](https://chromewebstore.google.com/detail/inclusite/pijfafiohjkmmdecmimemikmjnfdjeck). Basta clicar no link e adicionar a extensão ao seu navegador.

### Usando o código-fonte

1. Clone o repositório para a sua máquina local:
```bash
https://github.com/EduardoAtene/web-accessibility-extension
```

2. Instale as dependências do projeto:
```bash
npm install
```

3. Para construir a versão de produção da extensão, execute:
```bash
npm run build
```

Esse comando criará uma pasta `build/` com os arquivos otimizados para produção.

## Instalando a Extensão no Navegador

1. Abra o navegador e vá para a página de extensões:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   
2. Ative o modo de desenvolvedor (no canto superior direito).

3. Clique em "Carregar sem compactação" ou "Load unpacked" e selecione a pasta `build/` gerada após o comando `npm run build`.

Agora a extensão estará disponível no seu navegador, e você poderá usá-la para verificar a acessibilidade das páginas web.

## Contribuindo

Sinta-se à vontade para contribuir com melhorias, correções de bugs ou novas funcionalidades. Para isso, siga os passos abaixo:

1. Faça um fork deste repositório.
2. Crie uma nova branch (`git checkout -b minha-nova-feature`).
3. Faça as mudanças necessárias e commit (`git commit -am 'Adiciona nova feature'`).
4. Envie para o repositório (`git push origin minha-nova-feature`).
5. Abra um pull request no GitHub.

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais informações.

## Contato

- [Eduardo Atene Silva](https://github.com/EduardoAtene)
  - Email: eduardoatenesilvamarinha@gmail.com 
- [Pedro Mozany](https://github.com/PedroMozany)
  - Email: pedro.mozanny@gmail.com
