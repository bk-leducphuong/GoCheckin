import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAccountTenantColumn1748877909278
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "accounts_to_tenants" DROP CONSTRAINT "FK_accounts_to_tenants_tenant_code";
            ALTER TABLE "accounts_to_tenants" DROP COLUMN "tenant_code";
            ALTER TABLE "accounts_to_tenants" ADD COLUMN "tenant_id" uuid NOT NULL;
            ALTER TABLE "accounts_to_tenants" ADD CONSTRAINT "FK_accounts_to_tenants_tenant_id" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id");
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "accounts_to_tenants" DROP CONSTRAINT "FK_accounts_to_tenants_tenant_id";
            ALTER TABLE "accounts_to_tenants" DROP COLUMN "tenant_id";
            ALTER TABLE "accounts_to_tenants" ADD COLUMN "tenant_code" character varying NOT NULL;
            ALTER TABLE "accounts_to_tenants" ADD CONSTRAINT "FK_accounts_to_tenants_tenant_code" FOREIGN KEY ("tenant_code") REFERENCES "tenants"("tenant_code");
        `);
  }
}
