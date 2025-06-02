import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEventsColumn1748878083089 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_events_tenant_code";
            ALTER TABLE "events" DROP COLUMN "tenant_code";
            ALTER TABLE "events" ADD COLUMN "tenant_id" uuid NOT NULL;
            ALTER TABLE "events" ADD CONSTRAINT "FK_events_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_events_tenant_id";
            ALTER TABLE "events" DROP COLUMN "tenant_id";
            ALTER TABLE "events" ADD COLUMN "tenant_code" character varying NOT NULL;
            ALTER TABLE "events" ADD CONSTRAINT "FK_events_tenant_code" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("tenant_code");
        `);
  }
}
