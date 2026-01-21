import { Injectable } from '@nestjs/common';
import { SheetsData } from '@sheets/interfaces/sheets-data.interface';
import {
  ColumnDefinitionDto,
  ColumnType,
  CurrencyCode,
} from '@sheets/dto/column-definition.dto';

@Injectable()
export class DataFormatterService {
  /**
   * Formata todos os dados da planilha usando definições de coluna
   */
  formatSheetData(
    data: SheetsData,
    columnDefinitions?: ColumnDefinitionDto[],
  ): SheetsData {
    // Se não houver definições, cria definições padrão (STRING) para todos os headers
    const definitions =
      columnDefinitions ||
      data.headers.map((header) => ({
        name: header,
        type: ColumnType.STRING,
      }));

    // Mapa rápido de definição por índice da coluna
    // Nota: Assumimos que a ordem das definições bate com a ordem das colunas no 'data'
    // Se o sheets.service já filtrou as colunas, então definitions[i] corresponde a data.rows[...][i]
    
    const formattedRows = data.rows.map((row) =>
      row.map((cell, index) => {
        const def = definitions[index];
        // Se não tiver definição para essa coluna (ex: colunas extras), usa STRING
        const type = def?.type || ColumnType.STRING;
        const currency = (def as ColumnDefinitionDto)?.currency;

        return this.formatValueByType(cell, type, currency);
      }),
    );

    return {
      ...data,
      rows: formattedRows,
    };
  }

  /**
   * Formata um valor baseado no seu tipo explícito
   */
  private formatValueByType(
    value: string,
    type: ColumnType,
    currency?: CurrencyCode,
  ): string {
    if (!value && value !== '0') return ''; // Mantém células vazias como vazias, mas '0' é valor

    const trimmedValue = value.trim();
    if (trimmedValue === '') return '';

    switch (type) {
      case ColumnType.CURRENCY:
        return this.formatCurrency(trimmedValue, currency);
      case ColumnType.TELEPHONE:
        return this.formatTelephone(trimmedValue);
      case ColumnType.EMAIL:
        return this.formatEmail(trimmedValue);
      case ColumnType.DATE:
        return this.formatDate(trimmedValue);
      case ColumnType.STRING:
      default:
        return trimmedValue;
    }
  }

  /**
   * Formata datas para formato padrão DD/MM/YYYY
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

    // DD/MM/YYYY ou DD-MM-YYYY (já está no formato correto, apenas normaliza separador)
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
   * Formata valores monetários usando Intl
   */
  formatCurrency(value: string, currencyCode: CurrencyCode = CurrencyCode.BRL): string {
    // Limpa o valor para extrair número
    // Remove tudo que não é dígito, ponto, vírgula ou sinal de menos
    // Cuidado: 1.000,00 (PT-BR) vs 1,000.00 (EN-US)
    
    let numericValue: number;
    const cleanValue = value.replace(/\s/g, '').replace(/[^\d.,-]/g, '');

    // Heurística simples para detectar formato:
    // Se tem vírgula no final (...,XX), assume decimal PT-BR
    if (cleanValue.match(/,\d{1,2}$/)) {
        // Formato brasileiro: 1.234,56 -> 1234.56
        numericValue = parseFloat(cleanValue.replace(/\./g, '').replace(',', '.'));
    } else {
        // Formato internacional ou sem decimal claro: 1,234.56 -> 1234.56
        // Ou 1234 -> 1234
        numericValue = parseFloat(cleanValue.replace(/,/g, ''));
    }

    if (isNaN(numericValue)) return value;

    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currencyCode,
      }).format(numericValue);
    } catch (e) {
      return value;
    }
  }

  /**
   * Formata e valida emails
   */
  formatEmail(value: string): string {
    return value.toLowerCase().trim();
  }

  /**
   * Formata telefones (mantém apenas números ou formata se necessário)
   * O requisito diz: "formatar os dados apenas para string padrão"
   * Entendo como: retornar o número limpo ou como string simples, sem tentar adivinhar máscara.
   */
  formatTelephone(value: string): string {
    // Retorna o valor original trimado, garantindo que seja string
    // Ou podemos limpar caracteres estranhos se desejar apenas números:
    // return value.replace(/[^\d+]/g, ''); 
    // Mas o requisito diz "string padrão", então vamos apenas limpar espaços.
    return value.trim();
  }
}
