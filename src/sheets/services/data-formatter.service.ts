import { Injectable } from '@nestjs/common';
import { SheetsData } from '@sheets/interfaces/sheets-data.interface';

@Injectable()
export class DataFormatterService {
  /**
   * Formata um valor individual baseado no seu tipo detectado
   */
  formatValue(value: string): string {
    if (!value || value.trim() === '') {
      return '';
    }

    const trimmedValue = value.trim();

    // Tenta formatar como data
    const dateFormatted = this.formatDate(trimmedValue);
    if (dateFormatted !== trimmedValue) {
      return dateFormatted;
    }

    // Tenta formatar como moeda
    const currencyFormatted = this.formatCurrency(trimmedValue);
    if (currencyFormatted !== trimmedValue) {
      return currencyFormatted;
    }

    // Tenta formatar como número
    const numberFormatted = this.formatNumber(trimmedValue);
    if (numberFormatted !== trimmedValue) {
      return numberFormatted;
    }

    return trimmedValue;
  }

  /**
   * Formata datas para formato padrão (YYYY-MM-DD ou DD/MM/YYYY)
   */
  formatDate(value: string): string {
    // Padrões comuns de data
    const yyyyMMddPattern = /^(\d{4})-(\d{2})-(\d{2})/; // YYYY-MM-DD
    const ddMMyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})/; // DD/MM/YYYY
    const ddMMyyyyDashPattern = /^(\d{2})-(\d{2})-(\d{4})/; // DD-MM-YYYY
    const yyyyMMddSlashPattern = /^(\d{4})\/(\d{2})\/(\d{2})/; // YYYY/MM/DD

    // YYYY-MM-DD
    let match = value.match(yyyyMMddPattern);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }

    // YYYY/MM/DD
    match = value.match(yyyyMMddSlashPattern);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }

    // DD/MM/YYYY ou DD-MM-YYYY (já está no formato correto)
    match = value.match(ddMMyyyyPattern) || value.match(ddMMyyyyDashPattern);
    if (match) {
      return value.replace(/-/g, '/'); // Converte hífen para barra
    }

    // Tenta parsear como Date object
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }

    return value;
  }

  /**
   * Formata valores monetários
   */
  formatCurrency(value: string): string {
    // Remove espaços e caracteres comuns de formatação
    const cleaned = value.replace(/\s/g, '').replace(/[R$]/g, '');

    // Padrões de moeda
    const currencyPatterns = [
      /^(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)$/, // 1.234,56 ou 1.234,56
      /^(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)$/, // 1,234.56 (formato US)
      /^(\d+([.,]\d{2})?)$/, // 1234,56 ou 1234.56
    ];

    for (const pattern of currencyPatterns) {
      const match = cleaned.match(pattern);
      if (match) {
        // Normaliza para formato brasileiro: R$ 1.234,56
        let number = cleaned.replace(/\./g, '').replace(',', '.');
        const numValue = parseFloat(number);
        if (!isNaN(numValue)) {
          return `R$ ${numValue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`;
        }
      }
    }

    return value;
  }

  /**
   * Formata números (decimais, separadores)
   */
  formatNumber(value: string): string {
    // Remove espaços
    const cleaned = value.replace(/\s/g, '');

    // Padrões numéricos
    const numberPatterns = [
      /^-?\d{1,3}(?:\.\d{3})*(?:,\d+)?$/, // 1.234,56
      /^-?\d{1,3}(?:,\d{3})*(?:\.\d+)?$/, // 1,234.56
      /^-?\d+([.,]\d+)?$/, // 1234,56 ou 1234.56
    ];

    for (const pattern of numberPatterns) {
      const match = cleaned.match(pattern);
      if (match) {
        // Normaliza para formato brasileiro: 1.234,56
        let number = cleaned.replace(/\./g, '').replace(',', '.');
        const numValue = parseFloat(number);
        if (!isNaN(numValue)) {
          return numValue.toLocaleString('pt-BR', {
            minimumFractionDigits: numValue % 1 === 0 ? 0 : 2,
            maximumFractionDigits: 2,
          });
        }
      }
    }

    return value;
  }

  /**
   * Formata todos os dados da planilha
   */
  formatSheetData(data: SheetsData): SheetsData {
    const formattedRows = data.rows.map((row) =>
      row.map((cell) => this.formatValue(cell)),
    );

    return {
      ...data,
      rows: formattedRows,
    };
  }
}
