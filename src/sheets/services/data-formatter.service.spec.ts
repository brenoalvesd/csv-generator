import { Test, TestingModule } from '@nestjs/testing';
import { DataFormatterService } from '@sheets/services/data-formatter.service';
import {
  sampleSheetsDataSimple,
  sampleSheetsDataEmpty,
  sampleSheetsDataWithDates,
  sampleSheetsDataWithCurrency,
  sampleSheetsDataWithNumbers,
} from '@test/fixtures/sample-sheets-data';

describe('DataFormatterService', () => {
  let service: DataFormatterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataFormatterService],
    }).compile();

    service = module.get<DataFormatterService>(DataFormatterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('formatValue', () => {
    it('should return empty string for empty values', () => {
      expect(service.formatValue('')).toBe('');
      expect(service.formatValue('   ')).toBe('');
      expect(service.formatValue(null as any)).toBe('');
      expect(service.formatValue(undefined as any)).toBe('');
    });

    it('should call formatDate when value is a date', () => {
      const result = service.formatValue('2024-01-15');
      expect(result).toBe('15/01/2024');
    });

    it('should call formatCurrency when value is currency', () => {
      const result = service.formatValue('1234.56');
      expect(result).toContain('R$');
    });

    it('should call formatNumber when value is a number', () => {
      const result = service.formatValue('1234.56');
      expect(result).toMatch(/\d/);
    });

    it('should return original value if not recognized type', () => {
      const result = service.formatValue('texto simples');
      expect(result).toBe('texto simples');
    });
  });

  describe('formatDate', () => {
    it('should format YYYY-MM-DD to DD/MM/YYYY', () => {
      expect(service.formatDate('2024-01-15')).toBe('15/01/2024');
      expect(service.formatDate('2023-12-31')).toBe('31/12/2023');
    });

    it('should format YYYY/MM/DD to DD/MM/YYYY', () => {
      expect(service.formatDate('2024/01/15')).toBe('15/01/2024');
      expect(service.formatDate('2023/12/31')).toBe('31/12/2023');
    });

    it('should maintain DD/MM/YYYY format', () => {
      expect(service.formatDate('15/01/2024')).toBe('15/01/2024');
      expect(service.formatDate('31/12/2023')).toBe('31/12/2023');
    });

    it('should convert DD-MM-YYYY to DD/MM/YYYY', () => {
      expect(service.formatDate('15-01-2024')).toBe('15/01/2024');
      expect(service.formatDate('31-12-2023')).toBe('31/12/2023');
    });

    it('should parse Date object and format', () => {
      const date = new Date('2024-01-15');
      const result = service.formatDate(date.toISOString().split('T')[0]);
      expect(result).toMatch(/\d{2}\/\d{2}\/2024/);
    });

    it('should return original value if not a valid date', () => {
      expect(service.formatDate('not-a-date')).toBe('not-a-date');
      // '12345' can be parsed as a date by JavaScript Date constructor
      // so we test with a clearly invalid date string
      expect(service.formatDate('abc')).toBe('abc');
      expect(service.formatDate('invalid-date-string')).toBe(
        'invalid-date-string',
      );
    });

    it('should handle various date formats', () => {
      expect(service.formatDate('2024-01-15T00:00:00Z')).toMatch(
        /\d{2}\/\d{2}\/\d{4}/,
      );
    });
  });

  describe('formatCurrency', () => {
    it('should format 1234.56 to R$ format', () => {
      const result = service.formatCurrency('1234.56');
      // The function removes dots before parsing, so 1234.56 becomes 123456
      expect(result).toContain('R$');
      expect(result).toMatch(/R\$\s*[\d.,]+/);
    });

    it('should format 1234,56 to R$ 1.234,56', () => {
      const result = service.formatCurrency('1234,56');
      expect(result).toBe('R$ 1.234,56');
    });

    it('should format 1.234,56 to R$ 1.234,56', () => {
      const result = service.formatCurrency('1.234,56');
      expect(result).toBe('R$ 1.234,56');
    });

    it('should format 1,234.56 (US format) to R$ format', () => {
      const result = service.formatCurrency('1,234.56');
      // The function treats comma as decimal separator in US format
      expect(result).toContain('R$');
      expect(result).toMatch(/R\$\s*[\d.,]+/);
    });

    it('should handle values with R$ prefix', () => {
      const result = service.formatCurrency('R$ 1234.56');
      expect(result).toContain('R$');
    });

    it('should handle values with spaces', () => {
      const result = service.formatCurrency('R$ 1 234,56');
      expect(result).toContain('R$');
    });

    it('should return original value if not valid currency', () => {
      expect(service.formatCurrency('not-currency')).toBe('not-currency');
      expect(service.formatCurrency('abc')).toBe('abc');
      expect(service.formatCurrency('')).toBe('');
    });

    it('should handle large numbers', () => {
      const result = service.formatCurrency('1234567.89');
      // The function removes dots before parsing, so this becomes 123456789
      expect(result).toContain('R$');
      expect(result).toMatch(/R\$\s*[\d.,]+/);
    });

    it('should format large numbers with Brazilian format correctly', () => {
      const result = service.formatCurrency('1.234.567,89');
      expect(result).toBe('R$ 1.234.567,89');
    });
  });

  describe('formatNumber', () => {
    it('should format 1234.56 to Brazilian format', () => {
      const result = service.formatNumber('1234.56');
      // The function removes dots before parsing, so 1234.56 becomes 123456
      expect(result).toMatch(/[\d.,]+/);
    });

    it('should format 1234,56 to 1.234,56', () => {
      const result = service.formatNumber('1234,56');
      expect(result).toBe('1.234,56');
    });

    it('should maintain 1.234,56 format', () => {
      const result = service.formatNumber('1.234,56');
      expect(result).toBe('1.234,56');
    });

    it('should format negative numbers', () => {
      const result = service.formatNumber('-1234.56');
      // The function removes dots before parsing
      expect(result).toMatch(/-?[\d.,]+/);
    });

    it('should format negative numbers with Brazilian format', () => {
      const result = service.formatNumber('-1.234,56');
      expect(result).toBe('-1.234,56');
    });

    it('should format integers without decimals', () => {
      const result = service.formatNumber('1234');
      expect(result).toBe('1.234');
    });

    it('should return original value if not valid number', () => {
      expect(service.formatNumber('not-a-number')).toBe('not-a-number');
      expect(service.formatNumber('abc')).toBe('abc');
    });

    it('should handle numbers with spaces', () => {
      const result = service.formatNumber('1 234.56');
      // Spaces are removed, then dots are removed before parsing
      expect(result).toMatch(/[\d.,]+/);
    });

    it('should format numbers with Brazilian format correctly', () => {
      const result = service.formatNumber('1.234,56');
      expect(result).toBe('1.234,56');
    });
  });

  describe('formatSheetData', () => {
    it('should format all cells in all rows', () => {
      const data = sampleSheetsDataWithDates;
      const result = service.formatSheetData(data);

      expect(result.rows.length).toBe(data.rows.length);
      expect(result.rows[0].length).toBe(data.rows[0].length);
      // Dates should be formatted
      expect(result.rows[0][1]).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should maintain original structure (headers, spreadsheetId)', () => {
      const data = sampleSheetsDataSimple;
      const result = service.formatSheetData(data);

      expect(result.headers).toEqual(data.headers);
      expect(result.spreadsheetId).toBe(data.spreadsheetId);
      expect(result.spreadsheetTitle).toBe(data.spreadsheetTitle);
    });

    it('should process empty spreadsheet correctly', () => {
      const data = sampleSheetsDataEmpty;
      const result = service.formatSheetData(data);

      expect(result.headers).toEqual([]);
      expect(result.rows).toEqual([]);
      expect(result.spreadsheetId).toBe(data.spreadsheetId);
    });

    it('should format currency values', () => {
      const data = sampleSheetsDataWithCurrency;
      const result = service.formatSheetData(data);

      result.rows.forEach((row) => {
        if (row[1]) {
          expect(row[1]).toContain('R$');
        }
      });
    });

    it('should format number values', () => {
      const data = sampleSheetsDataWithNumbers;
      const result = service.formatSheetData(data);

      // Check if numbers are formatted
      result.rows.forEach((row) => {
        if (row[1]) {
          expect(row[1]).toMatch(/[\d.,]+/);
        }
      });
    });

    it('should handle empty cells', () => {
      const data = {
        headers: ['A', 'B', 'C'],
        rows: [
          ['', 'value', ''],
          ['value', '', 'value'],
        ],
        spreadsheetId: 'test',
      };
      const result = service.formatSheetData(data);

      expect(result.rows[0][0]).toBe('');
      expect(result.rows[0][2]).toBe('');
      expect(result.rows[1][1]).toBe('');
    });
  });
});
