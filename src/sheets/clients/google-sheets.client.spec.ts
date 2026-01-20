import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { GoogleSheetsClient } from '@sheets/clients/google-sheets.client';
import { validUrls, invalidUrls, spreadsheetIds } from '@test/fixtures/sample-urls';
import { sampleCsvSimple } from '@test/fixtures/sample-csv';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock axios.isAxiosError
const mockIsAxiosError = jest.fn();
jest.spyOn(axios, 'isAxiosError').mockImplementation(mockIsAxiosError);

describe('GoogleSheetsClient', () => {
  let service: GoogleSheetsClient;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoogleSheetsClient],
    }).compile();

    service = module.get<GoogleSheetsClient>(GoogleSheetsClient);
    jest.clearAllMocks();
    mockIsAxiosError.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractSpreadsheetId', () => {
    it('should extract ID from standard URL', () => {
      const id = service.extractSpreadsheetId(validUrls.standard);
      expect(id).toBe(spreadsheetIds.standard);
    });

    it('should extract ID from URL with gid', () => {
      const id = service.extractSpreadsheetId(validUrls.withGid);
      expect(id).toBe(spreadsheetIds.standard);
    });

    it('should extract ID from short path URL', () => {
      const id = service.extractSpreadsheetId(validUrls.shortPath);
      expect(id).toBe(spreadsheetIds.standard);
    });

    it('should extract ID from URL with query param', () => {
      const id = service.extractSpreadsheetId(validUrls.withQueryParam);
      expect(id).toBe(spreadsheetIds.standard);
    });

    it('should throw exception for invalid URL', () => {
      expect(() => {
        service.extractSpreadsheetId(invalidUrls.malformed);
      }).toThrow(BadRequestException);
    });

    it('should throw exception for URL without ID', () => {
      expect(() => {
        service.extractSpreadsheetId(invalidUrls.noId);
      }).toThrow(BadRequestException);
    });
  });

  describe('isValidGoogleSheetsUrl', () => {
    it('should validate valid Google Sheets URL', () => {
      expect(service.isValidGoogleSheetsUrl(validUrls.standard)).toBe(true);
      expect(service.isValidGoogleSheetsUrl(validUrls.withGid)).toBe(true);
      expect(service.isValidGoogleSheetsUrl(validUrls.shortPath)).toBe(true);
    });

    it('should reject URL from wrong domain', () => {
      expect(service.isValidGoogleSheetsUrl(invalidUrls.wrongDomain)).toBe(false);
      expect(service.isValidGoogleSheetsUrl(invalidUrls.notGoogle)).toBe(false);
    });

    it('should reject malformed URL', () => {
      expect(service.isValidGoogleSheetsUrl(invalidUrls.malformed)).toBe(false);
      expect(service.isValidGoogleSheetsUrl(invalidUrls.empty)).toBe(false);
    });
  });

  describe('fetchSpreadsheet', () => {
    it('should fetch public spreadsheet successfully', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: sampleCsvSimple,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await service.fetchSpreadsheet(validUrls.standard);

      expect(result.headers).toEqual(['Nome', 'Idade', 'Cidade']);
      expect(result.rows.length).toBe(3);
      expect(result.rows[0]).toEqual(['João', '30', 'São Paulo']);
      expect(result.spreadsheetId).toBe(spreadsheetIds.standard);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/spreadsheets/d/${spreadsheetIds.standard}/export`),
        expect.objectContaining({
          responseType: 'text',
          timeout: 30000,
        }),
      );
    });

    it('should parse CSV correctly', async () => {
      const csvData = `Header1,Header2,Header3
Value1,Value2,Value3
Value4,Value5,Value6`;

      mockedAxios.get.mockResolvedValueOnce({
        data: csvData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await service.fetchSpreadsheet(validUrls.standard);

      expect(result.headers).toEqual(['Header1', 'Header2', 'Header3']);
      expect(result.rows.length).toBe(2);
      expect(result.rows[0]).toEqual(['Value1', 'Value2', 'Value3']);
      expect(result.rows[1]).toEqual(['Value4', 'Value5', 'Value6']);
    });

    it('should extract headers and rows correctly', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: sampleCsvSimple,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await service.fetchSpreadsheet(validUrls.standard);

      expect(result.headers.length).toBe(3);
      expect(result.rows.length).toBe(3);
      expect(result.headers).toContain('Nome');
      expect(result.rows[0][0]).toBe('João');
    });

    it('should throw exception for invalid URL', async () => {
      await expect(service.fetchSpreadsheet(invalidUrls.malformed)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw exception for empty spreadsheet', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: '',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await expect(service.fetchSpreadsheet(validUrls.standard)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw exception for spreadsheet with only whitespace', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: '   \n  \n  ',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      await expect(service.fetchSpreadsheet(validUrls.standard)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw UnauthorizedException for private spreadsheet (403)', async () => {
      const error: any = {
        response: {
          status: 403,
          statusText: 'Forbidden',
        },
        isAxiosError: true,
        message: 'Request failed with status code 403',
      };
      mockIsAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(service.fetchSpreadsheet(validUrls.standard)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for not found spreadsheet (404)', async () => {
      const error: any = {
        response: {
          status: 404,
          statusText: 'Not Found',
        },
        isAxiosError: true,
        message: 'Request failed with status code 404',
      };
      mockIsAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(service.fetchSpreadsheet(validUrls.standard)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw BadRequestException for network errors', async () => {
      const error: any = {
        message: 'Network Error',
        isAxiosError: true,
      };
      mockIsAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(service.fetchSpreadsheet(validUrls.standard)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for non-axios errors', async () => {
      const error = new Error('Generic error');
      mockIsAxiosError.mockReturnValue(false);
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(service.fetchSpreadsheet(validUrls.standard)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle timeout correctly', async () => {
      const error: any = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
        isAxiosError: true,
      };
      mockIsAxiosError.mockReturnValue(true);
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(service.fetchSpreadsheet(validUrls.standard)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle CSV with empty rows', async () => {
      const csvData = `Header1,Header2,Header3
Value1,Value2,Value3

Value4,Value5,Value6`;

      mockedAxios.get.mockResolvedValueOnce({
        data: csvData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await service.fetchSpreadsheet(validUrls.standard);

      // Empty rows should be skipped
      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should handle CSV with different column counts', async () => {
      const csvData = `Header1,Header2,Header3
Value1,Value2
Value3,Value4,Value5,Value6`;

      mockedAxios.get.mockResolvedValueOnce({
        data: csvData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      });

      const result = await service.fetchSpreadsheet(validUrls.standard);

      expect(result.headers.length).toBe(3);
      expect(result.rows.length).toBe(2);
    });
  });
});
