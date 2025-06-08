import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeResetTokenColumn1749396738176 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE reset_tokens DROP CONSTRAINT "FK_reset_tokens_accountUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE reset_tokens DROP COLUMN "accountUserId"`,
    );
    await queryRunner.query(`ALTER TABLE reset_tokens DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE reset_tokens ADD COLUMN "user_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE reset_tokens ADD CONSTRAINT "FK_reset_tokens_user_id" FOREIGN KEY ("user_id") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE reset_tokens DROP CONSTRAINT "FK_reset_tokens_user_id"`,
    );
    await queryRunner.query(`ALTER TABLE reset_tokens DROP COLUMN "user_id"`);
    await queryRunner.query(
      `ALTER TABLE reset_tokens ADD COLUMN "accountUserId" uuid`,
    );
  }
}
