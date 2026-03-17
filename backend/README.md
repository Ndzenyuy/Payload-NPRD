# CHA Corp Web - Backend

Payload CMS backend application deployed on AWS ECS with RDS PostgreSQL database.

## Architecture

- **CMS**: Payload CMS (Node.js)
- **Database**: RDS PostgreSQL 16.3 Multi-AZ
- **Hosting**: AWS ECS (EC2 launch type)
- **Secrets**: AWS Systems Manager Parameter Store
- **Load Balancer**: Application Load Balancer (routes `/api/*`)
- **CI/CD**: GitHub Actions with OIDC authentication

## Environments

### Non-Production
- **API URL**: http://ALB-testapp-NPRD-668180264.us-east-1.elb.amazonaws.com/api
- **ECS Cluster**: ECS-Cluster-Shared-Services-NPRD
- **ECR Repository**: testapp-backend-nonprod
- **RDS Instance**: RDS-Shared-Services-NPRD (db.t3.micro)
- **Database**: `testapp_db` (auto-created by Lambda)

### Production
- **API URL**: TBD (after production deployment)
- **ECS Cluster**: ECS-Cluster-Shared-Services-PRD
- **ECR Repository**: testapp-backend-prod
- **RDS Instance**: RDS-Shared-Services-PRD (db.r6g.large)

## Database Setup

### PostgreSQL Configuration

This application uses **PostgreSQL** via `@payloadcms/db-postgres` adapter.

### Automatic Database Initialization

A Lambda function (`testapp-db-init-nonprod`) automatically runs during infrastructure deployment and:

1. Creates dedicated database: `testapp_db`
2. Creates dedicated user: `testapp_user` with secure password
3. Grants all necessary privileges
4. Stores credentials in AWS Systems Manager Parameter Store:
   - `/nonprod/testapp/db/name` - Database name
   - `/nonprod/testapp/db/username` - Database username
   - `/nonprod/testapp/db/password` - Database password (SecureString)
   - `/nonprod/testapp/db/uri` - Full PostgreSQL connection string
   - `/nonprod/testapp/db/endpoint` - Database host:port
   - `/nonprod/testapp/payload/secret` - Payload CMS secret key

### Environment Variables (ECS)

The ECS task definition automatically retrieves from SSM Parameter Store:

- `DATABASE_URI` - PostgreSQL connection string (from `/nonprod/testapp/db/uri`)
- `PAYLOAD_SECRET` - Payload CMS secret (from `/nonprod/testapp/payload/secret`)
- `PAYLOAD_URL` - Backend API URL (auto-configured from ALB)
- `FRONTEND_URL` - Frontend URL (auto-configured from ALB)
- `ENVIRONMENT` - Deployment environment (nonprod/prod)

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local instance or access to RDS)
- AWS CLI (for retrieving credentials)

### Setup

1. **Get Database Credentials from AWS**:

```bash
# Configure AWS CLI
aws configure

# Retrieve database URI
DB_URI=$(aws ssm get-parameter --name /nonprod/testapp/db/uri --with-decryption --query 'Parameter.Value' --output text)

# Retrieve Payload secret
PAYLOAD_SECRET=$(aws ssm get-parameter --name /nonprod/testapp/payload/secret --with-decryption --query 'Parameter.Value' --output text)

echo "DATABASE_URI=$DB_URI"
echo "PAYLOAD_SECRET=$PAYLOAD_SECRET"
```

2. **Create `.env` file**:

```bash
cat > .env << EOF
DATABASE_URI=$DB_URI
PAYLOAD_SECRET=$PAYLOAD_SECRET
PAYLOAD_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000
PORT=8080
EOF
```

3. **Install and Run**:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:8080](http://localhost:8080)

### Local PostgreSQL (Alternative)

If you prefer a local PostgreSQL instance:

```bash
# Install PostgreSQL
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Create local database
psql postgres -c "CREATE DATABASE testapp_local;"
psql postgres -c "CREATE USER testapp_local WITH PASSWORD 'localpass';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE testapp_local TO testapp_local;"

# Update .env
DATABASE_URI=postgresql://testapp_local:localpass@localhost:5432/testapp_local
PAYLOAD_SECRET=local-dev-secret-min-32-chars-long
```

## Testing on EC2

To test before deploying to ECS:

### 1. Launch EC2 Instance
- AMI: Amazon Linux 2023 or Ubuntu 22.04
- Instance Type: t3.small minimum (2GB RAM)
- Security Group: Allow ports 22, 8080
- Same VPC as RDS or configure VPC peering

### 2. Setup on EC2

```bash
ssh -i your-key.pem ec2-user@<EC2_IP>

# Install Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs git postgresql15
sudo npm install -g pnpm

# Configure AWS CLI
aws configure

# Get credentials
DB_URI=$(aws ssm get-parameter --name /nonprod/testapp/db/uri --with-decryption --query 'Parameter.Value' --output text)
PAYLOAD_SECRET=$(aws ssm get-parameter --name /nonprod/testapp/payload/secret --with-decryption --query 'Parameter.Value' --output text)

# Clone and setup
git clone <YOUR_REPO_URL>
cd Github-Repo-CHA-Corp-Web-Backend

# Create .env
cat > .env << EOF
DATABASE_URI=$DB_URI
PAYLOAD_SECRET=$PAYLOAD_SECRET
PAYLOAD_URL=http://<EC2_PUBLIC_IP>:8080
FRONTEND_URL=http://<EC2_PUBLIC_IP>:3000
PORT=8080
EOF

# Install and run
pnpm install
pnpm build
pnpm start
```

### 3. Test Connection

```bash
curl http://<EC2_PUBLIC_IP>:8080/api/health
```

## Deployment

Automatic deployment via GitHub Actions:
- **Push to main**: Deploys to non-production
- **Create release**: Deploys to production

### GitHub Secrets Required
- `AWS_ROLE_ARN`: arn:aws:iam::761018883680:role/AWS-GitHub-Actions-Role

### Manual Deployment

```bash
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions will:
1. Build Docker image with PostgreSQL adapter
2. Push to ECR: `testapp-backend-nonprod`
3. Update ECS task definition
4. Deploy to ECS cluster
5. ECS retrieves `DATABASE_URI` and `PAYLOAD_SECRET` from SSM

## Testing the Deployment

```bash
# Test backend API health
curl http://ALB-testapp-NPRD-668180264.us-east-1.elb.amazonaws.com/api/health

# Test Payload admin (if enabled)
curl http://ALB-testapp-NPRD-668180264.us-east-1.elb.amazonaws.com/api/admin

# Check ECS logs
aws logs tail /ecs/testapp-backend-nonprod --follow
```

## Database Migrations

Payload CMS automatically handles schema migrations. When you:
1. Add/modify collections
2. Deploy new version
3. Payload detects schema changes and migrates automatically

## Collections

- **Users**: Auth-enabled collection with admin panel access
- **Media**: Upload-enabled collection with image resizing
- **Pages**: Content pages collection

## Troubleshooting

### Database Connection Issues

```bash
# Verify credentials in SSM
aws ssm get-parameter --name /nonprod/testapp/db/uri --with-decryption

# Test direct connection
psql "$(aws ssm get-parameter --name /nonprod/testapp/db/uri --with-decryption --query 'Parameter.Value' --output text)" -c "SELECT version();"
```

### ECS Task Failures

```bash
# Check task logs
aws logs tail /ecs/testapp-backend-nonprod --follow

# Check task status
aws ecs describe-services --cluster ECS-Cluster-Shared-Services-NPRD --services testapp-backend-nonprod
```

## Support

For issues, reach out on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).