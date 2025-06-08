import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeOtpColumn1749396154574 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE otp DROP CONSTRAINT "FK_otp_accountUserId"`,
    );
    await queryRunner.query(`ALTER TABLE otp DROP COLUMN "accountUserId"`);
    await queryRunner.query(`ALTER TABLE otp DROP COLUMN "user_id"`);
    await queryRunner.query(`ALTER TABLE otp ADD COLUMN "user_id" uuid`);
    await queryRunner.query(
      `ALTER TABLE otp ADD CONSTRAINT "FK_otp_user_id" FOREIGN KEY ("user_id") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE otp DROP CONSTRAINT "FK_otp_user_id"`);
    await queryRunner.query(`ALTER TABLE otp ADD COLUMN "accountUserId" uuid`);
    await queryRunner.query(
      `ALTER TABLE otp ADD CONSTRAINT "FK_otp_accountUserId" FOREIGN KEY ("accountUserId") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );
  }
}
