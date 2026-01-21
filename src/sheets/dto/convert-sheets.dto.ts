import { IsString, IsUrl, IsOptional, IsArray } from 'class-validator';
import { ColumnDefinitionDto } from './column-definition.dto';

export class ConvertSheetsDto {
  @IsUrl({}, { message: 'URL must be a valid Google Sheets URL' })
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  sheetId?: string;

  @IsOptional()
  @IsString()
  delimiter?: string;

  @IsOptional()
  @IsArray()
  columns?: (string | ColumnDefinitionDto)[];
}
