# Query Service - Implementation Summary

## 📋 Overview

This document summarizes the implementation of Query Service in the Trail Race System.

## 🚀 What Was Implemented

### **Query Service Architecture**

- **Purpose**: Read-only API service that consumes events from Command Service
- **Port**: 3002
- **Pattern**: CQRS (Command Query Responsibility Segregation)
- **Communication**: Event-driven via RabbitMQ

## 🔧 Implementation Details

### **1. Project Structure**

```
query-service/
├── package.json
├── Dockerfile
├── .env
└── src/
    ├── index.js                 # Main Express server
    ├── config/index.js          # Configuration management
    ├── utils/logger.js          # Winston logging
    ├── database/index.js        # PostgreSQL connection
    ├── messaging/
    │   ├── index.js            # RabbitMQ connection & consumption
    │   └── eventHandler.js     # Event processing logic
    ├── middleware/
    │   ├── auth.js             # JWT authentication
    │   └── errorHandler.js     # Error handling
    └── routes/
        ├── race.js             # Race read-only endpoints
        └── application.js      # Application read-only endpoints
```

### **2. API Endpoints**

#### **Race Endpoints (Read-only)**

- `GET /api/races` - Get all races
- `GET /api/races/:id` - Get race by ID

#### **Application Endpoints (Read-only)**

- `GET /api/applications` - Get applications (with user context)
- `GET /api/applications/:id` - Get application by ID

### **3. Event-Driven Communication**

#### **Events Consumed from RabbitMQ:**

- `RACE_CREATED` - Creates race in query database
- `RACE_UPDATED` - Updates race in query database
- `RACE_DELETED` - Deletes race from query database
- `APPLICATION_CREATED` - Creates application in query database
- `APPLICATION_DELETED` - Deletes application from query database

#### **Event Processing Flow:**

1. Command Service publishes event to RabbitMQ
2. Query Service consumes event from queue
3. Event handler processes the event
4. Database is updated accordingly
5. Event is acknowledged

## 🧪 Testing Results

### **✅ Successful Tests:**

#### **1. Health Check**

```bash
curl http://localhost:3002/health
```

**Result**: ✅ Service healthy

#### **2. Authentication Test**

```bash
curl http://localhost:3002/api/races
```

**Result**: ✅ "Access denied. No token provided." (401)

#### **3. Race API Test**

```bash
curl -X GET http://localhost:3002/api/races \
  -H "Authorization: Bearer TOKEN"
```

**Result**: ✅ Returns all races successfully

#### **4. Application API Test**

```bash
curl -X GET http://localhost:3002/api/applications \
  -H "Authorization: Bearer TOKEN"
```

**Result**: ✅ Returns applications (empty list if none exist)

## 🔄 CQRS Pattern Implementation

### **Command Service (Port 3001)**

- **Responsibility**: Write operations
- **Operations**: CREATE, UPDATE, DELETE
- **Events**: Publishes to RabbitMQ

### **Query Service (Port 3002)**

- **Responsibility**: Read operations
- **Operations**: GET (one/all)
- **Events**: Consumes from RabbitMQ

### **Data Flow:**

```
Client Request → Command Service → Database → RabbitMQ Event
                                                      ↓
Query Service ← RabbitMQ Event ← Database Update ← Event Handler
```

## 📊 Database Operations

### **SQL Queries Used:**

#### **Race Queries:**

```sql
-- Get all races
SELECT id, name, distance, created_at, updated_at
FROM races ORDER BY created_at DESC

-- Get race by ID
SELECT id, name, distance, created_at, updated_at
FROM races WHERE id = $1
```

#### **Application Queries:**

```sql
-- Get applications with race and user info
SELECT
  a.id, a.first_name, a.last_name, a.club, a.created_at, a.updated_at,
  r.name as race_name, r.distance as race_distance,
  u.email as user_email
FROM applications a
JOIN races r ON a.race_id = r.id
JOIN users u ON a.user_id = u.id
WHERE a.user_id = $1  -- Only for Applicant role
ORDER BY a.created_at DESC
```

## 🔐 Security Features

### **Authentication:**

- ✅ JWT token validation
- ✅ Role-based access control
- ✅ User context in all operations

### **Authorization:**

- ✅ **Applicant Role**: Can see all races, only own applications
- ✅ **Administrator Role**: Can see all races and all applications

### **Data Privacy:**

- ✅ Users can only access their own applications
- ✅ Administrators have full access
- ✅ Proper error messages for unauthorized access

## 📝 Logging

### **Log Examples:**

```
13:39:33 [info]: Database connected successfully {"service":"query-service"}
13:39:33 [info]: RabbitMQ connected successfully {"service":"query-service"}
13:39:33 [info]: Event consumption started {"service":"query-service"}
13:39:33 [info]: Query Service running on port 3002 {"service":"query-service"}
13:40:40 [info]: GET /api/races {"service":"query-service","ip":"::1","userAgent":"curl/8.7.1"}
```

## 🎯 Business Logic

### **Race Access Rules:**

1. ✅ All authenticated users can view races
2. ✅ No role restrictions for race viewing
3. ✅ Read-only access only

### **Application Access Rules:**

1. ✅ **Applicants**: Can only see their own applications
2. ✅ **Administrators**: Can see all applications
3. ✅ Applications include race and user information
4. ✅ Read-only access only

## 🔧 Configuration

### **Environment Variables:**

```env
PORT=3002
NODE_ENV=development
DATABASE_URL=postgresql://trail_race_user:trail_race_password@localhost:5432/trail_race_db
RABBITMQ_URL=amqp://trail_race_user:trail_race_password@localhost:5672
JWT_SECRET=your-super-secret-jwt-key-change-in-production
CORS_ORIGIN=http://localhost:3000
LOG_LEVEL=info
```

### **Dependencies:**

- **express**: Web framework
- **pg**: PostgreSQL client
- **amqplib**: RabbitMQ client
- **jsonwebtoken**: JWT handling
- **winston**: Logging
- **helmet**: Security headers
- **cors**: Cross-origin requests

## 🚀 Deployment

### **Docker Configuration:**

```yaml
query-service:
  build:
    context: ./query-service
    dockerfile: Dockerfile
  container_name: trail-race-query-service
  ports:
    - "3002:3002"
  environment:
    - NODE_ENV=development
    - PORT=3002
    - DATABASE_URL=postgresql://trail_race_user:trail_race_password@postgres:5432/trail_race_db
    - RABBITMQ_URL=amqp://trail_race_user:trail_race_password@rabbitmq:5672
  depends_on:
    - postgres
    - rabbitmq
```

## 🎯 Next Steps

### **What's Next:**

1. ✅ Command Service - **COMPLETED**
2. ✅ Query Service - **COMPLETED**
3. ❌ Client App (Next.js) - **NEXT**

### **Client App to Implement:**

- Next.js frontend application
- Authentication UI
- Race listing and management
- Application creation and management
- Role-based UI components

---

**Note**: This Query Service implements the read side of CQRS pattern, providing optimized read-only access to data synchronized via events from the Command Service.
