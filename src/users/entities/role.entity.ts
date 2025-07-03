import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Roles {
  Customer = 'customer',
  Admin = 'admin',
  ContentManager = 'content-manager',
  InventoryManager = 'inventory-manager',
  OrderManager = 'order-manager',
  Publisher = 'publisher'
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Roles
  })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}