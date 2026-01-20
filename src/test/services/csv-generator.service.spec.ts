import { Test, TestingModule } from '@nestjs/testing';
import { CsvGeneratorService } from '@sheets/services/csv-generator.service';
import {
  sampleSheetsDataSimple,
  sampleSheetsDataWithEmptyCells,
} from '@test/fixtures/sample-sheets-data';

describe('CsvGeneratorService', () => {
  let service: CsvGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CsvGeneratorService],
    }).compile();

    service = module.get<CsvGeneratorService>(CsvGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCsv', () => {
    it('should generate valid CSV with headers and rows', () => {
      const data = sampleSheetsDataSimple;
      const csv = service.generateCsv(data);

      expect(csv).toContain('Nome');
      expect(csv).toContain('Idade');
      expect(csv).toContain('Cidade');
      expect(csv).toContain('João');
      expect(csv).toContain('Maria');
      expect(csv).toContain('Pedro');
    });

    it('should handle empty headers by using Column N', () => {
      const data = {
        headers: ['', '', ''],
        rows: [['a', 'b', 'c']],
        spreadsheetId: 'test',
      };
      const csv = service.generateCsv(data);

      expect(csv).toContain('Column 1');
      expect(csv).toContain('Column 2');
      expect(csv).toContain('Column 3');
    });

    it('should treat empty cells as empty string', () => {
      const data = sampleSheetsDataWithEmptyCells;
      const csv = service.generateCsv(data);

      // CSV should be generated without errors
      expect(csv).toBeDefined();
      expect(csv.length).toBeGreaterThan(0);
    });

    it('should throw error if headers are missing', () => {
      const data = {
        headers: undefined as any,
        rows: [['a', 'b']],
        spreadsheetId: 'test',
      };

      expect(() => service.generateCsv(data)).toThrow(
        'Cannot generate CSV: headers are missing',
      );
    });

    it('should throw error if headers array is empty', () => {
      const data = {
        headers: [],
        rows: [['a', 'b']],
        spreadsheetId: 'test',
      };

      expect(() => service.generateCsv(data)).toThrow(
        'Cannot generate CSV: headers are missing',
      );
    });

    it('should generate CSV with UTF-8 encoding support', () => {
      const data = {
        headers: ['Nome', 'Descrição'],
        rows: [
          ['José', 'Ação'],
          ['Maria', 'São Paulo'],
        ],
        spreadsheetId: 'test',
      };
      const csv = service.generateCsv(data);

      expect(csv).toContain('José');
      expect(csv).toContain('Ação');
      expect(csv).toContain('São Paulo');
    });

    it('should handle special characters correctly', () => {
      const data = {
        headers: ['Produto', 'Preço'],
        rows: [
          ['Produto "A"', 'R$ 1.234,56'],
          ["Produto 'B'", 'R$ 2.500,00'],
        ],
        spreadsheetId: 'test',
      };
      const csv = service.generateCsv(data);

      expect(csv).toBeDefined();
      expect(csv.length).toBeGreaterThan(0);
    });

    it('should generate CSV with correct structure', () => {
      const data = sampleSheetsDataSimple;
      const csv = service.generateCsv(data);

      // Should contain header row
      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toContain('Nome');
    });

    it('should handle rows with different column counts', () => {
      const data = {
        headers: ['A', 'B', 'C'],
        rows: [
          ['a', 'b'],
          ['a', 'b', 'c', 'd'],
        ],
        spreadsheetId: 'test',
      };
      const csv = service.generateCsv(data);

      expect(csv).toBeDefined();
      expect(csv.length).toBeGreaterThan(0);
    });
  });

  describe('generateFileName', () => {
    it('should generate name based on spreadsheet title', () => {
      const title = 'My Test Spreadsheet';
      const filename = service.generateFileName(title);

      expect(filename).toContain('my_test_spreadsheet');
      expect(filename).toContain('.csv');
    });

    it('should sanitize special characters', () => {
      const title = 'My/Test*Spreadsheet?';
      const filename = service.generateFileName(title);

      expect(filename).not.toContain('/');
      expect(filename).not.toContain('*');
      expect(filename).not.toContain('?');
      expect(filename).toContain('_');
    });

    it('should limit name size to 50 characters', () => {
      const title = 'A'.repeat(100);
      const filename = service.generateFileName(title);

      expect(filename.length).toBeLessThanOrEqual(54); // 50 chars + '.csv'
    });

    it('should convert to lowercase', () => {
      const title = 'MY TEST SPREADSHEET';
      const filename = service.generateFileName(title);

      expect(filename).toBe('my_test_spreadsheet.csv');
    });

    it("should return 'spreadsheet.csv' if title not provided", () => {
      const filename = service.generateFileName(undefined);

      expect(filename).toBe('spreadsheet.csv');
    });

    it("should return 'spreadsheet.csv' if title is empty string", () => {
      const filename = service.generateFileName('');

      expect(filename).toBe('spreadsheet.csv');
    });

    it('should handle titles with spaces', () => {
      const title = 'My Test Spreadsheet';
      const filename = service.generateFileName(title);

      expect(filename).toBe('my_test_spreadsheet.csv');
    });

    it('should handle titles with numbers', () => {
      const title = 'Spreadsheet 123';
      const filename = service.generateFileName(title);

      expect(filename).toBe('spreadsheet_123.csv');
    });

    it('should handle titles with accented characters', () => {
      const title = 'Planilha de Teste';
      const filename = service.generateFileName(title);

      expect(filename).toContain('.csv');
      // Accented characters should be replaced with underscores
      expect(filename).toContain('_');
    });
  });
});
