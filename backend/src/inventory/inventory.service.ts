import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CardCodeEntity } from './entities/card-code.entity';

@Injectable()
export class InventoryService {
  constructor(@InjectEntityManager() private readonly entityManager: EntityManager) {}

  /**
   * Lấy mã thẻ từ kho một cách an toàn (Concurrency Safe).
   * Sử dụng: SKIP LOCKED để cho phép nhiều request lấy thẻ song song mà không block nhau.
   */
  async dispenseCode(productId: string, orderId: string): Promise<CardCodeEntity> {
    return await this.entityManager.transaction(async (manager) => {
      // 1. Tìm 1 thẻ đang AVAILABLE và lock nó. 
      // SKIP LOCKED giúp các transaction khác bỏ qua row đã bị lock này và lấy row kế tiếp -> High throughput.
      const code = await manager
        .createQueryBuilder(CardCodeEntity, 'code')
        .setLock('pessimistic_write')
        .where('code.product_id = :productId', { productId })
        .andWhere('code.status = :status', { status: 'AVAILABLE' })
        .orderBy('code.created_at', 'ASC') // FIFO
        .limit(1)
        .setOnLocked('skip_locked') 
        .getOne();

      if (!code) {
        throw new Error('Out of stock');
      }

      // 2. Cập nhật trạng thái
      code.status = 'SOLD';
      code.orderId = orderId;
      code.soldAt = new Date();

      return await manager.save(code);
    });
  }
}
