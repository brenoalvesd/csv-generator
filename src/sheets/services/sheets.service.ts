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
  async convertToCsv(url: string): Promise<{ csv: string; filename: string }> {
    // Busca os dados da planilha
    const sheetData = await this.googleSheetsClient.fetchSpreadsheet(url);

    // Formata os dados
    const formattedData = this.dataFormatter.formatSheetData(sheetData);

    // Gera o CSV
    const csv = this.csvGenerator.generateCsv(formattedData);

    // Gera o nome do arquivo
    const filename = this.csvGenerator.generateFileName(
      formattedData.spreadsheetTitle,
    );

    return { csv, filename };
  }
}
