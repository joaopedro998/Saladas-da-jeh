# 🥗 Salada da Jeh - Cardápio Interativo com Pedido via WhatsApp

Este é o repositório do projeto "Salada da Jeh", uma landing page interativa desenvolvida para permitir que clientes montem suas próprias saladas e enviem o pedido diretamente para o WhatsApp do restaurante.

---

## 📜 Descrição

O projeto consiste em uma única página web (single page) que funciona como um cardápio digital e interativo. O objetivo é oferecer uma experiência de usuário simples e direta, onde o cliente pode visualizar as opções, personalizar seu pedido e finalizá-lo de forma rápida, sem a necessidade de um sistema complexo de e-commerce ou login.

A solução é ideal para pequenos negócios que utilizam o WhatsApp como principal canal de comunicação e vendas.

---

## ✨ Funcionalidades Principais

* **Montagem de Salada por Etapas:** O cliente escolhe os ingredientes em seções organizadas (Base, Proteína, Molho).
* **Interface Interativa:** Ao clicar em uma opção, ela é visualmente destacada e adicionada ao resumo do pedido.
* **Cálculo de Preço em Tempo Real:** O valor total do pedido é atualizado automaticamente a cada seleção.
* **Resumo do Pedido:** Uma área dedicada exibe todos os itens selecionados e o custo total de forma clara.
* **Coleta de Dados do Cliente:** Campos para o cliente inserir nome e endereço de entrega.
* **Integração com WhatsApp:** Um botão "Finalizar Pedido" gera uma mensagem padronizada com todos os detalhes do pedido e abre o WhatsApp, pronto para ser enviada.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído utilizando apenas tecnologias web front-end, garantindo leveza, rapidez e facilidade de hospedagem.

* **HTML5:** Para a estrutura e semântica do conteúdo.
* **CSS3:** Para a estilização, layout responsivo e design visual.
* **JavaScript (Vanilla):** Para toda a interatividade, manipulação de eventos, cálculos e integração com a API do WhatsApp.

---

## ⚙️ Como Utilizar

Para rodar este projeto localmente ou para personalizá-lo para o seu negócio, siga os passos abaixo.

### 1. Clone ou Baixe o Repositório

Você pode clonar este repositório usando Git:
```bash
git clone https://https://github.com/joaopedro998/Saladas-da-jeh/tree/main)
```
Ou simplesmente baixar o arquivo `index.html`.

### 2. Personalize o Número de WhatsApp (Passo Essencial!)

Para que os pedidos cheguem até você, é crucial alterar o número de telefone no código.

* Abra o arquivo `index.html` em um editor de código (como o VS Code).
* Navegue até o final do arquivo, dentro da tag `<script>`.
* Encontre a seguinte linha:
    ```javascript
    const numeroWhatsApp = '5535000000000';
    ```
* **Substitua `'5535000000000'`** pelo seu número de WhatsApp, mantendo o formato: código do país (55 para Brasil) + DDD + seu número, tudo junto.

### 3. Personalize o Cardápio

Você pode facilmente alterar, adicionar ou remover itens do cardápio editando o HTML. Cada item é um `<div>` com a classe `.opcao`. Por exemplo:

```html
<!-- Exemplo de item de proteína -->
<div class="opcao" data-nome="Frango Grelhado" data-preco="10.00">
    <div class="nome">Frango Grelhado</div>
    <div class="preco">R$ 10,00</div>
</div>
```
Basta alterar os valores em `data-nome`, `data-preco` e o texto dentro das divs `.nome` e `.preco`.

---

## 🌐 Como Colocar Online (Deploy)

A forma mais simples de hospedar este site gratuitamente é utilizando plataformas como:

* [**Netlify**](https://www.netlify.com/): Permite que você arraste e solte o arquivo `index.html` para publicar.
* [**Vercel**](https://vercel.com/): Similar ao Netlify, com um processo de deploy muito simples.
* [**GitHub Pages**](https://pages.github.com/): Ideal se você já estiver usando o GitHub para versionar seu código.

Após o deploy, você terá um link público para o seu cardápio.

---

## 📲 Gerando o QR Code

Com o link do seu site em mãos, utilize um gerador de QR Code gratuito (como o [QRCode Monkey](https://www.qrcode-monkey.com/pt/)) para criar uma imagem que seus clientes possam escanear. Cole o link do seu site, gere o código e baixe a imagem para imprimir e usar onde quiser!

