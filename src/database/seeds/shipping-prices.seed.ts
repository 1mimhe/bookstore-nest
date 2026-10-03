import { DataSource } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { OrderStatuses, PaymentStatuses, ShippingTypes } from '../../modules/orders/entities/order.entity';
import { ShippingPrice } from '../../modules/orders/entities/shipping-price.entity';
import { runStandalone } from './seed-utils';

// Re-exported so other seeders/tests can reference the same enums.
export { OrderStatuses, PaymentStatuses, ShippingTypes };

const shippingPricesData = [
  { type: ShippingTypes.Post, price: 35000 },
  { type: ShippingTypes.Peyk, price: 60000 },
  { type: ShippingTypes.Tipax, price: 50000 },
];

export async function seedShippingPrices(ds: DataSource = AppDataSource): Promise<void> {
  const ownConnection = !ds.isInitialized;
  if (ownConnection) {
    await ds.initialize();
    console.log('📦 Database connected');
  }

  console.log('🌱 Starting shipping prices seeding...');
  const repo = ds.getRepository(ShippingPrice);
  let created = 0;
  let updated = 0;

  for (const row of shippingPricesData) {
    const existing = await repo.findOne({ where: { type: row.type } });
    if (existing) {
      if (existing.price !== row.price) {
        await repo.update(existing.id, { price: row.price });
      }
      updated++;
    } else {
      await repo.save(repo.create(row));
      created++;
      console.log(`✅ Created shipping price: ${row.type} = ${row.price}`);
    }
  }

  console.log(`📊 Shipping prices: ${created} created, ${updated} already existed`);
  console.log('🎉 Shipping prices seeding completed successfully!');

  if (ownConnection) await ds.destroy();
}

if (require.main === module) {
  runStandalone('shipping-prices', seedShippingPrices).catch(() => process.exit(1));
}
