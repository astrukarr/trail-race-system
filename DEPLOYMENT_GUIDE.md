# Trail Race System - Deployment & Running Instructions

## 📋 Overview

This document provides comprehensive instructions for running the Trail Race System in both development and production environments.

## 🛠️ Prerequisites

### Required Software

- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Node.js** (version 18+) - for local development
- **Git** - for version control

### System Requirements

- **RAM:** Minimum 4GB, Recommended 8GB+
- **Disk Space:** Minimum 2GB free space
- **OS:** Windows 10+, macOS 10.15+, or Linux

## 🚀 Quick Start (Recommended)

### 1. Clone Repository

```bash
git clone <repository-url>
cd trail-race-system
```

### 2. Start All Services

```bash
docker-compose up -d
```

### 3. Access Application

- **Web Application:** http://localhost:3000
- **Command Service API:** http://localhost:3001
- **Query Service API:** http://localhost:3002
- **RabbitMQ Management:** http://localhost:15672
- **PostgreSQL:** localhost:5432

### 4. Default Credentials

- **RabbitMQ Management:** guest/guest
- **PostgreSQL:** trail_race_user/trail_race_password

## 🔧 Development Environment

### Option 1: Full Docker Development (Recommended)

#### Start Development Environment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

#### Development Commands

```bash
# Rebuild specific service
docker-compose up --build -d web-app

# View service logs
docker-compose logs -f web-app

# Execute commands in container
docker-compose exec web-app npm install
docker-compose exec command-service npm test

# Restart specific service
docker-compose restart web-app
```

#### Hot Reload Development

```bash
# For frontend changes (web-app)
docker-compose up --build -d web-app

# For backend changes (command-service)
docker-compose up --build -d command-service

# For query service changes
docker-compose up --build -d query-service
```

### Option 2: Hybrid Development (Backend Docker + Frontend Local)

#### Start Backend Services

```bash
# Start only backend services
docker-compose up -d postgres rabbitmq command-service query-service
```

#### Run Frontend Locally

```bash
cd web-app

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:3000
```

#### Environment Variables for Local Frontend

```bash
# Create: web-app/.env.local
NEXT_PUBLIC_COMMAND_API_URL=http://localhost:3001
NEXT_PUBLIC_QUERY_API_URL=http://localhost:3002
```

### Option 3: Full Local Development

#### Prerequisites

- PostgreSQL 15+
- RabbitMQ 3.8+
- Node.js 18+

#### Database Setup

```bash
# Install PostgreSQL
# Create database
createdb trail_race_db

# Run schema
psql -d trail_race_db -f database/schema.sql
```

#### RabbitMQ Setup

```bash
# Install RabbitMQ
# Enable management plugin
rabbitmq-plugins enable rabbitmq_management
```

#### Start Services Locally

```bash
# Terminal 1: Command Service
cd command-service
npm install
npm run dev

# Terminal 2: Query Service
cd query-service
npm install
npm run dev

# Terminal 3: Web App
cd web-app
npm install
npm run dev
```

## 🏭 Production Environment

### Option 1: Docker Production (Recommended)

#### Production Configuration

```bash
# Create production environment file
cp .env.example .env.production

# Edit production variables
nano .env.production
```

#### Production Environment Variables

```bash
# .env.production
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret-key-change-in-production
DATABASE_URL=postgresql://user:password@postgres:5432/trail_race_db
RABBITMQ_URL=amqp://user:password@rabbitmq:5672

# Frontend
NEXT_PUBLIC_COMMAND_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_QUERY_API_URL=https://query.yourdomain.com
```

#### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Verify services
docker-compose ps
```

#### Production Docker Compose Override

```yaml
# docker-compose.prod.yml
version: "3.8"

services:
  web-app:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  command-service:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  query-service:
    environment:
      - NODE_ENV=production
    restart: unless-stopped

  postgres:
    restart: unless-stopped

  rabbitmq:
    restart: unless-stopped
```

### Option 2: Cloud Deployment

#### AWS Deployment

```bash
# Install AWS CLI
# Configure AWS credentials
aws configure

# Deploy with AWS ECS
aws ecs create-cluster --cluster-name trail-race-cluster
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster trail-race-cluster --service-name trail-race-service
```

#### DigitalOcean Deployment

```bash
# Create Droplet
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone repository
git clone <repository-url>
cd trail-race-system

# Deploy
docker-compose up -d
```

#### Heroku Deployment

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create Heroku apps
heroku create trail-race-web-app
heroku create trail-race-command-service
heroku create trail-race-query-service

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku main
```

## 🔍 Monitoring & Maintenance

