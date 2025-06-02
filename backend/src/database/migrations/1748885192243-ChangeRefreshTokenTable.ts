import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeRefreshTokenTable1748885192243
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE refresh_tokens DROP COLUMN user_id`);
    await queryRunner.query(
      `ALTER TABLE refresh_tokens ADD COLUMN user_id uuid NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE refresh_tokens ADD CONSTRAINT FK_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES accounts(user_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE refresh_tokens DROP CONSTRAINT FK_refresh_tokens_user`,
    );
  }
}
