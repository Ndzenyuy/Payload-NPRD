# CHA Corp Web - Frontend

Next.js frontend application deployed on AWS ECS with RDS PostgreSQL backend.

## Architecture

- **Hosting**: AWS ECS (EC2 launch type)
- **Load Balancer**: Application Load Balancer
- **Backend API**: Payload CMS on `/api/*` routes
- **Database**: RDS PostgreSQL Multi-AZ
- **CI/CD**: GitHub Actions with OIDC authentication

## Environments

### Non-Production
- **URL**: http://ALB-testapp-NPRD-668180264.us-east-1.elb.amazonaws.com
- **ECS Cluster**: ECS-Cluster-Shared-Services-NPRD
- **ECR Repository**: testapp-frontend-nonprod

### Production
- **URL**: TBD (after production deployment)
- **ECS Cluster**: ECS-Cluster-Shared-Services-PRD
- **ECR Repository**: testapp-frontend-prod

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

- `BACKEND_URL`: Backend API endpoint (auto-configured in ECS)
- `ENVIRONMENT`: Deployment environment (nonprod/prod)

## Deployment

Automatic deployment via GitHub Actions:
- **Push to main**: Deploys to non-production
- **Create release**: Deploys to production

### GitHub Secrets Required
- `AWS_ROLE_ARN`: arn:aws:iam::761018883680:role/AWS-GitHub-Actions-Role

## Testing the Deployment

```bash
# Test frontend
curl http://ALB-testapp-NPRD-668180264.us-east-1.elb.amazonaws.com

# Test backend API
curl http://ALB-testapp-NPRD-668180264.us-east-1.elb.amazonaws.com/api/health
```