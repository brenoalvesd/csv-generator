import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { SheetsService } from '@sheets/services/sheets.service';
import { ConvertSheetsDto } from '@sheets/dto/convert-sheets.dto';

@Controller('sheets')
export class SheetsController {
  constructor(private readonly sheetsService: SheetsService) {}

  @Post('convert')
  async convertToCsv(
    @Body() convertDto: ConvertSheetsDto,
    @Res() res: Response,
  ) {
    try {
      const { csv, filename } = await this.sheetsService.convertToCsv(
        convertDto.url,
      );

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      res.status(HttpStatus.OK).send(csv);
    } catch (error) {
      // Re-throw exceções HTTP conhecidas
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      // Converte outros erros em BadRequestException
      throw new BadRequestException(
        `Failed to convert spreadsheet: ${error.message}`,
      );
    }
  }
}
