# 🚀 DETAILED INSTRUCTIONS - How to Test and Run Trail Race System

## 📋 Overview

These are **step-by-step instructions** for running and testing the Trail Race system.

## 🛠️ Prerequisites (Required Tools)

- ✅ Docker Desktop (running)
- ✅ Node.js (v18+)
- ✅ Terminal/Command Line

## 📁 Project Structure

```
trail-race-system/
├── command-service/          # Backend service (Node.js)
├── query-service/            # Backend service (Node.js) - empty
├── client-app/               # Frontend (Next.js) - empty
├── database/                 # SQL schema
├── docker-compose.yml        # Docker configuration
├── Makefile                  # Automation
└── README.md                 # Documentation
```

---

## 🎯 STEP 1: Starting Infrastructure

### **1.1 Open Terminal**

```bash
# Open Terminal application
# Go to project directory
cd /Users/andelastrukar/Desktop/trail-race-system
```

### **1.2 Start Docker Infrastructure**

```bash
# Start PostgreSQL and RabbitMQ
make dev-infra
```

**Expected Result:**

```
🚀 Starting infrastructure services...
✅ Infrastructure ready!
📊 PostgreSQL: http://localhost:5432
🐰 RabbitMQ Management: http://localhost:15672
```

### **1.3 Check if Running**

```bash
# Check service status
make status
```

**Expected Result:**

```
NAME                  IMAGE                   STATUS
trail-race-postgres   postgres:15             Up
trail-race-rabbitmq   rabbitmq:3-management   Up
```

---

## 🎯 STEP 2: Starting Command Service

### **2.1 Go to command-service directory**

```bash
cd command-service
```

### **2.2 Install Dependencies**

```bash
npm install
```

**Expected Result:**

```
added 512 packages, and audited 513 packages
found 0 vulnerabilities
```

### **2.3 Create .env file**

```bash
# Create .env file with configuration
cat > .env << 'EOF'
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://trail_race_user:trail_race_password@localhost:5432/trail_race_db
RABBITMQ_URL=amqp://trail_race_user:trail_race_password@localhost:5672
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_ISSUER=trail-race-system
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
EOF
```

### **2.4 Run Database Setup**

```bash
npm run setup-db
```

**Expected Result:**

```
✅ Database schema created successfully
✅ Created tables: users, races, applications
✅ Sample data inserted: users=2, races=4, applications=2
✅ Database setup completed successfully!
```

### **2.5 Start Command Service**

```bash
# Option 1: With nodemon (auto restart)
npm run dev

# Option 2: Direct (no restart)
node src/index.js
```

**Expected Result:**

```
✅ Database connected successfully
✅ RabbitMQ connected successfully
✅ Command Service running on port 3001
✅ Health check available at http://localhost:3001/health
```

---

## 🧪 STEP 3: Testing API

### **3.1 Test Health Check**

```bash
# In new terminal
curl http://localhost:3001/health
```

**Expected Result:**

```json
{
  "status": "healthy",
  "service": "command-service",
  "timestamp": "2025-09-14T13:16:50.679Z"
}
```

### **3.2 Test User Registration**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "role": "Applicant"
  }'
```

**Expected Result:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "Applicant",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

### **3.3 Test User Login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Result:**

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "Applicant",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

### **3.4 Test Get Current User**

```bash
# Replace YOUR_TOKEN_HERE with token from previous step
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result:**

```json
{
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "role": "Applicant",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

---

## 🌐 STEP 4: Browser Testing

### **4.1 Health Check**

- Open browser
- Go to: http://localhost:3001/health
- Should see JSON response

### **4.2 RabbitMQ Management**

- Open browser
- Go to: http://localhost:15672
- Login: `trail_race_user` / `trail_race_password`

---

## 🔧 STEP 5: Automated Testing

### **5.1 Run All Tests**

```bash
# In command-service directory
npm run test-api
```

**Expected Result:**

```
✅ Health check passed
✅ User registration passed
✅ User login passed, token received
✅ Get current user passed
✅ Create race failed (insufficient role - expected)
✅ Create application passed
```

---

## 🚨 Common Problems and Solutions

### **Problem 1: Docker not running**

```bash
# Solution: Start Docker Desktop
open -a Docker
# Wait for it to start (5-10 seconds)
```

### **Problem 2: Port 3001 busy**

```bash
# Solution: Stop existing processes
pkill -f "node src/index.js"
# Or change port in .env file
```

### **Problem 3: Database connection failed**

```bash
# Solution: Check if PostgreSQL is running
make status
# If not, start infrastructure
make dev-infra
```

### **Problem 4: Module not found**

```bash
# Solution: Check if you're in correct directory
pwd
# Should be: /Users/andelastrukar/Desktop/trail-race-system/command-service
```

### **Problem 5: Permission denied**

```bash
# Solution: Check permissions
ls -la
# If needed, change owner
sudo chown -R $USER:$USER .
```

---

## 📊 Status Checks

### **Check if everything is running:**

```bash
# 1. Infrastructure
make status

# 2. Command Service
curl http://localhost:3001/health

# 3. Database
docker exec -it trail-race-postgres psql -U trail_race_user -d trail_race_db -c "SELECT COUNT(*) FROM users;"

# 4. RabbitMQ
curl http://localhost:15672
```

---

## 🎯 Next Steps

### **After successful testing:**

1. ✅ Infrastructure running
2. ✅ Command Service running
3. ✅ Database running
4. ✅ Authentication working
5. ❌ **Next step: Implement Race and Application API endpoints**

### **What we need to implement:**

- `POST /api/races` - Create race
- `PUT /api/races/:id` - Update race
- `DELETE /api/races/:id` - Delete race
- `POST /api/applications` - Create application
- `DELETE /api/applications/:id` - Delete application

---

## 📞 Help

### **If something doesn't work:**

1. **Check logs:**

   ```bash
   make logs-command
   ```

2. **Restart everything:**

   ```bash
   make clean
   make dev-infra
   cd command-service
   npm run setup-db
   npm run dev
   ```

3. **Check if all ports are free:**
   ```bash
   lsof -i :3001
   lsof -i :5432
   lsof -i :5672
   ```

---

**Note**: These instructions will be updated as we progress with implementation.
