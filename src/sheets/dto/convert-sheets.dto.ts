import { IsString, IsUrl, IsOptional, IsArray } from 'class-validator';

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
  @IsString({ each: true })
  columns?: string[];
}
