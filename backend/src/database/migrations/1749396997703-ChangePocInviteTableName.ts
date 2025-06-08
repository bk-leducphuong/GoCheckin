import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangePocInviteTableName1749396997703
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invited_poc" RENAME TO "poc_invites"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "poc_invites" RENAME TO "invited_poc"`,
    );
  }
}
