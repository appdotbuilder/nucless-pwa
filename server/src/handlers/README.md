# Nucless Admin Seeding

The `seed_admin_user.ts` handler provides functionality to create a default admin user during database initialization.

## Usage

### Direct execution
```bash
bun run server/src/handlers/seed_admin_user.ts
```

### Docker Integration

To integrate this seeding into your Docker setup, modify your `docker-compose.yml` to include a seeding service:

```yaml
services:
  app:
    # ... existing app configuration
    depends_on:
      db-seed:
        condition: service_completed_successfully

  db-seed:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: ${DB_SEED_CONTAINER_NAME:-app-db-seed}
    command: ["bun", "run", "/app/server/src/handlers/seed_admin_user.ts"]
    working_dir: /app
    environment:
      - APP_DATABASE_URL=${APP_DATABASE_URL:-postgres://postgres:postgres@postgres:5432/postgres}
    depends_on:
      db-push:
        condition: service_completed_successfully

  # ... rest of your services
```

## Default Admin Credentials

The seeding creates an admin user with the following credentials:

- **Email**: `admin@demo.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Name**: `Admin User`

⚠️ **Security Warning**: Change the default password after first login in production!

## Features

- ✅ **Idempotent**: Safe to run multiple times - won't create duplicates
- ✅ **Secure**: Password is properly hashed using Bun's password hashing
- ✅ **Logging**: Provides clear console output about the seeding process
- ✅ **Error Handling**: Proper error handling and exit codes

## Function Signature

```typescript
export const seedAdminUser = async (): Promise<User | null>
```

- Returns the created admin user (without password) if successful
- Returns `null` if an admin user already exists
- Throws an error if the operation fails