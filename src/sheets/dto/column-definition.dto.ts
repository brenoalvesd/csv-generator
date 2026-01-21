import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum ColumnType {
  STRING = 'string',
  CURRENCY = 'currency',
  TELEPHONE = 'telephone',
  EMAIL = 'email',
  DATE = 'date',
}

export enum CurrencyCode {
  BRL = 'BRL',
  USD = 'USD',
  EUR = 'EUR',
}

export class ColumnDefinitionDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(ColumnType)
  @IsOptional()
  type?: ColumnType = ColumnType.STRING;

  @IsEnum(CurrencyCode)
  @IsOptional()
  currency?: CurrencyCode;
}
