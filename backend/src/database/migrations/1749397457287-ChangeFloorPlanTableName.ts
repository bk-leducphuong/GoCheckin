import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFloorPlanTableName1749397457287
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "floor_plan" RENAME TO "floor_plans"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "floor_plans" RENAME TO "floor_plan"`);
  }
}
