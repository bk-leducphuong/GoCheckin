import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1704067200000 implements MigrationInterface {
  name = 'InitialMigration1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types first
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_role_enum" AS ENUM('admin', 'super_admin', 'poc')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."events_event_status_enum" AS ENUM('published', 'active', 'completed', 'cancelled')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."events_event_type_enum" AS ENUM('conference', 'workshop', 'meeting')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."events_access_type_enum" AS ENUM('public', 'private')`,
    );

    // Create accounts table
    await queryRunner.query(`
      CREATE TABLE "accounts" (
        "user_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying(100) NOT NULL,
        "password" character varying(255) NOT NULL,
        "full_name" character varying(255),
        "phone_number" character varying(50),
        "email" character varying(255) NOT NULL,
        "role" "public"."accounts_role_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_accounts_phone_number" UNIQUE ("phone_number"),
        CONSTRAINT "UQ_accounts_email" UNIQUE ("email"),
        CONSTRAINT "PK_accounts" PRIMARY KEY ("user_id")
      )
    `);

    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "tenant_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_code" character varying NOT NULL,
        "tenant_name" character varying NOT NULL,
        "tenant_address" text,
        "website" character varying(255),
        "contact_name" character varying(255),
        "contact_phone" character varying(50),
        "contact_email" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_tenants_tenant_code" UNIQUE ("tenant_code"),
        CONSTRAINT "PK_tenants" PRIMARY KEY ("tenant_id")
      )
    `);

    // Create events table
    await queryRunner.query(`
      CREATE TABLE "events" (
        "event_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_code" character varying(50) NOT NULL,
        "event_name" character varying(255) NOT NULL,
        "event_description" text,
        "event_status" "public"."events_event_status_enum" NOT NULL DEFAULT 'published',
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "venue_name" character varying(255),
        "venue_address" text,
        "capacity" integer,
        "event_type" "public"."events_event_type_enum",
        "terms_conditions" text,
        "images" text,
        "enabled" boolean NOT NULL DEFAULT true,
        "access_type" "public"."events_access_type_enum" NOT NULL DEFAULT 'public',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "tenant_code" character varying NOT NULL,
        CONSTRAINT "UQ_events_event_code" UNIQUE ("event_code"),
        CONSTRAINT "UQ_events_event_name" UNIQUE ("event_name"),
        CONSTRAINT "check_capacity_non_negative" CHECK ("capacity" >= 0),
        CONSTRAINT "PK_events" PRIMARY KEY ("event_id")
      )
    `);

    // Create account_tenant table
    await queryRunner.query(`
      CREATE TABLE "account_tenant" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "tenant_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_account_tenant" PRIMARY KEY ("id")
      )
    `);

    // Create guests table
    await queryRunner.query(`
      CREATE TABLE "guests" (
        "guest_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "guest_code" character varying(50) NOT NULL,
        "guest_name" character varying(255) NOT NULL,
        "guest_email" character varying(255) NOT NULL,
        "guest_phone" character varying(50),
        "company" character varying(255),
        "position" character varying(255),
        "is_invited" boolean NOT NULL DEFAULT false,
        "is_checkedin" boolean NOT NULL DEFAULT false,
        "checkin_time" TIMESTAMP,
        "checkout_time" TIMESTAMP,
        "qr_code" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "event_id" uuid NOT NULL,
        CONSTRAINT "UQ_guests_guest_code" UNIQUE ("guest_code"),
        CONSTRAINT "PK_guests" PRIMARY KEY ("guest_id")
      )
    `);

    // Create point_of_checkin table
    await queryRunner.query(`
      CREATE TABLE "point_of_checkin" (
        "poc_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "poc_code" character varying(50) NOT NULL,
        "poc_name" character varying(255) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "event_id" uuid NOT NULL,
        CONSTRAINT "UQ_point_of_checkin_poc_code" UNIQUE ("poc_code"),
        CONSTRAINT "PK_point_of_checkin" PRIMARY KEY ("poc_id")
      )
    `);

    // Create tokens table
    await queryRunner.query(`
      CREATE TABLE "tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "refresh_token" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_tokens" PRIMARY KEY ("id")
      )
    `);

    // Create otp table
    await queryRunner.query(`
      CREATE TABLE "otp" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "otp_code" character varying(6) NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_used" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_otp" PRIMARY KEY ("id")
      )
    `);

    // Create reset_tokens table
    await queryRunner.query(`
      CREATE TABLE "reset_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "token" character varying NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_used" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "account_id" uuid NOT NULL,
        CONSTRAINT "PK_reset_tokens" PRIMARY KEY ("id")
      )
    `);

    // Create floor_plans table
    await queryRunner.query(`
      CREATE TABLE "floor_plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "image_url" character varying NOT NULL,
        "width" integer NOT NULL,
        "height" integer NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "event_id" uuid NOT NULL,
        CONSTRAINT "REL_floor_plans_event_id" UNIQUE ("event_id"),
        CONSTRAINT "PK_floor_plans" PRIMARY KEY ("id")
      )
    `);

    // Create poc_locations table
    await queryRunner.query(`
      CREATE TABLE "poc_locations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "x_coordinate" double precision NOT NULL,
        "y_coordinate" double precision NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "poc_id" uuid NOT NULL,
        "floor_plan_id" uuid NOT NULL,
        CONSTRAINT "REL_poc_locations_poc_id" UNIQUE ("poc_id"),
        CONSTRAINT "PK_poc_locations" PRIMARY KEY ("id")
      )
    `);

    // Create poc_invites table
    await queryRunner.query(`
      CREATE TABLE "poc_invites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "invited_at" TIMESTAMP NOT NULL DEFAULT now(),
        "is_accepted" boolean NOT NULL DEFAULT false,
        "accepted_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "event_id" uuid NOT NULL,
        "poc_id" uuid,
        CONSTRAINT "PK_poc_invites" PRIMARY KEY ("id")
      )
    `);

    // Create guest_checkins table
    await queryRunner.query(`
      CREATE TABLE "guest_checkins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "checkin_time" TIMESTAMP NOT NULL DEFAULT now(),
        "checkout_time" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "guest_id" uuid NOT NULL,
        "poc_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        CONSTRAINT "PK_guest_checkins" PRIMARY KEY ("id")
      )
    `);

    // Create event_checkin_analytics table
    await queryRunner.query(`
      CREATE TABLE "event_checkin_analytics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "total_checkins" integer NOT NULL DEFAULT 0,
        "total_checkouts" integer NOT NULL DEFAULT 0,
        "current_attendance" integer NOT NULL DEFAULT 0,
        "peak_attendance" integer NOT NULL DEFAULT 0,
        "peak_time" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "event_id" uuid NOT NULL,
        CONSTRAINT "REL_event_checkin_analytics_event_id" UNIQUE ("event_id"),
        CONSTRAINT "PK_event_checkin_analytics" PRIMARY KEY ("id")
      )
    `);

    // Create point_checkin_analytics table
    await queryRunner.query(`
      CREATE TABLE "point_checkin_analytics" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "checkin_count" integer NOT NULL DEFAULT 0,
        "checkout_count" integer NOT NULL DEFAULT 0,
        "current_count" integer NOT NULL DEFAULT 0,
        "peak_count" integer NOT NULL DEFAULT 0,
        "peak_time" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "poc_id" uuid NOT NULL,
        "event_id" uuid NOT NULL,
        CONSTRAINT "PK_point_checkin_analytics" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_events_tenant_code" 
       FOREIGN KEY ("tenant_code") REFERENCES "tenants"("tenant_code") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "account_tenant" ADD CONSTRAINT "FK_account_tenant_user_id" 
       FOREIGN KEY ("user_id") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "account_tenant" ADD CONSTRAINT "FK_account_tenant_tenant_id" 
       FOREIGN KEY ("tenant_id") REFERENCES "tenants"("tenant_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "guests" ADD CONSTRAINT "FK_guests_event_id" 
       FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "point_of_checkin" ADD CONSTRAINT "FK_point_of_checkin_event_id" 
       FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_tokens_user_id" 
       FOREIGN KEY ("user_id") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "FK_otp_user_id" 
       FOREIGN KEY ("user_id") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "reset_tokens" ADD CONSTRAINT "FK_reset_tokens_account_id" 
       FOREIGN KEY ("account_id") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "floor_plans" ADD CONSTRAINT "FK_floor_plans_event_id" 
       FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "poc_locations" ADD CONSTRAINT "FK_poc_locations_poc_id" 
       FOREIGN KEY ("poc_id") REFERENCES "point_of_checkin"("poc_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "poc_locations" ADD CONSTRAINT "FK_poc_locations_floor_plan_id" 
       FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plans"("id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "poc_invites" ADD CONSTRAINT "FK_poc_invites_event_id" 
       FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "poc_invites" ADD CONSTRAINT "FK_poc_invites_poc_id" 
       FOREIGN KEY ("poc_id") REFERENCES "point_of_checkin"("poc_id") ON DELETE SET NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "guest_checkins" ADD CONSTRAINT "FK_guest_checkins_guest_id" 
       FOREIGN KEY ("guest_id") REFERENCES "guests"("guest_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "guest_checkins" ADD CONSTRAINT "FK_guest_checkins_poc_id" 
       FOREIGN KEY ("poc_id") REFERENCES "point_of_checkin"("poc_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "guest_checkins" ADD CONSTRAINT "FK_guest_checkins_event_id" 
       FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "event_checkin_analytics" ADD CONSTRAINT "FK_event_checkin_analytics_event_id" 
       FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "point_checkin_analytics" ADD CONSTRAINT "FK_point_checkin_analytics_poc_id" 
       FOREIGN KEY ("poc_id") REFERENCES "point_of_checkin"("poc_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "point_checkin_analytics" ADD CONSTRAINT "FK_point_checkin_analytics_event_id" 
       FOREIGN KEY ("event_id") REFERENCES "events"("event_id") ON DELETE CASCADE`,
    );

    // Create indexes for better performance
    await queryRunner.query(
      `CREATE INDEX "IDX_accounts_email" ON "accounts" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_accounts_username" ON "accounts" ("username")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_events_tenant_code" ON "events" ("tenant_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_events_start_time" ON "events" ("start_time")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guests_event_id" ON "guests" ("event_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guests_email" ON "guests" ("guest_email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_point_of_checkin_event_id" ON "point_of_checkin" ("event_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guest_checkins_guest_id" ON "guest_checkins" ("guest_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guest_checkins_poc_id" ON "guest_checkins" ("poc_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guest_checkins_checkin_time" ON "guest_checkins" ("checkin_time")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "public"."IDX_guest_checkins_checkin_time"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_guest_checkins_poc_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_guest_checkins_guest_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_point_of_checkin_event_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_guests_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_guests_event_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_start_time"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_tenant_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_accounts_username"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_accounts_email"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "point_checkin_analytics" DROP CONSTRAINT "FK_point_checkin_analytics_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_checkin_analytics" DROP CONSTRAINT "FK_point_checkin_analytics_poc_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "event_checkin_analytics" DROP CONSTRAINT "FK_event_checkin_analytics_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guest_checkins" DROP CONSTRAINT "FK_guest_checkins_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guest_checkins" DROP CONSTRAINT "FK_guest_checkins_poc_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guest_checkins" DROP CONSTRAINT "FK_guest_checkins_guest_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invites" DROP CONSTRAINT "FK_poc_invites_poc_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_invites" DROP CONSTRAINT "FK_poc_invites_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_locations" DROP CONSTRAINT "FK_poc_locations_floor_plan_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_locations" DROP CONSTRAINT "FK_poc_locations_poc_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "floor_plans" DROP CONSTRAINT "FK_floor_plans_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reset_tokens" DROP CONSTRAINT "FK_reset_tokens_account_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "FK_otp_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "FK_tokens_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "point_of_checkin" DROP CONSTRAINT "FK_point_of_checkin_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "guests" DROP CONSTRAINT "FK_guests_event_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_tenant" DROP CONSTRAINT "FK_account_tenant_tenant_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "account_tenant" DROP CONSTRAINT "FK_account_tenant_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_events_tenant_code"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "point_checkin_analytics"`);
    await queryRunner.query(`DROP TABLE "event_checkin_analytics"`);
    await queryRunner.query(`DROP TABLE "guest_checkins"`);
    await queryRunner.query(`DROP TABLE "poc_invites"`);
    await queryRunner.query(`DROP TABLE "poc_locations"`);
    await queryRunner.query(`DROP TABLE "floor_plans"`);
    await queryRunner.query(`DROP TABLE "reset_tokens"`);
    await queryRunner.query(`DROP TABLE "otp"`);
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP TABLE "point_of_checkin"`);
    await queryRunner.query(`DROP TABLE "guests"`);
    await queryRunner.query(`DROP TABLE "account_tenant"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(`DROP TABLE "accounts"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "public"."events_access_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."events_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."events_event_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_role_enum"`);
  }
}
