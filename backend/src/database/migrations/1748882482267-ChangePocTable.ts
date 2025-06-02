import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePocTable1748882482267 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE points_of_checkin RENAME TO poc`);
    await queryRunner.query(
      `ALTER TABLE poc RENAME COLUMN point_code TO poc_code`,
    );
    await queryRunner.query(
      `ALTER TABLE poc RENAME COLUMN point_name TO poc_name`,
    );
    await queryRunner.query(
      `ALTER TABLE poc RENAME COLUMN point_note TO description`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE poc RENAME TO points_of_checkin`);
    await queryRunner.query(
      `ALTER TABLE points_of_checkin RENAME COLUMN poc_code TO point_code`,
    );
    await queryRunner.query(
      `ALTER TABLE points_of_checkin RENAME COLUMN poc_name TO point_name`,
    );
    await queryRunner.query(
      `ALTER TABLE points_of_checkin RENAME COLUMN description TO point_note`,
    );
  }
}
