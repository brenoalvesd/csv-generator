import { Module } from '@nestjs/common';
import { SheetsController } from '@sheets/controllers/sheets.controller';
import { SheetsService } from '@sheets/services/sheets.service';
import { GoogleSheetsClient } from '@sheets/clients/google-sheets.client';
import { DataFormatterService } from '@sheets/services/data-formatter.service';
import { CsvGeneratorService } from '@sheets/services/csv-generator.service';

@Module({
  controllers: [SheetsController],
  providers: [
    SheetsService,
    GoogleSheetsClient,
    DataFormatterService,
    CsvGeneratorService,
  ],
})
export class SheetsModule {}
