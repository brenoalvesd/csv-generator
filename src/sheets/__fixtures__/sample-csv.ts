/**
 * Fixtures de CSV para testes
 */

export const sampleCsvSimple = `Nome,Idade,Cidade
João,30,São Paulo
Maria,25,Rio de Janeiro
Pedro,35,Belo Horizonte`;

export const sampleCsvWithEmptyCells = `Nome,Idade,Cidade,Email
João,30,São Paulo,joao@email.com
Maria,,Rio de Janeiro,maria@email.com
Pedro,35,,pedro@email.com`;

export const sampleCsvWithSpecialChars = `Nome,Valor,Data
José,1.234,56,15/01/2024
Maria,2.500,00,20/02/2024
João,R$ 3.000,00,25/03/2024`;

export const sampleCsvEmpty = '';

export const sampleCsvOnlyHeaders = `Nome,Idade,Cidade`;

export const sampleCsvWithNumbers = `Produto,Preço,Quantidade
Notebook,2500.50,10
Mouse,45.99,50
Teclado,120.00,30`;

export const sampleCsvWithDates = `Evento,Data Início,Data Fim
Conferência,2024-01-15,2024-01-17
Workshop,2024/02/20,2024/02/21
Seminário,15-03-2024,17-03-2024`;
