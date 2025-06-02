import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePocAnalyticsColumn1748881600701
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics DROP COLUMN point_code`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics DROP COLUMN event_code`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics ADD COLUMN event_id uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics ADD COLUMN poc_id uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics ADD CONSTRAINT FK_poc_checkin_analytics_event FOREIGN KEY (event_id) REFERENCES events(event_id)`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics ADD CONSTRAINT FK_poc_checkin_analytics_poc FOREIGN KEY (poc_id) REFERENCES points_of_checkin(poc_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics DROP CONSTRAINT FK_poc_checkin_analytics_event`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics DROP CONSTRAINT FK_poc_checkin_analytics_poc`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics DROP COLUMN event_id`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics DROP COLUMN point_id`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics ADD COLUMN point_code varchar(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE poc_checkin_analytics ADD COLUMN event_code varchar(255)`,
    );
  }
}
