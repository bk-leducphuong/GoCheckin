import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFloorPlanColumn1748881830965 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE floor_plan DROP COLUMN event_code`);
    await queryRunner.query(`ALTER TABLE floor_plan ADD COLUMN event_id uuid`);
    await queryRunner.query(
      `ALTER TABLE floor_plan ADD CONSTRAINT FK_floor_plan_event FOREIGN KEY (event_id) REFERENCES events(event_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE floor_plan DROP CONSTRAINT FK_floor_plan_event`,
    );
    await queryRunner.query(`ALTER TABLE floor_plan DROP COLUMN event_id`);
    await queryRunner.query(
      `ALTER TABLE floor_plan ADD COLUMN event_code varchar(255)`,
    );
  }
}
