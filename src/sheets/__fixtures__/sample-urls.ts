/**
 * Fixtures de URLs do Google Sheets para testes
 */

export const validUrls = {
  standard: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  withGid: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit#gid=0',
  shortPath: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  withQueryParam: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms?usp=sharing',
};

export const invalidUrls = {
  wrongDomain: 'https://example.com/spreadsheets/d/123',
  notGoogle: 'https://docs.microsoft.com/spreadsheets/d/123',
  malformed: 'not-a-url',
  empty: '',
  noId: 'https://docs.google.com/spreadsheets/',
};

export const spreadsheetIds = {
  standard: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  test: 'test123',
};
