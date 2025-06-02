import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePocInviteColumns1748880074857 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poc_invite" DROP COLUMN "event_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invite" DROP COLUMN "point_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invite" ADD COLUMN "event_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invite" ADD COLUMN "poc_id" uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invite" ADD CONSTRAINT "FK_poc_invite_event_id" FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invite" ADD CONSTRAINT "FK_poc_invite_poc_id" FOREIGN KEY ("poc_id") REFERENCES "points_of_checkin"("poc_id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poc_invite" DROP CONSTRAINT "FK_poc_invite_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invite" DROP CONSTRAINT "FK_poc_invite_poc_id"`,
    );
    await queryRunner.query(`ALTER TABLE "poc_invites" DROP COLUMN "event_id"`);
    await queryRunner.query(`ALTER TABLE "poc_invites" DROP COLUMN "poc_id"`);
    await queryRunner.query(
      `ALTER TABLE "poc_invite" ADD COLUMN "event_code" VARCHAR(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invite" ADD COLUMN "point_code" VARCHAR(255) NOT NULL`,
    );
  }
}
