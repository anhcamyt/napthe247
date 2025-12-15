import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { TransactionEntity } from './entities/transaction.entity';
import { WalletEntity } from './entities/wallet.entity';
import { TransactionType, TransactionFlow, TransactionStatus } from './types';

/**
 * CORE LEDGER SERVICE
 * Nguyên tắc:
 * 1. Mọi thay đổi số dư phải thông qua recordTransaction
 * 2. Sử dụng Database Transaction (ACID) để đảm bảo tính toàn vẹn
 * 3. Lock row ví khi cập nhật để tránh Race Condition
 */

@Injectable()
export class LedgerService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async recordTransaction(payload: {
    userId: string;
    amount: number;
    type: TransactionType;
    flow: TransactionFlow;
    referenceId: string;
    description: string;
    metadata?: any;
  }): Promise<TransactionEntity> {
    return await this.entityManager.transaction(async (manager) => {
      // 1. Lock Wallet Row (Pessimistic Write Lock)
      // "SELECT * FROM wallet WHERE user_id = ? FOR UPDATE"
      const wallet = await manager.findOne(WalletEntity, {
        where: { userId: payload.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new BadRequestException('Wallet not found');

      const balanceBefore = wallet.balance;
      let balanceAfter = balanceBefore;

      // 2. Validate & Calculate Logic
      if (payload.flow === TransactionFlow.OUT) {
        if (wallet.balance < payload.amount) {
          throw new BadRequestException('Insufficient balance');
        }
        balanceAfter = Number(wallet.balance) - Number(payload.amount);
      } else {
        balanceAfter = Number(wallet.balance) + Number(payload.amount);
      }

      // 3. Update Wallet Balance
      wallet.balance = balanceAfter;
      await manager.save(wallet);

      // 4. Create Ledger Record (Immutable)
      const tx = manager.create(TransactionEntity, {
        userId: payload.userId,
        amount: payload.amount,
        type: payload.type,
        flow: payload.flow,
        status: TransactionStatus.SUCCESS, // Immediate consistency for wallet ops
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        referenceId: payload.referenceId,
        shortDescription: payload.description,
        fullDescription: payload.description, // Can be expanded
        metadata: payload.metadata,
      });

      return await manager.save(tx);
    });
  }

  // Hàm hoàn tiền (Refund) an toàn
  async refundTransaction(originalTxId: string, reason: string) {
    return await this.entityManager.transaction(async (manager) => {
        const originalTx = await manager.findOne(TransactionEntity, { where: { id: originalTxId } });
        if (!originalTx || originalTx.status !== TransactionStatus.SUCCESS) {
            throw new BadRequestException('Invalid transaction for refund');
        }

        // Logic đảo ngược Flow
        const refundFlow = originalTx.flow === TransactionFlow.IN ? TransactionFlow.OUT : TransactionFlow.IN;
        
        // Gọi lại logic recordTransaction (đệ quy nhưng trong cùng DB transaction)
        // Lưu ý: Cần refactor để gọi internal method tránh deadlock nếu logic phức tạp
        // Ở đây giả định gọi lại service wrapper hoặc logic tương tự
        
        // Simplified implementation inline:
        const wallet = await manager.findOne(WalletEntity, {
            where: { userId: originalTx.userId },
            lock: { mode: 'pessimistic_write' },
        });

        const amount = originalTx.amount;
        const newBalance = refundFlow === TransactionFlow.IN 
            ? Number(wallet.balance) + Number(amount)
            : Number(wallet.balance) - Number(amount);

        wallet.balance = newBalance;
        await manager.save(wallet);

        const refundTx = manager.create(TransactionEntity, {
            userId: originalTx.userId,
            amount: amount,
            type: TransactionType.REFUND,
            flow: refundFlow,
            status: TransactionStatus.SUCCESS,
            balanceBefore: wallet.balance, // Note: this is actually 'before this op' but 'after original'
            balanceAfter: newBalance,
            referenceId: originalTx.id, // Reference to original
            shortDescription: `Hoàn tiền GD #${originalTx.id}`,
            metadata: { reason },
        });

        return await manager.save(refundTx);
    });
  }
}
