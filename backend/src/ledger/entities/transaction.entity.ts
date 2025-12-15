import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { TransactionType, TransactionFlow, TransactionStatus } from '../../types'; // Ensure types are shared or copied

@Entity('transactions')
@Index(['userId', 'createdAt']) // Index for history queries
@Index(['referenceId'], { unique: true }) // Idempotency check
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('decimal', { precision: 20, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['CARD_EXCHANGE', 'WALLET_TOPUP', 'WALLET_WITHDRAW', 'CARD_PURCHASE', 'REFUND', 'FEE'],
  })
  type: string; // Simplified for DB, map to Enum in code

  @Column({ type: 'enum', enum: ['IN', 'OUT'] })
  flow: string;

  @Column({ type: 'enum', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'], default: 'PENDING' })
  status: string;

  @Column('decimal', { precision: 20, scale: 2 })
  balanceBefore: number;

  @Column('decimal', { precision: 20, scale: 2 })
  balanceAfter: number;

  @Column()
  referenceId: string; // Order ID, Provider Tx ID, etc.

  @Column()
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  fullDescription: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}