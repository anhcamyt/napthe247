
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { TransactionEntity } from './ledger/entities/transaction.entity';
import { WalletEntity } from './ledger/entities/wallet.entity';
import { CardCodeEntity } from './inventory/entities/card-code.entity';

import { LedgerModule } from './ledger/ledger.module';
import { InventoryModule } from './inventory/inventory.module';
import { SeedsService } from './seeds/seeds.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [TransactionEntity, WalletEntity, CardCodeEntity],
      synchronize: true, // DEV ONLY
      logging: false,
    }),
    ScheduleModule.forRoot(),
    LedgerModule,
    InventoryModule,
    // Add other modules here as you implement them
    TypeOrmModule.forFeature([WalletEntity]) // For SeedsService
  ],
  providers: [SeedsService],
})
export class AppModule {}
