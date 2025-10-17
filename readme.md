# Garagem Inteligente - Projeto Full-Stack

Este projeto é uma aplicação web completa para gerenciamento de uma frota de veículos, com um frontend interativo e um backend robusto em Node.js que serve dados através de uma API REST.

## 🚀 Links da Aplicação Publicada

*   **Frontend (Vercel/Netlify)**: [COLE AQUI O LINK DO SEU FRONTEND PUBLICADO]
*   **Backend (Render)**: [COLE AQUI O LINK DO SEU BACKEND PUBLICADO]

---

## ✨ Funcionalidades

*   **Gerenciamento de Frota**: Adicione, selecione e interaja com diferentes tipos de veículos (Carro, Carro Esportivo, Caminhão).
*   **Controles Interativos**: Ligue, desligue, acelere e freie os veículos com feedback visual em tempo real.
*   **Sistema de Manutenção**: Agende e visualize o histórico de manutenções para cada veículo.
*   **Persistência de Dados**: O estado da garagem é salvo no LocalStorage, mantendo os dados entre as sessões.
*   **Planejador de Viagem**: Consuma uma API externa através do nosso backend para ver a previsão do tempo de 5 dias para qualquer cidade.
*   **Dicas de Manutenção**: Obtenha dicas gerais ou específicas para cada tipo de veículo diretamente do backend.

---

## 📖 Documentação da API do Backend

A API fornece múltiplos endpoints para consulta de dados.

### 1. Previsão do Tempo

Busca a previsão do tempo de 5 dias para uma cidade.

*   **Método**: `GET`
*   **Endpoint**: `/api/previsao/:cidade`
*   **Exemplo**: `/api/previsao/Londrina`
*   **Resposta de Sucesso (200 OK)**:
    ```json
    {
      "cod": "200",
      "list": [ /* ... array com dados da previsão ... */ ]
    }
    ```
*   **Resposta de Erro (404 Not Found)**:
    ```json
    { "error": "Cidade não encontrada." }
    ```

### 2. Dicas de Manutenção Gerais

Retorna uma lista de dicas de manutenção aplicáveis a qualquer veículo.

*   **Método**: `GET`
*   **Endpoint**: `/api/dicas-manutencao`
*   **Resposta de Sucesso (200 OK)**:
    ```json
    [
        { "id": 1, "dica": "Verifique o nível do óleo do motor regularmente." },
        { "id": 2, "dica": "Calibre os pneus semanalmente para economizar combustível." }
    ]
    ```

### 3. Dicas de Manutenção Específicas

Retorna dicas de manutenção para um tipo específico de veículo.

*   **Método**: `GET`
*   **Endpoint**: `/api/dicas-manutencao/:tipoVeiculo`
*   **Parâmetros**: `tipoVeiculo` pode ser `carro`, `moto`, ou `caminhao`.
*   **Exemplo**: `/api/dicas-manutencao/caminhao`
*   **Resposta de Sucesso (200 OK)**:
    ```json
    [
        { "id": 30, "dica": "Verifique o sistema de freios a ar e drene os reservatórios." }
    ]
    ```
*   **Resposta de Erro (404 Not Found)**:
    ```json
    { "error": "Nenhuma dica encontrada para o tipo de veículo: trator" }
    ```

---

## 🛠️ Como Executar Localmente

**Pré-requisitos**: [Node.js](https://nodejs.org/) instalado.

1.  **Clone o repositório**:
    ```bash
    git clone [URL-DO-SEU-REPOSITORIO]
    cd [NOME-DA-PASTA]
    ```

2.  **Configure o Backend**:
    *   Crie um arquivo chamado `.env` na raiz do projeto.
    *   Dentro do `.env`, adicione sua chave da API da OpenWeatherMap:
        ```
        OPENWEATHER_API_KEY=sua_chave_secreta_aqui
        ```
    *   Instale as dependências:
        ```bash
        npm install
        ```
    *   Inicie o servidor backend:
        ```bash
        npm start
        ```
    O servidor estará rodando em `http://localhost:3001`.

3.  **Execute o Frontend**:
    *   No arquivo `main.js`, certifique-se que a variável `backendBaseUrl` está como `'http://localhost:3001'`.
    *   Abra o arquivo `index.html` em seu navegador.

## 💻 Tecnologias Utilizadas

*   **Frontend**: HTML5, CSS3, JavaScript (ES6+ com Módulos e Classes)
*   **Backend**: Node.js, Express.js
*   **Plataformas de Deploy**: Render (Backend), Vercel/Netlify (Frontend)
*   **APIs**: OpenWeatherMap API

---

## 💾 Conexão com Banco de Dados (MongoDB Atlas)

A aplicação agora utiliza um banco de dados persistente na nuvem (MongoDB Atlas) para futuras operações de CRUD (Criar, Ler, Atualizar, Deletar).

### Variáveis de Ambiente Necessárias

Para rodar o projeto, as seguintes variáveis de ambiente precisam ser configuradas no arquivo `.env` (localmente) ou na plataforma de deploy (Render):

-   `OPENWEATHER_API_KEY`: Chave da API do OpenWeatherMap.
-   `MONGO_URI_CRUD`: A string de conexão segura para o cluster do MongoDB Atlas.