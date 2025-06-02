# Database Migrations

This directory contains TypeORM migrations for the GoCheckin application.

## Setup

1. Make sure you have your environment variables set up in `.env.development`:

   ```
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USER=postgres
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=go_checkin
   ```

2. Ensure your PostgreSQL database is running and accessible.

## Available Commands

### Generate a new migration

```bash
npm run migration:generate -- src/database/migrations/YourMigrationName
```

### Create an empty migration

```bash
npm run migration:create -- src/database/migrations/YourMigrationName
```

### Run pending migrations

```bash
npm run migration:run
```

### Revert the last migration

```bash
npm run migration:revert
```

### Show migration status

```bash
npm run migration:show
```

### Drop database schema

```bash
npm run schema:drop
```

### Sync schema (development only)

```bash
npm run schema:sync
```

## Migration Guidelines

1. Always review generated migrations before running them
2. Test migrations on a copy of production data before applying to production
3. Never edit migrations that have already been run in production
4. Use descriptive names for your migrations
5. Include both `up` and `down` methods for reversibility

## Initial Setup

Run the initial migration to create all tables:

```bash
npm run migration:run
```
