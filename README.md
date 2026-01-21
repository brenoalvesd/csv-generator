# CSV Extract Module

Esta é uma aplicação NestJS desenvolvida para extrair dados de planilhas públicas do Google Sheets e convertê-los em arquivos CSV formatados. O módulo realiza automaticamente a formatação de datas, moedas e telefones, permitindo também selecionar abas e filtrar colunas.

## Funcionalidades

- **Extração via URL**: Converte planilhas do Google Sheets diretamente através da URL.
- **Suporte a Múltiplas Abas**: Permite especificar qual aba da planilha extrair usando o ID da aba (`sheetId` / `gid`).
- **Seleção e Tipagem de Colunas**: Permite escolher quais colunas exportar e definir explicitamente o tipo de dado de cada uma.
- **Formatação Inteligente**:
  - **Datas**: Converte para `DD/MM/YYYY`.
  - **Moedas**: Suporte para BRL, USD e EUR.
  - **Telefones**: Sanitização de números.
  - **Emails**: Padronização (lowercase).
- **Customização**: Escolha do delimitador do CSV (ex: `;` ou `,`).

## Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/ennable/csv-extract-module.git
cd csv-extract-module/csv-extract
```

2. Instale as dependências:
```bash
npm install
```

## Como Usar (Tutorial)

### 1. Preparar a Planilha
Para que a aplicação consiga acessar os dados, a planilha do Google Sheets deve estar configurada como **"Qualquer pessoa com o link"** pode visualizar.

### 2. Iniciar a Aplicação
Execute o comando abaixo para iniciar o servidor em modo de desenvolvimento:
```bash
npm run start:dev
```
O servidor estará rodando em `http://localhost:3000`.

### 3. Converter Planilha para CSV

Faça uma requisição `POST` para o endpoint `/sheets/convert`.

**Exemplo Simples (Automático):**
```json
{
  "url": "https://docs.google.com/spreadsheets/d/SEU_ID/edit"
}
```

**Exemplo Avançado (Com Tipagem e Filtros):**

Você pode passar o `sheetId` (o `gid` da URL) e configurar cada coluna.

```json
{
  "url": "https://docs.google.com/spreadsheets/d/SEU_ID/edit",
  "sheetId": "123456789", 
  "delimiter": ";",
  "columns": [
    "Empresa", 
    { "name": "Telefone", "type": "telephone" },
    { "name": "Faturamento", "type": "currency", "currency": "BRL" },
    { "name": "Custo Dólar", "type": "currency", "currency": "USD" },
    { "name": "Data Criação", "type": "date" },
    { "name": "Email Contato", "type": "email" },
    { "name": "Observações", "type": "string" }
  ]
}
```

### Tipos de Coluna Suportados

| Tipo | Descrição | Exemplo Entrada | Exemplo Saída |
|------|-----------|-----------------|---------------|
| `string` | Texto puro (Padrão) | `  Olá Mundo  ` | `Olá Mundo` |
| `date` | Data formatada | `2023-12-25` | `25/12/2023` |
| `currency` | Moeda (BRL, USD, EUR) | `1500.50` | `R$ 1.500,50` |
| `telephone`| Telefone (texto limpo) | `(11) 9999-8888` | `(11) 9999-8888` |
| `email` | Email formatado | `USER@Example.com ` | `user@example.com` |

## Executando Testes

```bash
# Testes unitários
npm run test

# Cobertura de testes
npm run test:cov
```
