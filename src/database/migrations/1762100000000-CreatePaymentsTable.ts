import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Auditable payment history for the push-based PSP webhook path
 * (`POST /payments/webhook`). The pull-based `verifyPayment` flow is
 * unchanged; this table only records outcomes idempotently by `paymentId`.
 */
export class CreatePaymentsTable1762100000000 implements MigrationInterface {
  name = 'CreatePaymentsTable1762100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`payments\` (
        \`id\` char(36) NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deletedAt\` datetime(6) NULL,
        \`paymentId\` varchar(255) NOT NULL,
        \`orderId\` char(36) NOT NULL,
        \`amount\` int NOT NULL,
        \`provider\` varchar(255) NOT NULL DEFAULT 'mock',
        \`status\` enum('pending', 'succeeded', 'failed') NOT NULL DEFAULT 'pending',
        \`rawPayload\` json NULL,
        UNIQUE INDEX \`IDX_payments_paymentId\` (\`paymentId\`),
        INDEX \`IDX_payments_orderId\` (\`orderId\`),
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`payments\``);
  }
}
