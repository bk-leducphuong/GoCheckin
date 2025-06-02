# Migration Setup Test Guide

Follow these steps to test your migration configuration:

## 1. Environment Setup

Create a `.env.development` file in the backend root:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=go_checkin
NODE_ENV=development
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRATION=15m
CLIENT_URL=http://localhost:3000
```

## 2. Database Preparation

```sql
-- Connect to PostgreSQL and create the database
CREATE DATABASE go_checkin;
```

## 3. Test Migration Commands

### Check Migration Status

```bash
npm run migration:show
```

**Expected Output**: Should show no migrations have been run yet.

### Run Initial Migration

```bash
npm run migration:run
```

**Expected Output**: Should create all 15 tables and show migration completed.

### Verify Migration Status

```bash
npm run migration:show
```

**Expected Output**: Should show the InitialMigration as completed.

### Test Migration Revert (Optional)

```bash
npm run migration:revert
```

**Expected Output**: Should drop all tables and revert the migration.

## 4. Verify Database Schema

After running the migration, check that these tables exist:

### Core Tables

- `accounts` (with role enum)
- `tenants`
- `events` (with status, type, access_type enums)
- `guests`
- `point_of_checkin`

### Auth Tables

- `tokens`
- `otp`
- `reset_tokens`

### Analytics Tables

- `event_checkin_analytics`
- `point_checkin_analytics`

### Relationship Tables

- `account_tenant`
- `guest_checkins`
- `floor_plans`
- `poc_locations`
- `poc_invites`

### Migration Tracking

- `migrations` (created by TypeORM)

## 5. Test New Migration Generation

To test generating a new migration:

```bash
# This should work if entities are correctly configured
npm run migration:generate --name=TestMigration
```

## Troubleshooting

### Common Issues:

1. **"database does not exist"**: Create the database first
2. **"permission denied"**: Check database user permissions
3. **"relation already exists"**: Drop existing tables or use a fresh database
4. **"cannot find entities"**: Check that your entities are properly exported

### Configuration Files to Check:

- `data-source.ts` - TypeORM CLI configuration
- `src/database/config/database.config.ts` - NestJS configuration
- `package.json` - Migration scripts
- `.env.development` - Environment variables

## Success Indicators

✅ **Migration commands run without errors**
✅ **All 15 tables created with correct structure**
✅ **Foreign key constraints working**
✅ **Indexes created for performance**
✅ **Enum types properly defined**
