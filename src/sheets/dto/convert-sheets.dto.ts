import { IsString, IsUrl } from 'class-validator';

export class ConvertSheetsDto {
  @IsUrl({}, { message: 'URL must be a valid Google Sheets URL' })
  @IsString()
  url: string;
}
