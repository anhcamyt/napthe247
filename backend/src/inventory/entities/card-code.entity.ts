import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('card_codes')
@Index(['productId', 'status', 'createdAt']) // Index for dispensing FIFO
export class CardCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string; // Link to Product Config

  @Column()
  providerCode: string; // VIETTEL, VINA...

  @Column('int')
  value: number;

  @Column()
  code: string; // Should be encrypted in real prod

  @Column()
  serial: string;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({
    type: 'enum',
    enum: ['AVAILABLE', 'SOLD', 'HELD', 'ERROR'],
    default: 'AVAILABLE'
  })
  status: string;

  @Column({ nullable: true })
  orderId: string; // Reference to Order when SOLD

  @Column({ nullable: true })
  importBatchId: string;

  @Column({ nullable: true })
  soldAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}