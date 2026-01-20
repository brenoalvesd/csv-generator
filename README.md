# CSV Extract Module

Esta é uma aplicação NestJS desenvolvida para extrair dados de planilhas públicas do Google Sheets e convertê-los em arquivos CSV formatados. O módulo realiza automaticamente a formatação de datas, moedas (BRL) e números seguindo os padrões brasileiros.

## Funcionalidades

- **Extração via URL**: Converte planilhas do Google Sheets diretamente através da URL.
- **Formatação Automática**: 
  - Datas: Converte diversos formatos para `DD/MM/YYYY`.
  - Moeda: Formata valores monetários para o padrão `R$ 1.234,56`.
  - Números: Aplica separadores de milhar e decimal brasileiros (`1.234,56`).
- **Download Direto**: O endpoint retorna o arquivo CSV pronto para download.

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
Faça uma requisição `POST` para o endpoint `/sheets/convert` enviando a URL da planilha no corpo da mensagem.

**Exemplo com cURL:**
```bash
curl -X POST http://localhost:3000/sheets/convert \
     -H "Content-Type: application/json" \
     -d '{"url": "https://docs.google.com/spreadsheets/d/ID_DA_SUA_PLANILHA/edit"}' \
     --output minha_planilha.csv
```

**Exemplo de Corpo da Requisição (JSON):**
```json
{
  "url": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
}
```

A resposta será o conteúdo do arquivo CSV com os cabeçalhos e linhas processados e formatados.

## Executando Testes

```bash
# Testes unitários
npm run test

# Cobertura de testes
npm run test:cov
```

## Estrutura do Projeto

- `src/sheets`: Módulo principal contendo a lógica de extração e conversão.
- `src/sheets/services`: Lógica de negócio (formatação e geração de CSV).
- `src/test`: Suíte de testes unitários e fixtures.
