import { SheetsData } from '../interfaces/sheets-data.interface';

/**
 * Fixtures de SheetsData para testes
 */

export const sampleSheetsDataSimple: SheetsData = {
  headers: ['Nome', 'Idade', 'Cidade'],
  rows: [
    ['João', '30', 'São Paulo'],
    ['Maria', '25', 'Rio de Janeiro'],
    ['Pedro', '35', 'Belo Horizonte'],
  ],
  spreadsheetId: 'test123',
  spreadsheetTitle: 'Test Spreadsheet',
};

export const sampleSheetsDataEmpty: SheetsData = {
  headers: [],
  rows: [],
  spreadsheetId: 'empty123',
};

export const sampleSheetsDataWithEmptyCells: SheetsData = {
  headers: ['Nome', 'Idade', 'Cidade', 'Email'],
  rows: [
    ['João', '30', 'São Paulo', 'joao@email.com'],
    ['Maria', '', 'Rio de Janeiro', 'maria@email.com'],
    ['Pedro', '35', '', 'pedro@email.com'],
  ],
  spreadsheetId: 'emptycells123',
};

export const sampleSheetsDataWithNumbers: SheetsData = {
  headers: ['Produto', 'Preço', 'Quantidade'],
  rows: [
    ['Notebook', '2500.50', '10'],
    ['Mouse', '45.99', '50'],
    ['Teclado', '120.00', '30'],
  ],
  spreadsheetId: 'numbers123',
};

export const sampleSheetsDataWithDates: SheetsData = {
  headers: ['Evento', 'Data Início', 'Data Fim'],
  rows: [
    ['Conferência', '2024-01-15', '2024-01-17'],
    ['Workshop', '2024/02/20', '2024/02/21'],
    ['Seminário', '15-03-2024', '17-03-2024'],
  ],
  spreadsheetId: 'dates123',
};

export const sampleSheetsDataWithCurrency: SheetsData = {
  headers: ['Produto', 'Valor'],
  rows: [
    ['Produto A', '1234.56'],
    ['Produto B', '1234,56'],
    ['Produto C', '1.234,56'],
    ['Produto D', '1,234.56'],
  ],
  spreadsheetId: 'currency123',
};
