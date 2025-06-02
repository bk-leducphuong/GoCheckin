import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeEventAnalyticsColumn1748881583520
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_checkin_analytics DROP COLUMN event_code`,
    );
    await queryRunner.query(
      `ALTER TABLE event_checkin_analytics ADD COLUMN event_id uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE event_checkin_analytics ADD CONSTRAINT FK_event_checkin_analytics_event FOREIGN KEY (event_id) REFERENCES events(event_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE event_checkin_analytics DROP CONSTRAINT FK_event_checkin_analytics_event`,
    );
    await queryRunner.query(
      `ALTER TABLE event_checkin_analytics DROP COLUMN event_id`,
    );
    await queryRunner.query(
      `ALTER TABLE event_checkin_analytics ADD COLUMN event_code varchar(255)`,
    );
  }
}
