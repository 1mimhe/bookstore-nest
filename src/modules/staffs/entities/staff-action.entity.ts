import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Staff } from './staff.entity';

export enum StaffActionTypes {
  // Content Management Actions
  BookCreated = 'book_created',
  BookUpdated = 'book_updated',
  BookDeleted = 'book_deleted',
  AuthorCreated = 'author_created',
  AuthorUpdated = 'author_updated',
  AuthorDeleted = 'author_deleted',
  PublisherCreated = 'publisher_created',
  PublisherUpdated = 'publisher_updated',
  PublisherDeleted = 'publisher_deleted',
  BlogCreated = 'blog_created',
  BlogUpdated = 'blog_updated',
  BlogDeleted = 'blog_deleted',
  CollectionCreated = 'collection_created',
  CollectionUpdated = 'collection_updated',
  CollectionDeleted = 'collection_deleted',
  TitleCreated = 'title_created',
  TitleUpdated = 'title_updated',
  TitleDeleted = 'title_deleted',
  TagCreated = 'tag_created',
  TagUpdated = 'tag_updated',
  TagDeleted = 'tag_deleted',
  CharacterCreated = 'character_created',
  CharacterUpdated = 'character_updated',
  CharacterDeleted = 'character_deleted',
  
  // Inventory Management Actions
  StockUpdated = 'stock_updated',
  StockAdded = 'stock_added',
  StockRemoved = 'stock_removed',
  PriceUpdated = 'price_updated',
  DiscountApplied = 'discount_applied',
  DiscountRemoved = 'discount_removed',
  BookActivated = 'book_activated',
  BookDeactivated = 'book_deactivated',
  BookImageUploaded = 'book_image_uploaded',
  BookImageDeleted = 'book_image_deleted',
  InventoryAudit = 'inventory_audit',
  BulkPriceUpdate = 'bulk_price_update',
  StockAlert = 'stock_alert',
  
  // Order Management Actions
  OrderProcessed = 'order_processed',
  OrderShipped = 'order_shipped',
  OrderDelivered = 'order_delivered',
  OrderCanceled = 'order_canceled',
  PaymentProcessed = 'payment_processed',
  PaymentRefunded = 'payment_refunded',
  TrackingUpdated = 'tracking_updated',
  OrderStatusChanged = 'order_status_changed',
  ShippingAddressUpdated = 'shipping_address_updated',
  OrderNoteAdded = 'order_note_added',
  BulkOrderProcessing = 'bulk_order_processing',
  
  // User Management Actions
  UserRoleChanged = 'user_role_changed',
  UserActivated = 'user_activated',
  UserDeactivated = 'user_deactivated',
  UserContactUpdated = 'user_contact_updated',
  UserAddressUpdated = 'user_address_updated',
  UserBookmarkManaged = 'user_bookmark_managed',
  
  // Staff Management Actions
  StaffCreated = 'staff_created',
  StaffUpdated = 'staff_updated',
  StaffDeactivated = 'staff_deactivated',
  StaffRoleChanged = 'staff_role_changed',
  StaffSalaryUpdated = 'staff_salary_updated',
  StaffPermissionChanged = 'staff_permission_changed',
  
  // Discount & Promotion Actions
  DiscountCodeCreated = 'discount_code_created',
  DiscountCodeUpdated = 'discount_code_updated',
  DiscountCodeActivated = 'discount_code_activated',
  DiscountCodeDeactivated = 'discount_code_deactivated',
  DiscountCodeUsed = 'discount_code_used',
  
  // Review Management Actions
  ReviewModerated = 'review_moderated',
  ReviewDeleted = 'review_deleted',
  ReviewReactionManaged = 'review_reaction_managed',
  ReviewFlagged = 'review_flagged',
  
  // Book Request Actions
  BookRequestCreated = 'book_request_created',
  BookRequestProcessed = 'book_request_processed',
  BookRequestRejected = 'book_request_rejected',
  BookRequestFulfilled = 'book_request_fulfilled',
  
  // System Actions
  DataExported = 'data_exported',
  DataImported = 'data_imported',
  BackupCreated = 'backup_created',
  SystemConfigUpdated = 'system_config_updated',
  ReportGenerated = 'report_generated',
  CacheCleared = 'cache_cleared',
  
  // Security Actions
  LoginAttempt = 'login_attempt',
  PasswordChanged = 'password_changed',
  SecurityAlertTriggered = 'security_alert_triggered',
  SuspiciousActivityDetected = 'suspicious_activity_detected'
}

export enum EntityTypes {
  Book = 'books',
  Title = 'titles',
  Author = 'authors',
  Publisher = 'publishers',
  User = 'users',
  Order = 'orders',
  Staff = 'staffs',
  Review = 'reviews',
  Blog = 'blogs',
  Collection = 'collections',
  Tag = 'tags',
  Character = 'characters',
  DiscountCode = 'discount_codes',
  BookRequest = 'book_requests',
}

export enum StaffActionStatus {
  Success = 'success',
  Failed = 'failed',
  Pending = 'pending',
}

@Entity('staff_actions')
export class StaffAction extends BaseEntity {
  @Column('uuid')
  staffId: string;
  @ManyToOne(() => Staff, (staff) => staff.actions)
  @JoinColumn()
  staff: Staff;

  @Column({
    type: 'enum',
    enum: StaffActionTypes
  })
  type: StaffActionTypes;

  @Column('uuid')
  entityId: string;

  @Column({
    type: 'enum',
    enum: EntityTypes
  })
  entityType: EntityTypes;

  @Column({
    type: 'enum',
    enum: StaffActionStatus,
    default: StaffActionStatus.Success
  })
  status: StaffActionStatus;

  @Column('text', { nullable: true })
  description?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Object;
}