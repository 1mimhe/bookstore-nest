import {
  DataSource,
  DeepPartial,
  EntityTarget,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppDataSource } from '../../data-source';
import { BaseEntity } from '../../common/base.entity';

/**
 * Shared helpers for all database seeders.
 *
 * Conventions:
 * - Every seeder exports `seedX(ds: DataSource)` and is standalone-runnable.
 * - Seeders NEVER delete. All writes go through `upsert` (find by unique
 *   key, then update-or-insert), so `npm run seed` is safely rerunnable.
 * - Many-to-many links go through `linkManyToMany`, which ignores
 *   duplicate-key errors from previous runs.
 */

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function upsert<T extends BaseEntity>(
  repo: Repository<T>,
  where: FindOptionsWhere<T>,
  createData: DeepPartial<T>,
  updateData?: DeepPartial<T>,
): Promise<{ entity: T; created: boolean }> {
  const existing = await repo.findOne({ where });
  if (existing) {
    const patch = { ...(updateData ?? createData) } as Record<string, unknown>;
    for (const key of Object.keys(patch)) {
      if (patch[key] === undefined) delete patch[key];
    }
    if (Object.keys(patch).length > 0) {
      await repo.update(existing.id, patch as never);
    }
    const entity = await repo.findOneByOrFail({ id: existing.id } as FindOptionsWhere<T>);
    return { entity, created: false };
  }
  const entity = await repo.save(repo.create(createData));
  return { entity, created: true };
}

/** Owner-side many-to-many link that tolerates already-linked rows. */
export async function linkManyToMany(
  ds: DataSource,
  entity: EntityTarget<ObjectLiteral>,
  relation: string,
  ofId: string,
  addIds: string[],
): Promise<number> {
  let linked = 0;
  for (const id of addIds) {
    try {
      await ds.createQueryBuilder().relation(entity, relation).of(ofId).add(id);
      linked++;
    } catch (error: unknown) {
      const errno = (error as { errno?: number }).errno;
      if (errno === 1062) continue; // ER_DUP_ENTRY: already linked
      throw error;
    }
  }
  return linked;
}

/** Load a cross-seeder dependency or fail with an actionable message. */
export async function need<T extends BaseEntity>(
  repo: Repository<T>,
  where: FindOptionsWhere<T>,
  label: string,
): Promise<T> {
  const entity = await repo.findOne({ where });
  if (!entity) {
    throw new Error(
      `Missing dependency "${label}" — run its seeder first (see master.seed.ts order).`,
    );
  }
  return entity;
}

export function logResult(label: string, created: number, updated: number): void {
  console.log(`📊 ${label}: ${created} created, ${updated} already existed`);
}

/** Standalone entrypoint shared by every seeder file. */
export async function runStandalone(
  name: string,
  fn: (ds: DataSource) => Promise<void>,
): Promise<void> {
  console.log(`🌱 Seeding ${name} (standalone)...`);
  await AppDataSource.initialize();
  console.log('📦 Database connected');
  try {
    await fn(AppDataSource);
    console.log(`✨ ${name} seeding finished successfully!`);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error(`💥 ${name} seeding failed:`, error);
    try {
      await AppDataSource.destroy();
    } catch {
      // ignore cleanup errors
    }
    process.exit(1);
  }
}
