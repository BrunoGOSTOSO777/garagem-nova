# Garagem Inteligente - Projeto Full-Stack

Este projeto é uma aplicação web completa para gerenciamento de uma frota de veículos, agora com integração a um backend Node.js/Express para funcionalidades online, como previsão do tempo e dicas de manutenção.

## ✨ Funcionalidades

*   **Frontend (Client-Side)**: Gerenciamento de frota, interação com veículos, sistema de manutenção, persistência de dados no LocalStorage e planejador de viagem.
*   **Backend (Server-Side)**: Uma API REST que fornece dados de forma segura e centralizada.

## 🚀 Publicação (Deploy)

*   **Frontend**: Pode ser publicado em qualquer serviço de hospedagem estática (Vercel, Netlify, GitHub Pages).
*   **Backend**: Projetado para ser publicado no Render.com.

---

## 📖 Documentação da API do Backend

A URL base para testes locais é `http://localhost:3001`.

### Previsão do Tempo

*   **Endpoint**: `GET /api/previsao/:cidade`
*   **Descrição**: Busca a previsão do tempo de 5 dias para uma cidade específica.
*   **Parâmetros de Rota**:
    *   `cidade` (obrigatório): O nome da cidade. Ex: `Curitiba`.
*   **Query Parameters**:
    *   `unidade` (opcional): A unidade de temperatura. `metric` para Celsius, `imperial` para Fahrenheit. Padrão: `metric`.
*   **Resposta de Sucesso (200 OK)**:
    ```json
    {
      "cod": "200",
      "list": [ /* ... dados da previsão ... */ ]
    }
    ```
*   **Resposta de Erro (404 Not Found)**:
    ```json
    { "error": "Cidade não encontrada." }
    ```

### Dicas de Manutenção

*   **Endpoint**: `GET /api/dicas-manutencao`
*   **Descrição**: Retorna uma lista de dicas gerais de manutenção de veículos.
*   **Resposta de Sucesso (200 OK)**:
    ```json
    [
        { "id": 1, "dica": "Verifique o nível do óleo do motor regularmente." },
        { "id": 2, "dica": "Calibre os pneus semanalmente para economizar combustível." }
    ]
    ```

*   **Endpoint**: `GET /api/dicas-manutencao/:tipoVeiculo`
*   **Descrição**: Retorna dicas específicas para um tipo de veículo.
*   **Parâmetros de Rota**:
    *   `tipoVeiculo` (obrigatório): O tipo do veículo. Valores válidos: `carro`, `moto`, `caminhao`.
*   **Resposta de Sucesso (200 OK)**:
    ```json
    [
        { "id": 10, "dica": "Faça o rodízio dos pneus a cada 10.000 km." }
    ]
    ```
*   **Resposta de Erro (404 Not Found)**:
    ```json
    { "error": "Nenhuma dica encontrada para o tipo de veículo: aviao" }
    ```

---

## 🛠️ Como Executar Localmente

Siga os passos do README anterior para configurar o arquivo `.env` e rodar `npm install` e `npm start`.