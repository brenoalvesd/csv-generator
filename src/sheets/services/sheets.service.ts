import { Injectable } from '@nestjs/common';
import { GoogleSheetsClient } from '@sheets/clients/google-sheets.client';
import { DataFormatterService } from '@sheets/services/data-formatter.service';
import { CsvGeneratorService } from '@sheets/services/csv-generator.service';
import { SheetsData } from '@sheets/interfaces/sheets-data.interface';

@Injectable()
export class SheetsService {
  constructor(
    private readonly googleSheetsClient: GoogleSheetsClient,
    private readonly dataFormatter: DataFormatterService,
    private readonly csvGenerator: CsvGeneratorService,
  ) {}

  /**
   * Converte uma planilha pública do Google Sheets para CSV
   */
  async convertToCsv(
    url: string,
    options?: {
      sheetId?: string;
      columns?: string[];
      delimiter?: string;
    },
  ): Promise<{ csv: string; filename: string }> {
    // Busca os dados da planilha
    const sheetData = await this.googleSheetsClient.fetchSpreadsheet(
      url,
      options?.sheetId,
    );

    let dataToProcess = sheetData;

    // Filtra colunas se solicitado
    if (options?.columns && options.columns.length > 0) {
      // Encontra índices das colunas desejadas
      const columnIndices = options.columns
        .map((colName) => sheetData.headers.indexOf(colName))
        .filter((index) => index !== -1);

      if (columnIndices.length > 0) {
        // Filtra headers
        const filteredHeaders = columnIndices.map((i) => sheetData.headers[i]);

        // Filtra rows
        const filteredRows = sheetData.rows.map((row) =>
          columnIndices.map((i) => row[i]),
        );

        dataToProcess = {
          ...sheetData,
          headers: filteredHeaders,
          rows: filteredRows,
        };
      }
    }

    // Formata os dados
    const formattedData = this.dataFormatter.formatSheetData(dataToProcess);

    // Gera o CSV
    const csv = this.csvGenerator.generateCsv(formattedData, options?.delimiter);

    // Gera o nome do arquivo
    const filename = this.csvGenerator.generateFileName(
      formattedData.spreadsheetTitle,
    );

    return { csv, filename };
  }
}
