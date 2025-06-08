import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePocTableName1749397360940 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "poc" RENAME TO "pocs"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pocs" RENAME TO "poc"`);
  }
}
