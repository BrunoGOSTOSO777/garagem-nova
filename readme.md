GaragemFinal/
├── imagens/
│   ├── carro.png
│   ├── carroesportivo.png
│   ├── caminhao.png
│   └── placeholder.png
├── index.html
├── style.css
└── script.js

# Garagem Inteligente e Manutenção - Versão Final

Este projeto é uma aplicação web completa para gerenciamento de uma frota de veículos, desenvolvida como consolidação de aprendizados em HTML, CSS e JavaScript Orientado a Objetos.

A aplicação permite ao usuário adicionar diferentes tipos de veículos, interagir com eles (ligar, acelerar, usar habilidades especiais) e gerenciar um histórico de manutenção completo para cada um, com todos os dados persistidos no navegador.

## Funcionalidades Implementadas

*   **Interface Unificada**: Todas as funcionalidades são acessíveis a partir de uma única tela coesa, com um layout de duas colunas para interação e gerenciamento.
*   **Gerenciamento de Frota**:
    *   Adição de diferentes tipos de veículos (Carro, Carro Esportivo, Caminhão).
    *   Navegação intuitiva para selecionar o veículo ativo.
*   **Interação com Veículos**:
    *   Controles básicos: Ligar, Desligar, Acelerar e Frear.
    *   Controles específicos baseados no tipo de veículo (ex: Ativar/Desativar Turbo para Carros Esportivos).
    *   Feedback visual em tempo real (indicador de status, velocímetro).
*   **Sistema de Manutenção e Agendamento**:
    *   Agendamento de novos serviços de manutenção com data, tipo, custo e descrição.
    *   Visualização do histórico de manutenções, separado por serviços passados e futuros.
    *   Painel de "Lembretes" que exibe automaticamente os serviços agendados para os próximos 7 dias.
*   **Persistência de Dados**:
    *   Todo o estado da garagem (veículos e seus históricos de manutenção) é salvo automaticamente no **LocalStorage** do navegador.
    *   Os dados são recarregados ao reabrir a aplicação, permitindo que o usuário continue de onde parou.
*   **Tratamento de Erros e Usabilidade**:
    *   A interface previne ações inválidas (ex: desligar um carro em movimento).
    *   Feedback claro é fornecido ao usuário através de alertas.
    *   Formulários possuem validação para garantir a integridade dos dados.

## Como Executar

1.  **Clone o repositório**:
    ```bash
    git clone [URL-DO-SEU-REPOSITORIO]
    ```
2.  **Estrutura de Arquivos**: Certifique-se de que a pasta `imagens` contém os arquivos `carro.png`, `carroesportivo.png`, `caminhao.png` e `placeholder.png`.
3.  **Abra no Navegador**: Abra o arquivo `index.html` em qualquer navegador web moderno (Chrome, Firefox, etc.).

Não é necessário nenhum servidor ou processo de compilação. A aplicação é totalmente client-side.

## Tecnologias Utilizadas

*   **HTML5**: Estrutura semântica da aplicação.
*   **CSS3**: Estilização, layout responsivo (Flexbox) e tema visual.
*   **JavaScript (ES6+)**:
    *   **Programação Orientada a Objetos (OOP)**: Uso de Classes para modelar Veículos e Manutenções.
    *   **Herança e Polimorfismo**.
    *   Manipulação do DOM para criar uma interface dinâmica.
    *   Uso da API do **LocalStorage** para persistência de dados.