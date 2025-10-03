# Garagem Inteligente - Projeto Full-Stack

Este projeto é uma aplicação web completa para gerenciamento de uma frota de veículos, agora com integração a um backend Node.js/Express para funcionalidades online, como a previsão do tempo.

## ✨ Funcionalidades

*   **Frontend (Client-Side)**:
    *   **Gerenciamento de Frota**: Adição de Carros, Carros Esportivos e Caminhões.
    *   **Interação com Veículos**: Controles de Ligar, Acelerar, Frear e habilidades especiais.
    *   **Sistema de Manutenção**: Agendamento e visualização de histórico de serviços.
    *   **Persistência de Dados**: O estado da garagem é salvo no **LocalStorage** do navegador.
    *   **Planejador de Viagem Interativo**: Consulta a previsão do tempo de qualquer cidade do mundo.

*   **Backend (Server-Side)**:
    *   **API Proxy Segura**: Um endpoint (`/api/previsao/:cidade`) que busca dados da API OpenWeatherMap.
    *   **Proteção da API Key**: A chave da API da OpenWeatherMap é mantida em segurança no servidor, nunca exposta no frontend.
    *   **CORS Habilitado**: Permite que o frontend (hospedado em qualquer lugar) acesse a API do backend.

## 🚀 Publicação (Deploy)

A aplicação está dividida em duas partes, publicadas em plataformas diferentes:

*   **Frontend**: Publicado no Vercel/Netlify/GitHub Pages.
    *   **Link da Aplicação**: `[SUA-URL-DO-FRONTEND-AQUI]`

*   **Backend**: Publicado no Render.com.
    *   **Link da API**: `[SUA-URL-DO-BACKEND-AQUI]`

## 🛠️ Como Executar Localmente

Você precisará ter o [Node.js](https://nodejs.org/) instalado.

1.  **Clone o repositório**:
    ```bash
    git clone [URL-DO-SEU-REPOSITORIO]
    cd [NOME-DA-PASTA-DO-PROJETO]
    ```

2.  **Configure o Backend**:
    *   Navegue até a pasta do projeto no terminal.
    *   Crie um arquivo chamado `.env` na raiz do projeto.
    *   Dentro do `.env`, adicione sua chave da API da OpenWeatherMap:
        ```
        OPENWEATHER_API_KEY=sua_chave_secreta_aqui
        ```
    *   Instale as dependências do backend:
        ```bash
        npm install
        ```
    *   Inicie o servidor backend:
        ```bash
        npm start
        ```
        O servidor estará rodando em `http://localhost:3001`.

3.  **Execute o Frontend**:
    *   Verifique se a variável `backendBaseUrl` no arquivo `main.js` está apontando para `http://localhost:3001`.
    *   Abra o arquivo `index.html` em seu navegador.

A aplicação agora deve funcionar completamente no seu computador.

## 💻 Tecnologias Utilizadas

*   **Frontend**: HTML5, CSS3, JavaScript (ES6+ com Módulos e Classes).
*   **Backend**: Node.js, Express.js, Axios, Dotenv.
*   **Plataformas de Deploy**: Render.com (Backend), Vercel/Netlify (Frontend).
*   **APIs Externas**: OpenWeatherMap API.