import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeGuestColumn1748882066260 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE guest_checkins DROP COLUMN event_code`,
    );
    await queryRunner.query(
      `ALTER TABLE guest_checkins ADD COLUMN event_id uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE guest_checkins ADD CONSTRAINT FK_guest_checkin_event FOREIGN KEY (event_id) REFERENCES events(event_id)`,
    );
    await queryRunner.query(
      `ALTER TABLE guest_checkins DROP COLUMN point_code`,
    );
    await queryRunner.query(
      `ALTER TABLE guest_checkins ADD COLUMN poc_id uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE guest_checkins ADD CONSTRAINT FK_guest_checkin_poc FOREIGN KEY (poc_id) REFERENCES points_of_checkin(poc_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE guest_checkins DROP CONSTRAINT FK_guest_checkin_event`,
    );
    await queryRunner.query(`ALTER TABLE guest_checkins DROP COLUMN event_id`);
    await queryRunner.query(
      `ALTER TABLE guest_checkins DROP CONSTRAINT FK_guest_checkin_poc`,
    );
    await queryRunner.query(`ALTER TABLE guest_checkins DROP COLUMN poc_id`);
    await queryRunner.query(
      `ALTER TABLE guest_checkins ADD COLUMN event_code varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE guest_checkins ADD COLUMN point_code varchar(255)`,
    );
  }
}
