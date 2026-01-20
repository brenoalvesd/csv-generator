import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { SheetsController } from '@sheets/controllers/sheets.controller';
import { SheetsService } from '@sheets/services/sheets.service';
import { validUrls } from '@test/fixtures/sample-urls';

describe('SheetsController', () => {
  let controller: SheetsController;
  let service: jest.Mocked<SheetsService>;

  beforeEach(async () => {
    const mockSheetsService = {
      convertToCsv: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SheetsController],
      providers: [
        {
          provide: SheetsService,
          useValue: mockSheetsService,
        },
      ],
    }).compile();

    controller = module.get<SheetsController>(SheetsController);
    service = module.get(SheetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('convertToCsv', () => {
    it('should return 200 with valid CSV', async () => {
      const mockCsv = 'Nome,Idade\nJoão,30';
      const mockFilename = 'test.csv';
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      service.convertToCsv.mockResolvedValueOnce({
        csv: mockCsv,
        filename: mockFilename,
      });

      await controller.convertToCsv(
        { url: validUrls.standard },
        mockResponse,
      );

      expect(service.convertToCsv).toHaveBeenCalledWith(validUrls.standard);
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8',
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${mockFilename}"`,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.send).toHaveBeenCalledWith(mockCsv);
    });

    it('should configure Content-Type header correctly', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      service.convertToCsv.mockResolvedValueOnce({
        csv: 'csv',
        filename: 'test.csv',
      });

      await controller.convertToCsv(
        { url: validUrls.standard },
        mockResponse,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv; charset=utf-8',
      );
    });

    it('should configure Content-Disposition with filename', async () => {
      const mockFilename = 'my_spreadsheet.csv';
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      service.convertToCsv.mockResolvedValueOnce({
        csv: 'csv',
        filename: mockFilename,
      });

      await controller.convertToCsv(
        { url: validUrls.standard },
        mockResponse,
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        `attachment; filename="${mockFilename}"`,
      );
    });

    it('should throw BadRequestException for invalid URL', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const error = new BadRequestException('Invalid URL');
      service.convertToCsv.mockRejectedValueOnce(error);

      await expect(
        controller.convertToCsv({ url: 'invalid-url' }, mockResponse),
      ).rejects.toThrow(BadRequestException);

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for private spreadsheet', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const error = new UnauthorizedException('Private spreadsheet');
      service.convertToCsv.mockRejectedValueOnce(error);

      await expect(
        controller.convertToCsv({ url: validUrls.standard }, mockResponse),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should handle service errors correctly', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const error = new Error('Service error');
      service.convertToCsv.mockRejectedValueOnce(error);

      await expect(
        controller.convertToCsv({ url: validUrls.standard }, mockResponse),
      ).rejects.toThrow(BadRequestException);

      expect(mockResponse.setHeader).not.toHaveBeenCalled();
      expect(mockResponse.send).not.toHaveBeenCalled();
    });

    it('should re-throw BadRequestException', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const error = new BadRequestException('Custom error message');
      service.convertToCsv.mockRejectedValueOnce(error);

      try {
        await controller.convertToCsv({ url: validUrls.standard }, mockResponse);
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe('Custom error message');
      }
    });

    it('should re-throw UnauthorizedException', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const error = new UnauthorizedException('Access denied');
      service.convertToCsv.mockRejectedValueOnce(error);

      try {
        await controller.convertToCsv({ url: validUrls.standard }, mockResponse);
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Access denied');
      }
    });

    it('should convert generic errors to BadRequestException', async () => {
      const mockResponse = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as any;

      const error = new Error('Generic error');
      service.convertToCsv.mockRejectedValueOnce(error);

      await expect(
        controller.convertToCsv({ url: validUrls.standard }, mockResponse),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
