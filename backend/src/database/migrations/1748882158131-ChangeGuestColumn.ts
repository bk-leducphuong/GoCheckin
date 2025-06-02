import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeGuestColumn1748882158131 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE guests DROP COLUMN event_code`);
    await queryRunner.query(`ALTER TABLE guests ADD COLUMN event_id uuid`);
    await queryRunner.query(
      `ALTER TABLE guests ADD CONSTRAINT FK_guest_event FOREIGN KEY (event_id) REFERENCES events(event_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE guests DROP CONSTRAINT FK_guest_event`,
    );
    await queryRunner.query(`ALTER TABLE guests DROP COLUMN event_id`);
    await queryRunner.query(
      `ALTER TABLE guests ADD COLUMN event_code varchar(255)`,
    );
  }
}
