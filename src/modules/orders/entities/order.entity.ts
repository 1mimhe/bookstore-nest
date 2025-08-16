// import { BaseEntity } from 'src/common/entities/base.entity';
// import { Address } from 'src/modules/users/entities/address.entity';
// import { User } from 'src/modules/users/entities/user.entity';
// import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

// @Entity('orders')
// export class Order extends BaseEntity {
//   @Column('uuid')
//   userId: string;
//   @ManyToOne(() => User, (user) => user.orders)
//   @JoinColumn()
//   user: User;

//   @Column('uuid')
//   shippingAddressId: string;
//   @ManyToOne(() => Address, (address) => address.orders)
//   @JoinColumn([
//     { name: 'addressId', referencedColumnName: 'id' },
//     { name: 'addressVersion', referencedColumnName: 'version' }
//   ])
//   shippingAddress: Address;
// }