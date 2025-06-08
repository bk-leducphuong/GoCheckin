import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeOtpTableName1749397568558 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otp" RENAME TO "otps"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "otps" RENAME TO "otp"`);
  }
}
