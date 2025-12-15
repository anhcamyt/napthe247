import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, Index } from 'typeorm';

@Entity('wallets')
export class WalletEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column('decimal', { precision: 20, scale: 2, default: 0 })
  balance: number;

  @Column('decimal', { precision: 20, scale: 2, default: 0 })
  frozenBalance: number; // For held transactions

  @Column({ default: 'VND' })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastTransactionId: string; // Optimistic locking helper

  @UpdateDateColumn()
  updatedAt: Date;
}