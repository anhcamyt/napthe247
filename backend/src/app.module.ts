import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

// Entities
import { TransactionEntity } from './ledger/entities/transaction.entity';
import { WalletEntity } from './ledger/entities/wallet.entity';
import { CardCodeEntity } from './inventory/entities/card-code.entity';

// Feature Modules (Assuming folder structure exists, if not, remove these imports for bare-bones run)
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { LedgerModule } from './ledger/ledger.module';
import { OrdersModule } from './orders/orders.module';
import { InventoryModule } from './inventory/inventory.module';
import { SupportModule } from './support/support.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [TransactionEntity, WalletEntity, CardCodeEntity], // Register Entities explicitly
      synchronize: true, // AUTO-MIGRATE for Sprint 0. Disable in Production!
      logging: false,
    }),

    ScheduleModule.forRoot(),

    // Core Modules
    AuthModule,
    UsersModule,
    WalletModule,
    LedgerModule,
    OrdersModule,
    InventoryModule,
    SupportModule,
  ],
})
export class AppModule {}