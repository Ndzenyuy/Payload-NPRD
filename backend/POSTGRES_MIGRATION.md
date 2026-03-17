# PostgreSQL Migration Steps

## 1. Install Dependencies

```bash
pnpm install
```

This will install `@payloadcms/db-postgres` instead of SQLite.

## 2. Environment Variables (ECS)

The ECS task definition automatically injects these from SSM Parameter Store:

- `DATABASE_URI` - Full PostgreSQL connection string (from `/nonprod/testapp/db/uri`)
- `PAYLOAD_SECRET` - Payload CMS secret (from `/nonprod/testapp/payload/secret`)
- `PAYLOAD_URL` - Backend API URL (from ALB DNS)
- `FRONTEND_URL` - Frontend URL (from ALB DNS)

## 3. Database Initialization

The Lambda function (`testapp-db-init-nonprod`) automatically:
- Creates database: `testapp_db`
- Creates user: `testapp_user`
- Grants all privileges
- Stores credentials in SSM Parameter Store

## 4. Local Development

For local development, create `.env`:

```bash
DATABASE_URI=postgresql://testapp_user:password@localhost:5432/testapp_db
PAYLOAD_SECRET=your-local-secret
PAYLOAD_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

## 5. Deploy

After changes, commit and push to trigger GitHub Actions:

```bash
git add .
git commit -m "Migrate from SQLite to PostgreSQL"
git push origin main
```

GitHub Actions will:
1. Build Docker image with PostgreSQL adapter
2. Push to ECR
3. Update ECS task definition
4. Deploy to ECS cluster

## 6. Verify

Check ECS task logs:

```bash
aws logs tail /ecs/testapp-backend-nonprod --follow
```

You should see Payload connecting to PostgreSQL successfully.
