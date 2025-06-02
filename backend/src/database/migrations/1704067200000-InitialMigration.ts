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

    await queryRunner.query(
      `CREATE TYPE "public"."guests_guest_type_enum" AS ENUM('regular', 'vip', 'speaker', 'sponsor')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."guests_identity_type_enum" AS ENUM('id_card', 'passport', 'drivers_license', 'other')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."invited_poc_status_enum" AS ENUM('pending', 'accepted', 'rejected')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."poc_invite_status_enum" AS ENUM('pending', 'accepted', 'rejected')`,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."points_of_checkin_status_enum" AS ENUM('active', 'inactive', 'maintenance')`,
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
        "active" boolean NOT NULL DEFAULT true,
        "role" "public"."accounts_role_enum" NOT NULL,
        "company_name" character varying(255),
        "last_login" TIMESTAMP,
        "enabled" boolean NOT NULL DEFAULT true,
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
        "tenant_code" character varying(50) NOT NULL,
        "tenant_name" character varying(255) NOT NULL,
        "tenant_address" text,
        "website" character varying(255),
        "contact_name" character varying(255),
        "contact_phone" character varying(50),
        "contact_email" character varying(255),
        "registration_date" TIMESTAMP NOT NULL DEFAULT now(),
        "expiration_date" TIMESTAMP,
        "enabled" boolean NOT NULL DEFAULT true,
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
        "tenant_code" character varying(50) NOT NULL,
        "event_description" text,
        "event_status" "public"."events_event_status_enum" NOT NULL DEFAULT 'published',
        "start_time" TIMESTAMP NOT NULL,
        "end_time" TIMESTAMP NOT NULL,
        "venue_name" character varying(255),
        "venue_address" text,
        "capacity" integer,
        "terms_conditions" text,
        "enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "images" text,
        "event_type" "public"."events_event_type_enum",
        "access_type" "public"."events_access_type_enum" NOT NULL DEFAULT 'public',
        CONSTRAINT "UQ_events_event_code" UNIQUE ("event_code"),
        CONSTRAINT "UQ_events_event_name" UNIQUE ("event_name"),
        CONSTRAINT "check_capacity_non_negative" CHECK ("capacity" >= 0),
        CONSTRAINT "PK_events" PRIMARY KEY ("event_id")
      )
    `);

    // Create accounts_to_tenants table
    await queryRunner.query(`
      CREATE TABLE "accounts_to_tenants" (
        "user_id" uuid NOT NULL,
        "tenant_code" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    // Create guests table
    await queryRunner.query(`
      CREATE TABLE "guests" (
        "guest_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "identity_type" "public"."guests_identity_type_enum" NOT NULL DEFAULT 'id_card',
        "guest_type" "public"."guests_guest_type_enum" NOT NULL DEFAULT 'regular',
        "age_range" character varying(20),
        "gender" character varying(20),
        "registration_date" TIMESTAMP NOT NULL DEFAULT now(),
        "enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "image_url" character varying(255),
        "guest_code" character varying(255) NOT NULL,
        "event_code" character varying(255) NOT NULL,
        "description" text,
        CONSTRAINT "UQ_guests_guest_code" UNIQUE ("guest_code"),
        CONSTRAINT "PK_guests" PRIMARY KEY ("guest_id")
      )
    `);

    // Create points_of_checkin table
    await queryRunner.query(`
      CREATE TABLE "points_of_checkin" (
        "poc_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "point_code" character varying(50) NOT NULL,
        "point_name" character varying(255) NOT NULL,
        "point_note" text,
        "event_code" character varying(50) NOT NULL,
        "capacity" integer,
        "status" "public"."points_of_checkin_status_enum" NOT NULL DEFAULT 'active',
        "open_time" time,
        "close_time" time,
        "location_description" text,
        "floor_level" character varying(10),
        "enabled" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "user_id" uuid,
        CONSTRAINT "UQ_points_of_checkin_point_code" UNIQUE ("point_code"),
        CONSTRAINT "PK_points_of_checkin" PRIMARY KEY ("poc_id")
      )
    `);

    // Create refresh_tokens table
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" character varying NOT NULL,
        "refresh_token" character varying(500) NOT NULL,
        "device_info" character varying(255),
        "expires_at" TIMESTAMP NOT NULL,
        "is_revoked" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_refresh_tokens" PRIMARY KEY ("id")
      )
    `);

    // Create otp table
    await queryRunner.query(`
      CREATE TABLE "otp" (
        "id" SERIAL NOT NULL,
        "user_id" character varying NOT NULL,
        "hashed_otp" character varying NOT NULL,
        "exprised_at" TIMESTAMP NOT NULL,
        "attempts" integer NOT NULL,
        "accountUserId" uuid,
        CONSTRAINT "PK_otp" PRIMARY KEY ("id")
      )
    `);

    // Create reset_tokens table
    await queryRunner.query(`
      CREATE TABLE "reset_tokens" (
        "id" SERIAL NOT NULL,
        "user_id" character varying NOT NULL,
        "hashed_reset_token" character varying NOT NULL,
        "exprised_at" TIMESTAMP NOT NULL,
        "accountUserId" uuid,
        CONSTRAINT "PK_reset_tokens" PRIMARY KEY ("id")
      )
    `);

    // Create floor_plan table
    await queryRunner.query(`
      CREATE TABLE "floor_plan" (
        "floor_plan_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_code" character varying NOT NULL,
        "floor_plan_image_url" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_floor_plan" PRIMARY KEY ("floor_plan_id")
      )
    `);

    // Create poc_locations table
    await queryRunner.query(`
      CREATE TABLE "poc_locations" (
        "poc_location_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "floor_plan_id" uuid NOT NULL,
        "poc_id" uuid NOT NULL,
        "label" character varying(255) NOT NULL,
        "x_coordinate" double precision,
        "y_coordinate" double precision,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "REL_poc_locations_poc_id" UNIQUE ("poc_id"),
        CONSTRAINT "PK_poc_locations" PRIMARY KEY ("poc_location_id")
      )
    `);

    // Create invited_poc table
    await queryRunner.query(`
      CREATE TABLE "invited_poc" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_code" character varying(50) NOT NULL,
        "point_code" character varying(50) NOT NULL,
        "email" character varying(255) NOT NULL,
        "status" "public"."invited_poc_status_enum" NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "invite_code" character varying(50),
        CONSTRAINT "PK_invited_poc" PRIMARY KEY ("id")
      )
    `);

    // Create poc_invite table
    await queryRunner.query(`
      CREATE TABLE "poc_invite" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_code" character varying(50) NOT NULL,
        "point_code" character varying(50) NOT NULL,
        "email" character varying(255) NOT NULL,
        "status" "public"."poc_invite_status_enum" NOT NULL,
        "invite_code" character varying(50),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_poc_invite" PRIMARY KEY ("id")
      )
    `);

    // Create guest_checkins table
    await queryRunner.query(`
      CREATE TABLE "guest_checkins" (
        "checkin_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "guest_id" uuid NOT NULL,
        "event_code" character varying(50) NOT NULL,
        "checkin_time" TIMESTAMP NOT NULL DEFAULT now(),
        "active" boolean NOT NULL DEFAULT true,
        "guest_code" character varying(50) NOT NULL,
        "point_code" character varying(50) NOT NULL,
        CONSTRAINT "PK_guest_checkins" PRIMARY KEY ("checkin_id")
      )
    `);

    // Create event_checkin_analytics table
    await queryRunner.query(`
      CREATE TABLE "event_checkin_analytics" (
        "analyticsId" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "event_code" character varying NOT NULL,
        "time_interval" TIMESTAMP NOT NULL,
        "interval_duration" character varying NOT NULL,
        "checkin_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_checkin_analytics" PRIMARY KEY ("analyticsId")
      )
    `);

    // Create point_checkin_analytics table
    await queryRunner.query(`
      CREATE TABLE "point_checkin_analytics" (
        "analyticsId" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "point_code" character varying NOT NULL,
        "event_code" character varying NOT NULL,
        "time_interval" TIMESTAMP NOT NULL,
        "interval_duration" character varying NOT NULL,
        "checkin_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL,
        "updated_at" TIMESTAMP NOT NULL,
        CONSTRAINT "PK_point_checkin_analytics" PRIMARY KEY ("analyticsId")
      )
    `);

    // Add foreign key constraints where applicable
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_events_tenant_code" 
       FOREIGN KEY ("tenant_code") REFERENCES "tenants"("tenant_code") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "accounts_to_tenants" ADD CONSTRAINT "FK_accounts_to_tenants_user_id" 
       FOREIGN KEY ("user_id") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "accounts_to_tenants" ADD CONSTRAINT "FK_accounts_to_tenants_tenant_code" 
       FOREIGN KEY ("tenant_code") REFERENCES "tenants"("tenant_code") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "poc_locations" ADD CONSTRAINT "FK_poc_locations_poc_id" 
       FOREIGN KEY ("poc_id") REFERENCES "points_of_checkin"("poc_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "poc_locations" ADD CONSTRAINT "FK_poc_locations_floor_plan_id" 
       FOREIGN KEY ("floor_plan_id") REFERENCES "floor_plan"("floor_plan_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "FK_otp_accountUserId" 
       FOREIGN KEY ("accountUserId") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "reset_tokens" ADD CONSTRAINT "FK_reset_tokens_accountUserId" 
       FOREIGN KEY ("accountUserId") REFERENCES "accounts"("user_id") ON DELETE CASCADE`,
    );

    await queryRunner.query(
      `ALTER TABLE "points_of_checkin" ADD CONSTRAINT "FK_points_of_checkin_user_id" 
       FOREIGN KEY ("user_id") REFERENCES "accounts"("user_id") ON DELETE SET NULL`,
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
      `CREATE INDEX "IDX_events_event_code" ON "events" ("event_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guests_event_code" ON "guests" ("event_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guests_guest_code" ON "guests" ("guest_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_points_of_checkin_event_code" ON "points_of_checkin" ("event_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guest_checkins_guest_id" ON "guest_checkins" ("guest_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guest_checkins_event_code" ON "guest_checkins" ("event_code")`,
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
    await queryRunner.query(
      `DROP INDEX "public"."IDX_guest_checkins_event_code"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_guest_checkins_guest_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_points_of_checkin_event_code"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_guests_guest_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_guests_event_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_event_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_start_time"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_events_tenant_code"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_accounts_username"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_accounts_email"`);

    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "points_of_checkin" DROP CONSTRAINT "FK_points_of_checkin_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reset_tokens" DROP CONSTRAINT "FK_reset_tokens_accountUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "FK_otp_accountUserId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_locations" DROP CONSTRAINT "FK_poc_locations_floor_plan_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "poc_locations" DROP CONSTRAINT "FK_poc_locations_poc_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts_to_tenants" DROP CONSTRAINT "FK_accounts_to_tenants_tenant_code"`,
    );
    await queryRunner.query(
      `ALTER TABLE "accounts_to_tenants" DROP CONSTRAINT "FK_accounts_to_tenants_user_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT "FK_events_tenant_code"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "point_checkin_analytics"`);
    await queryRunner.query(`DROP TABLE "event_checkin_analytics"`);
    await queryRunner.query(`DROP TABLE "guest_checkins"`);
    await queryRunner.query(`DROP TABLE "poc_invite"`);
    await queryRunner.query(`DROP TABLE "invited_poc"`);
    await queryRunner.query(`DROP TABLE "poc_locations"`);
    await queryRunner.query(`DROP TABLE "floor_plan"`);
    await queryRunner.query(`DROP TABLE "reset_tokens"`);
    await queryRunner.query(`DROP TABLE "otp"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "points_of_checkin"`);
    await queryRunner.query(`DROP TABLE "guests"`);
    await queryRunner.query(`DROP TABLE "accounts_to_tenants"`);
    await queryRunner.query(`DROP TABLE "events"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(`DROP TABLE "accounts"`);

    // Drop enum types
    await queryRunner.query(
      `DROP TYPE "public"."points_of_checkin_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."poc_invite_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."invited_poc_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."guests_identity_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."guests_guest_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."events_access_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."events_event_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."events_event_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."accounts_role_enum"`);
  }
}
