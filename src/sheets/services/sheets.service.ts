import { Injectable } from '@nestjs/common';
import { GoogleSheetsClient } from '@sheets/clients/google-sheets.client';
import { DataFormatterService } from '@sheets/services/data-formatter.service';
import { CsvGeneratorService } from '@sheets/services/csv-generator.service';
import { ColumnDefinitionDto, ColumnType } from '@sheets/dto/column-definition.dto';

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
      columns?: (string | ColumnDefinitionDto)[];
      delimiter?: string;
    },
  ): Promise<{ csv: string; filename: string }> {
    // Busca os dados da planilha
    const sheetData = await this.googleSheetsClient.fetchSpreadsheet(
      url,
      options?.sheetId,
    );

    let dataToProcess = sheetData;
    let finalColumnDefinitions: ColumnDefinitionDto[] | undefined;

    // Normaliza e filtra colunas se solicitado
    if (options?.columns && options.columns.length > 0) {
      // 1. Normaliza input para array de ColumnDefinitionDto
      const normalizedColumns: ColumnDefinitionDto[] = options.columns.map(
        (col) => {
          if (typeof col === 'string') {
            return { name: col, type: ColumnType.STRING };
          }
          return col;
        },
      );

      // 2. Encontra índices das colunas desejadas
      const columnIndices = normalizedColumns
        .map((colDef) => ({
          index: sheetData.headers.indexOf(colDef.name),
          def: colDef,
        }))
        .filter((item) => item.index !== -1);

      if (columnIndices.length > 0) {
        // Filtra headers
        const filteredHeaders = columnIndices.map((item) => sheetData.headers[item.index]);
        finalColumnDefinitions = columnIndices.map((item) => item.def);

        // Filtra rows
        const filteredRows = sheetData.rows.map((row) =>
          columnIndices.map((item) => row[item.index]),
        );

        dataToProcess = {
          ...sheetData,
          headers: filteredHeaders,
          rows: filteredRows,
        };
      }
    }

    // Formata os dados usando as definições (se houver)
    const formattedData = this.dataFormatter.formatSheetData(
      dataToProcess,
      finalColumnDefinitions,
    );

    // Gera o CSV
    const csv = this.csvGenerator.generateCsv(
      formattedData,
      options?.delimiter,
    );

    // Gera o nome do arquivo
    const filename = this.csvGenerator.generateFileName(
      formattedData.spreadsheetTitle,
    );

    return { csv, filename };
  }
}
