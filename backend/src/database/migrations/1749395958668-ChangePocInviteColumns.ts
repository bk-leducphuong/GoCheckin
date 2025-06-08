import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePocInviteColumns1749395958668 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invited_poc" DROP COLUMN "event_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invited_poc" DROP COLUMN "point_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invited_poc" ADD COLUMN "event_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invited_poc" ADD COLUMN "poc_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invited_poc" ADD CONSTRAINT "FK_invited_poc_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "invited_poc" ADD CONSTRAINT "FK_invited_poc_poc_id" FOREIGN KEY ("poc_id") REFERENCES "poc"("poc_id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invited_poc" DROP CONSTRAINT "FK_invited_poc_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invited_poc" DROP CONSTRAINT "FK_invited_poc_poc_id"`,
    );
    await queryRunner.query(`ALTER TABLE "invited_poc" DROP COLUMN "event_id"`);
    await queryRunner.query(`ALTER TABLE "invited_poc" DROP COLUMN "poc_id"`);
    await queryRunner.query(
      `ALTER TABLE "invited_poc" ADD COLUMN "event_code" VARCHAR(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "invited_poc" ADD COLUMN "point_code" VARCHAR(255) NOT NULL`,
    );
  }
}
