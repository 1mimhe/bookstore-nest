import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityTypes, StaffAction, StaffActionStatus, StaffActionTypes } from '../entities/staff-action.entity';
import { EventNames } from '../../../common/events/event.names';
import { TitleCreatedEvent } from '../../../common/events/catalog/title-created.event';
import { TitleUpdatedEvent } from '../../../common/events/catalog/title-updated.event';
import { BookCreatedEvent } from '../../../common/events/catalog/book-created.event';
import { BookUpdatedEvent } from '../../../common/events/catalog/book-updated.event';
import { OrderPlacedEvent } from '../../../common/events/orders/order-placed.event';

@Injectable()
export class StaffAuditListener {
  private readonly logger = new Logger(StaffAuditListener.name);

  constructor(
    @InjectRepository(StaffAction)
    private readonly staffActionRepo: Repository<StaffAction>,
  ) {}

  @OnEvent(EventNames.TitleCreated, { async: true })
  async handleTitleCreated(event: TitleCreatedEvent) {
    try {
      const action = this.staffActionRepo.create({
        userId: event.userId,
        staffId: event.staffId,
        type: StaffActionTypes.TitleCreated,
        entityId: event.titleId,
        entityType: EntityTypes.Title,
        status: StaffActionStatus.Success,
        newValue: { name: event.titleName },
      });
      await this.staffActionRepo.save(action);
      this.logger.log(`Audit recorded: Title created [${event.titleId}]`);
    } catch (error) {
      this.logger.error(`Failed to audit title creation [${event.titleId}]:`, error);
    }
  }

  @OnEvent(EventNames.TitleUpdated, { async: true })
  async handleTitleUpdated(event: TitleUpdatedEvent) {
    try {
      const action = this.staffActionRepo.create({
        userId: event.userId,
        staffId: event.staffId,
        type: StaffActionTypes.TitleUpdated,
        entityId: event.titleId,
        entityType: EntityTypes.Title,
        status: StaffActionStatus.Success,
        metadata: { updatedFields: event.updatedFields },
      });
      await this.staffActionRepo.save(action);
      this.logger.log(`Audit recorded: Title updated [${event.titleId}]`);
    } catch (error) {
      this.logger.error(`Failed to audit title update [${event.titleId}]:`, error);
    }
  }

  @OnEvent(EventNames.BookCreated, { async: true })
  async handleBookCreated(event: BookCreatedEvent) {
    try {
      const action = this.staffActionRepo.create({
        userId: event.userId,
        staffId: event.staffId,
        type: StaffActionTypes.BookCreated,
        entityId: event.bookId,
        entityType: EntityTypes.Book,
        status: StaffActionStatus.Success,
        newValue: { isbn: event.isbn, titleId: event.titleId },
      });
      await this.staffActionRepo.save(action);
      this.logger.log(`Audit recorded: Book created [${event.bookId}]`);
    } catch (error) {
      this.logger.error(`Failed to audit book creation [${event.bookId}]:`, error);
    }
  }

  @OnEvent(EventNames.BookUpdated, { async: true })
  async handleBookUpdated(event: BookUpdatedEvent) {
    try {
      const action = this.staffActionRepo.create({
        userId: event.userId,
        staffId: event.staffId,
        type: StaffActionTypes.BookUpdated,
        entityId: event.bookId,
        entityType: EntityTypes.Book,
        status: StaffActionStatus.Success,
      });
      await this.staffActionRepo.save(action);
      this.logger.log(`Audit recorded: Book updated [${event.bookId}]`);
    } catch (error) {
      this.logger.error(`Failed to audit book update [${event.bookId}]:`, error);
    }
  }

  @OnEvent(EventNames.OrderPlaced, { async: true })
  async handleOrderPlaced(event: OrderPlacedEvent) {
    try {
      const action = this.staffActionRepo.create({
        userId: event.userId,
        type: StaffActionTypes.OrderProcessed,
        entityId: event.orderId,
        entityType: EntityTypes.Order,
        status: StaffActionStatus.Success,
        metadata: { totalAmount: event.totalAmount, bookCount: event.bookCount },
      });
      await this.staffActionRepo.save(action);
      this.logger.log(`Audit recorded: Order placed [${event.orderId}]`);
    } catch (error) {
      this.logger.error(`Failed to audit order placement [${event.orderId}]:`, error);
    }
  }
}
