
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletEntity } from '../ledger/entities/wallet.entity';

@Injectable()
export class SeedsService {
  constructor(
    @InjectRepository(WalletEntity)
    private walletRepo: Repository<WalletEntity>,
  ) {}

  async seed() {
    const count = await this.walletRepo.count();
    if (count > 0) return;

    // Create Demo Wallets matching Frontend Mock IDs
    const users = [
      { userId: 'u1', balance: 1542000 }, // Nguyen Van A
      { userId: 'u2', balance: 50000 },   // Tran Thi B
      { userId: 'u3', balance: 0 },       // Admin
    ];

    for (const u of users) {
      const wallet = this.walletRepo.create({
        userId: u.userId,
        balance: u.balance,
        currency: 'VND',
        isActive: true,
      });
      await this.walletRepo.save(wallet);
    }
  }
}
