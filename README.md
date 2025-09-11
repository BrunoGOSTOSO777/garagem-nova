# Garagem Inteligente Unificada - Missão Final

## Visão Geral

Este projeto é uma aplicação web completa para gerenciamento de uma frota de veículos, desenvolvida para demonstrar o domínio de conceitos avançados de JavaScript, incluindo Programação Orientada a Objetos (OOP), Módulos ES6, persistência de dados e documentação de código profissional.

A aplicação permite ao usuário adicionar diferentes tipos de veículos, interagir com eles em tempo real e gerenciar um histórico de manutenção completo, com todos os dados salvos localmente no navegador.

## Funcionalidades Principais

- **Código Organizado**: Todas as classes (Veiculo, Carro, Manutencao, etc.) são modularizadas em arquivos separados dentro de um diretório `classes/`, promovendo um código limpo e de fácil manutenção.
- **Documentação JSDoc**: Todo o código-fonte é documentado seguindo o padrão JSDoc, explicando o propósito de cada classe, método, seus parâmetros (`@param`) e valores de retorno (`@returns`).
- **Gerenciamento de Frota**: Adição dinâmica de veículos de diferentes tipos (Carro, Carro Esportivo, Caminhão).
- **Interação Realista**: Controles para ligar, desligar, acelerar e frear, com feedback visual imediato.
- **Polimorfismo em Ação**: Habilidades especiais, como o "Turbo" do Carro Esportivo, são implementadas sobrescrevendo métodos da classe base.
- **Sistema de Manutenção**: Agendamento de serviços com data, tipo, custo e descrição, com um histórico claro para cada veículo.
- **Persistência de Dados**: O estado completo da garagem é salvo no **LocalStorage** do navegador, garantindo que os dados do usuário não sejam perdidos ao fechar a página.

## Estrutura do Projeto

O projeto está organizado da seguinte forma para garantir escalabilidade e clareza:

```
/
├── classes/            # Contém todas as definições de classes (módulos)
│   ├── Manutencao.js
│   ├── Veiculo.js
│   ├── Carro.js
│   ├── ...
│   └── Garagem.js
├── imagens/            # Contém as imagens dos veículos
├── index.html          # Ponto de entrada da aplicação (a view)
├── style.css           # Folha de estilos
├── main.js             # Script principal que inicializa a aplicação e gerencia a UI
└── README.md           # Esta documentação
```

- **`main.js`**: Atua como o "orquestrador". Ele importa as classes necessárias, inicializa a aplicação, configura os listeners de eventos e chama as funções que atualizam a interface.
- **`classes/`**: Cada arquivo define e exporta uma única classe, seguindo o Princípio da Responsabilidade Única.

## Como Executar Localmente

1.  **Clone o repositório**:
    ```bash
    git clone [URL-DO-SEU-REPOSITORIO]
    ```
2.  **Abra o `index.html`**: Navegue até a pasta do projeto e abra o arquivo `index.html` em um navegador web moderno.

**Importante**: Devido ao uso de Módulos ES6 (`import`/`export`), o `index.html` **deve ser servido por um servidor web** para funcionar corretamente em alguns navegadores (como o Chrome, por questões de segurança CORS). A maneira mais fácil de fazer isso é usando a extensão "Live Server" no Visual Studio Code.

## Tecnologias Utilizadas

- **HTML5**
- **CSS3** (Flexbox)
- **JavaScript (ES6+)**
  - Programação Orientada a Objetos (Classes, Herança, Polimorfismo)
  - Módulos ES6 (`import`, `export`)
  - Manipulação do DOM
  - API do LocalStorage
- **JSDoc** para documentação de código.