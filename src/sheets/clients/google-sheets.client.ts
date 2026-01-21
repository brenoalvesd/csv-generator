import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { parse } from 'csv-parse/sync';
import { SheetsData } from '@sheets/interfaces/sheets-data.interface';

@Injectable()
export class GoogleSheetsClient {
  /**
   * Extrai o ID da planilha a partir da URL do Google Sheets
   */
  extractSpreadsheetId(url: string): string {
    const patterns = [
      /\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/,
      /\/d\/([a-zA-Z0-9-_]+)/,
      /id=([a-zA-Z0-9-_]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    throw new BadRequestException('Invalid Google Sheets URL. Could not extract spreadsheet ID.');
  }

  /**
   * Valida se a URL é uma URL válida do Google Sheets
   */
  isValidGoogleSheetsUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.hostname.includes('google.com') &&
        (urlObj.pathname.includes('/spreadsheets/') || urlObj.searchParams.has('id'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Busca dados de uma planilha pública do Google Sheets usando exportação CSV
   */
  async fetchSpreadsheet(url: string, sheetId?: string): Promise<SheetsData> {
    if (!this.isValidGoogleSheetsUrl(url)) {
      throw new BadRequestException('Invalid Google Sheets URL.');
    }

    const spreadsheetId = this.extractSpreadsheetId(url);
    const gid = sheetId ? `&gid=${sheetId}` : '&gid=0';

    try {
      // URL de exportação CSV do Google Sheets (planilhas públicas)
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv${gid}`;
      
      const response = await axios.get(exportUrl, {
        responseType: 'text',
        timeout: 30000,
      });

      if (!response.data || response.data.trim() === '') {
        throw new BadRequestException('Spreadsheet is empty or could not be accessed.');
      }

      // Parse do CSV
      const records = parse(response.data, {
        skip_empty_lines: true,
        relax_column_count: true,
      }) as string[][];

      if (records.length === 0) {
        throw new BadRequestException('Spreadsheet is empty.');
      }

      const headers = records[0] || [];
      const rows = records.slice(1);

      return {
        headers,
        rows,
        spreadsheetId,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403 || error.response?.status === 404) {
          throw new UnauthorizedException(
            'Cannot access spreadsheet. Make sure the spreadsheet is publicly accessible.',
          );
        }
        throw new BadRequestException(
          `Failed to fetch spreadsheet: ${error.message}`,
        );
      }
      throw new BadRequestException(
        `Failed to fetch spreadsheet: ${error.message}`,
      );
    }
  }
}