### Health Checks

```bash
# Check all services
docker-compose ps

# Check specific service health
docker inspect trail-race-web-app --format='{{.State.Health.Status}}'

# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3001/health
curl http://localhost:3002/health
```

### Logs Management

```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs web-app
docker-compose logs command-service
docker-compose logs query-service

# Follow logs in real-time
docker-compose logs -f

# View logs with timestamps
docker-compose logs -t
```

### Database Management

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U trail_race_user -d trail_race_db

# Backup database
docker-compose exec postgres pg_dump -U trail_race_user trail_race_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U trail_race_user -d trail_race_db < backup.sql
```

### RabbitMQ Management

```bash
# Access RabbitMQ Management UI
open http://localhost:15672

# Check RabbitMQ status
docker-compose exec rabbitmq rabbitmqctl status

# List queues
docker-compose exec rabbitmq rabbitmqctl list_queues
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001
lsof -i :3002

# Kill process using port
kill -9 <PID>

# Or change ports in docker-compose.yml
```

#### Services Not Starting

```bash
# Check service logs
docker-compose logs <service-name>

# Restart specific service
docker-compose restart <service-name>

# Rebuild service
docker-compose up --build -d <service-name>
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Check database exists
docker-compose exec postgres psql -U trail_race_user -l

# Reset database
docker-compose down -v
docker-compose up -d
```

#### RabbitMQ Connection Issues

```bash
# Check RabbitMQ status
docker-compose exec rabbitmq rabbitmqctl status

# Reset RabbitMQ
docker-compose restart rabbitmq

# Check RabbitMQ logs
docker-compose logs rabbitmq
```

### Performance Issues

#### High Memory Usage

```bash
# Check container resource usage
docker stats

# Limit container memory
# Add to docker-compose.yml:
services:
  web-app:
    deploy:
      resources:
        limits:
          memory: 512M
```

#### Slow Database Queries

```bash
# Connect to database
docker-compose exec postgres psql -U trail_race_user -d trail_race_db

# Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🔄 Updates & Maintenance

### Application Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose up --build -d

# Or update specific service
docker-compose up --build -d web-app
```

### Database Migrations

```bash
# Run migrations
docker-compose exec command-service npm run migrate

# Rollback migrations
docker-compose exec command-service npm run migrate:rollback
```

### Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec postgres pg_dump -U trail_race_user trail_race_db > "backup_${DATE}.sql"
```

## 📊 Performance Optimization

### Production Optimizations

```bash
# Enable Docker BuildKit
export DOCKER_BUILDKIT=1

# Use multi-stage builds
# Already implemented in Dockerfiles

# Enable compression
# Add to nginx.conf or reverse proxy
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

### Monitoring Setup

```bash
# Install monitoring tools
docker run -d --name prometheus -p 9090:9090 prom/prometheus
docker run -d --name grafana -p 3001:3000 grafana/grafana

# Configure monitoring
# Add monitoring to docker-compose.yml
```

## 🔐 Security Considerations

### Production Security

```bash
# Change default passwords
# Update JWT_SECRET
# Enable HTTPS
# Configure firewall
# Regular security updates
```

### Environment Security

```bash
# Use secrets management
# Encrypt sensitive data
# Regular security audits
# Access control
```

## 📝 Environment-Specific Configurations

### Development

```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_HOT_RELOAD=true
```

### Staging

```bash
# .env.staging
NODE_ENV=staging
LOG_LEVEL=info
ENABLE_DEBUG=false
```

### Production

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=error
ENABLE_DEBUG=false
SECURE_COOKIES=true
```

## 🎯 Quick Reference Commands

### Essential Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up --build -d

# Check status
docker-compose ps

# Execute command in container
docker-compose exec <service> <command>
```

### Service-Specific Commands

```bash
# Web App
docker-compose exec web-app npm run build
docker-compose exec web-app npm test

# Command Service
docker-compose exec command-service npm test
docker-compose exec command-service npm run migrate

# Query Service
docker-compose exec query-service npm test

# Database
docker-compose exec postgres psql -U trail_race_user -d trail_race_db

# RabbitMQ
docker-compose exec rabbitmq rabbitmqctl status
```

---

## 🎉 Success Indicators

### ✅ Development Environment Ready

- All services running (`docker-compose ps` shows "Up")
- Web app accessible at http://localhost:3000
- API endpoints responding
- Database connected
- RabbitMQ management UI accessible

### ✅ Production Environment Ready

- All services healthy
- SSL certificates configured
- Monitoring setup
- Backup strategy implemented
- Security measures in place

**Happy coding! 🚀✨**
