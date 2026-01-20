import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SheetsService } from '@sheets/services/sheets.service';
import { GoogleSheetsClient } from '@sheets/clients/google-sheets.client';
import { DataFormatterService } from '@sheets/services/data-formatter.service';
import { CsvGeneratorService } from '@sheets/services/csv-generator.service';
import { sampleSheetsDataSimple } from '@test/fixtures/sample-sheets-data';
import { validUrls } from '@test/fixtures/sample-urls';

describe('SheetsService', () => {
  let service: SheetsService;
  let googleSheetsClient: jest.Mocked<GoogleSheetsClient>;
  let dataFormatter: jest.Mocked<DataFormatterService>;
  let csvGenerator: jest.Mocked<CsvGeneratorService>;

  beforeEach(async () => {
    const mockGoogleSheetsClient = {
      fetchSpreadsheet: jest.fn(),
    };

    const mockDataFormatter = {
      formatSheetData: jest.fn(),
      formatValue: jest.fn(),
      formatDate: jest.fn(),
      formatCurrency: jest.fn(),
      formatNumber: jest.fn(),
    };

    const mockCsvGenerator = {
      generateCsv: jest.fn(),
      generateFileName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SheetsService,
        {
          provide: GoogleSheetsClient,
          useValue: mockGoogleSheetsClient,
        },
        {
          provide: DataFormatterService,
          useValue: mockDataFormatter,
        },
        {
          provide: CsvGeneratorService,
          useValue: mockCsvGenerator,
        },
      ],
    }).compile();

    service = module.get<SheetsService>(SheetsService);
    googleSheetsClient = module.get(GoogleSheetsClient);
    dataFormatter = module.get(DataFormatterService);
    csvGenerator = module.get(CsvGeneratorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertToCsv', () => {
    it('should orchestrate complete flow: fetch → format → generate CSV', async () => {
      const mockSheetData = sampleSheetsDataSimple;
      const mockFormattedData = { ...mockSheetData, rows: [['formatted']] };
      const mockCsv = 'Nome,Idade\nJoão,30';
      const mockFilename = 'test.csv';

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockReturnValueOnce(mockFormattedData);
      csvGenerator.generateCsv.mockReturnValueOnce(mockCsv);
      csvGenerator.generateFileName.mockReturnValueOnce(mockFilename);

      const result = await service.convertToCsv(validUrls.standard);

      expect(result.csv).toBe(mockCsv);
      expect(result.filename).toBe(mockFilename);
    });

    it('should call googleSheetsClient.fetchSpreadsheet correctly', async () => {
      const mockSheetData = sampleSheetsDataSimple;
      const mockFormattedData = mockSheetData;
      const mockCsv = 'csv';
      const mockFilename = 'test.csv';

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockReturnValueOnce(mockFormattedData);
      csvGenerator.generateCsv.mockReturnValueOnce(mockCsv);
      csvGenerator.generateFileName.mockReturnValueOnce(mockFilename);

      await service.convertToCsv(validUrls.standard);

      expect(googleSheetsClient.fetchSpreadsheet).toHaveBeenCalledWith(
        validUrls.standard,
      );
      expect(googleSheetsClient.fetchSpreadsheet).toHaveBeenCalledTimes(1);
    });

    it('should call dataFormatter.formatSheetData correctly', async () => {
      const mockSheetData = sampleSheetsDataSimple;
      const mockFormattedData = mockSheetData;
      const mockCsv = 'csv';
      const mockFilename = 'test.csv';

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockReturnValueOnce(mockFormattedData);
      csvGenerator.generateCsv.mockReturnValueOnce(mockCsv);
      csvGenerator.generateFileName.mockReturnValueOnce(mockFilename);

      await service.convertToCsv(validUrls.standard);

      expect(dataFormatter.formatSheetData).toHaveBeenCalledWith(mockSheetData);
      expect(dataFormatter.formatSheetData).toHaveBeenCalledTimes(1);
    });

    it('should call csvGenerator.generateCsv correctly', async () => {
      const mockSheetData = sampleSheetsDataSimple;
      const mockFormattedData = mockSheetData;
      const mockCsv = 'csv';
      const mockFilename = 'test.csv';

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockReturnValueOnce(mockFormattedData);
      csvGenerator.generateCsv.mockReturnValueOnce(mockCsv);
      csvGenerator.generateFileName.mockReturnValueOnce(mockFilename);

      await service.convertToCsv(validUrls.standard);

      expect(csvGenerator.generateCsv).toHaveBeenCalledWith(mockFormattedData);
      expect(csvGenerator.generateCsv).toHaveBeenCalledTimes(1);
    });

    it('should call csvGenerator.generateFileName correctly', async () => {
      const mockSheetData = sampleSheetsDataSimple;
      const mockFormattedData = mockSheetData;
      const mockCsv = 'csv';
      const mockFilename = 'test.csv';

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockReturnValueOnce(mockFormattedData);
      csvGenerator.generateCsv.mockReturnValueOnce(mockCsv);
      csvGenerator.generateFileName.mockReturnValueOnce(mockFilename);

      await service.convertToCsv(validUrls.standard);

      expect(csvGenerator.generateFileName).toHaveBeenCalledWith(
        mockFormattedData.spreadsheetTitle,
      );
      expect(csvGenerator.generateFileName).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from googleSheetsClient', async () => {
      const error = new BadRequestException('Invalid URL');
      googleSheetsClient.fetchSpreadsheet.mockRejectedValueOnce(error);

      await expect(service.convertToCsv(validUrls.standard)).rejects.toThrow(
        BadRequestException,
      );

      expect(dataFormatter.formatSheetData).not.toHaveBeenCalled();
      expect(csvGenerator.generateCsv).not.toHaveBeenCalled();
    });

    it('should propagate UnauthorizedException from googleSheetsClient', async () => {
      const error = new UnauthorizedException('Private spreadsheet');
      googleSheetsClient.fetchSpreadsheet.mockRejectedValueOnce(error);

      await expect(service.convertToCsv(validUrls.standard)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should propagate errors from dataFormatter', async () => {
      const mockSheetData = sampleSheetsDataSimple;
      const error = new Error('Format error');

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockImplementationOnce(() => {
        throw error;
      });

      await expect(service.convertToCsv(validUrls.standard)).rejects.toThrow(
        'Format error',
      );

      expect(csvGenerator.generateCsv).not.toHaveBeenCalled();
    });

    it('should propagate errors from csvGenerator', async () => {
      const mockSheetData = sampleSheetsDataSimple;
      const mockFormattedData = mockSheetData;
      const error = new Error('CSV generation error');

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockReturnValueOnce(mockFormattedData);
      csvGenerator.generateCsv.mockImplementationOnce(() => {
        throw error;
      });

      await expect(service.convertToCsv(validUrls.standard)).rejects.toThrow(
        'CSV generation error',
      );

      expect(csvGenerator.generateFileName).not.toHaveBeenCalled();
    });

    it('should return correct CSV and filename', async () => {
      const mockSheetData = sampleSheetsDataSimple;
      const mockFormattedData = mockSheetData;
      const expectedCsv = 'Nome,Idade,Cidade\nJoão,30,São Paulo';
      const expectedFilename = 'test_spreadsheet.csv';

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockReturnValueOnce(mockFormattedData);
      csvGenerator.generateCsv.mockReturnValueOnce(expectedCsv);
      csvGenerator.generateFileName.mockReturnValueOnce(expectedFilename);

      const result = await service.convertToCsv(validUrls.standard);

      expect(result).toEqual({
        csv: expectedCsv,
        filename: expectedFilename,
      });
    });

    it('should handle undefined spreadsheetTitle', async () => {
      const mockSheetData = { ...sampleSheetsDataSimple, spreadsheetTitle: undefined };
      const mockFormattedData = mockSheetData;
      const mockCsv = 'csv';
      const mockFilename = 'spreadsheet.csv';

      googleSheetsClient.fetchSpreadsheet.mockResolvedValueOnce(mockSheetData);
      dataFormatter.formatSheetData.mockReturnValueOnce(mockFormattedData);
      csvGenerator.generateCsv.mockReturnValueOnce(mockCsv);
      csvGenerator.generateFileName.mockReturnValueOnce(mockFilename);

      const result = await service.convertToCsv(validUrls.standard);

      expect(csvGenerator.generateFileName).toHaveBeenCalledWith(undefined);
      expect(result.filename).toBe(mockFilename);
    });
  });
});
