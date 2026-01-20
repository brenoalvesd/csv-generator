import { Module } from '@nestjs/common';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import { SheetsModule } from './sheets/sheets.module';

@Module({
  imports: [SheetsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
