import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePocColumn1748879887199 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "points_of_checkin" DROP COLUMN "event_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "points_of_checkin" ADD COLUMN "event_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "points_of_checkin" ADD CONSTRAINT "FK_points_of_checkin_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "points_of_checkin" DROP CONSTRAINT "FK_points_of_checkin_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "points_of_checkin" DROP COLUMN "event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "points_of_checkin" ADD COLUMN "event_code" character varying NOT NULL`,
    );
  }
}
