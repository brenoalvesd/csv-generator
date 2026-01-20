import { Injectable } from '@nestjs/common';
import { createObjectCsvStringifier } from 'csv-writer';
import { SheetsData } from '@sheets/interfaces/sheets-data.interface';

@Injectable()
export class CsvGeneratorService {
  /**
   * Gera um arquivo CSV a partir dos dados da planilha
   */
  generateCsv(data: SheetsData): string {
    if (!data.headers || data.headers.length === 0) {
      throw new Error('Cannot generate CSV: headers are missing');
    }

    // Cria o stringifier CSV
    const csvStringifier = createObjectCsvStringifier({
      header: data.headers.map((header, index) => ({
        id: `col${index}`,
        title: header || `Column ${index + 1}`,
      })),
    });

    // Converte as linhas em objetos
    const records = data.rows.map((row) => {
      const record: Record<string, string> = {};
      data.headers.forEach((header, index) => {
        record[`col${index}`] = row[index] || '';
      });
      return record;
    });

    // Gera o CSV
    const headerString = csvStringifier.getHeaderString();
    const recordsString = csvStringifier.stringifyRecords(records);

    return headerString + recordsString;
  }

  /**
   * Gera o nome do arquivo CSV baseado no título da planilha
   */
  generateFileName(spreadsheetTitle?: string): string {
    if (spreadsheetTitle) {
      // Remove caracteres inválidos para nome de arquivo
      const sanitized = spreadsheetTitle
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()
        .substring(0, 50);
      return `${sanitized}.csv`;
    }
    return 'spreadsheet.csv';
  }
}
