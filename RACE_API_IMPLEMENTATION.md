# Race API Endpoints - Implementation Summary

## 📋 Overview

This document summarizes the implementation of Race API endpoints in the Command Service.

## 🚀 What Was Implemented

### **Race API Endpoints**

- `POST /api/races` - Create race
- `PUT /api/races/:id` - Update race
- `DELETE /api/races/:id` - Delete race

## 🔧 Implementation Details

### **1. POST /api/races - Create Race**

#### **Features:**

- ✅ **Authorization**: Only Administrator role can create races
- ✅ **Validation**: Joi schema validation for name and distance
- ✅ **Duplicate Check**: Prevents creating races with same name
- ✅ **Database**: Stores race in PostgreSQL
- ✅ **Event Publishing**: Publishes RACE_CREATED event to RabbitMQ
- ✅ **Logging**: Logs all operations with user context

#### **Request Body:**

```json
{
  "name": "Summer Trail Run",
  "distance": "10k"
}
```

#### **Response:**

```json
{
  "message": "Race created successfully",
  "race": {
    "id": "uuid",
    "name": "Summer Trail Run",
    "distance": "10k",
    "createdAt": "2025-09-14T11:21:15.094Z",
    "updatedAt": "2025-09-14T11:21:15.094Z"
  }
}
```

#### **Validation Rules:**

- `name`: Required, max 255 characters
- `distance`: Required, must be one of: "5k", "10k", "HalfMarathon", "Marathon"

### **2. PUT /api/races/:id - Update Race**

#### **Features:**

- ✅ **Authorization**: Only Administrator role can update races
- ✅ **Validation**: Joi schema validation (at least one field required)
- ✅ **Existence Check**: Verifies race exists before updating
- ✅ **Name Conflict Check**: Prevents name conflicts with other races
- ✅ **Database**: Updates race in PostgreSQL
- ✅ **Event Publishing**: Publishes RACE_UPDATED event to RabbitMQ
- ✅ **Logging**: Logs all operations with user context

#### **Request Body:**

```json
{
  "name": "Summer Trail Marathon",
  "distance": "Marathon"
}
```

#### **Response:**

```json
{
  "message": "Race updated successfully",
  "race": {
    "id": "uuid",
    "name": "Summer Trail Marathon",
    "distance": "Marathon",
    "createdAt": "2025-09-14T11:21:15.094Z",
    "updatedAt": "2025-09-14T11:21:20.067Z"
  }
}
```

### **3. DELETE /api/races/:id - Delete Race**

#### **Features:**

- ✅ **Authorization**: Only Administrator role can delete races
- ✅ **Existence Check**: Verifies race exists before deleting
- ✅ **Applications Check**: Prevents deleting races with applications
- ✅ **Database**: Deletes race from PostgreSQL
- ✅ **Event Publishing**: Publishes RACE_DELETED event to RabbitMQ
- ✅ **Logging**: Logs all operations with user context

#### **Response:**

```json
{
  "message": "Race deleted successfully",
  "race": {
    "id": "uuid",
    "name": "Summer Trail Marathon",
    "distance": "Marathon"
  }
}
```

## 🧪 Testing Results

### **✅ Successful Tests:**

1. **Create Race as Administrator**

   ```bash
   curl -X POST http://localhost:3001/api/races \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -d '{"name":"Summer Trail Run","distance":"10k"}'
   ```

   **Result**: ✅ Race created successfully

2. **Update Race as Administrator**

   ```bash
   curl -X PUT http://localhost:3001/api/races/RACE_ID \
     -H "Authorization: Bearer ADMIN_TOKEN" \
     -d '{"name":"Summer Trail Marathon","distance":"Marathon"}'
   ```

   **Result**: ✅ Race updated successfully

3. **Delete Race as Administrator**

   ```bash
   curl -X DELETE http://localhost:3001/api/races/RACE_ID \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

   **Result**: ✅ Race deleted successfully

4. **Role-Based Access Control**
   ```bash
   curl -X POST http://localhost:3001/api/races \
     -H "Authorization: Bearer APPLICANT_TOKEN" \
     -d '{"name":"Test Race","distance":"5k"}'
   ```
   **Result**: ✅ Access denied (expected)

### **✅ Error Handling Tests:**

- ✅ Validation errors (invalid distance)
- ✅ Authorization errors (Applicant trying to create)
- ✅ Not found errors (updating non-existent race)
- ✅ Conflict errors (duplicate race names)

## 🔄 Event-Driven Architecture

### **Events Published to RabbitMQ:**

#### **1. RACE_CREATED Event**

```json
{
  "type": "RACE_CREATED",
  "payload": {
    "id": "uuid",
    "name": "Summer Trail Run",
    "distance": "10k",
    "createdAt": "2025-09-14T11:21:15.094Z",
    "updatedAt": "2025-09-14T11:21:15.094Z"
  },
  "timestamp": "2025-09-14T11:21:15.094Z",
  "correlationId": "uuid"
}
```

#### **2. RACE_UPDATED Event**

```json
{
  "type": "RACE_UPDATED",
  "payload": {
    "id": "uuid",
    "name": "Summer Trail Marathon",
    "distance": "Marathon",
    "createdAt": "2025-09-14T11:21:15.094Z",
    "updatedAt": "2025-09-14T11:21:20.067Z"
  },
  "timestamp": "2025-09-14T11:21:20.067Z",
  "correlationId": "uuid"
}
```

#### **3. RACE_DELETED Event**

```json
{
  "type": "RACE_DELETED",
  "payload": {
    "id": "uuid",
    "name": "Summer Trail Marathon",
    "distance": "Marathon"
  },
  "timestamp": "2025-09-14T11:21:26.000Z",
  "correlationId": "uuid"
}
```

## 📊 Database Operations

### **SQL Queries Used:**

#### **Create Race:**

```sql
INSERT INTO races (id, name, distance, created_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *
```

#### **Update Race:**

```sql
UPDATE races SET name = $1, distance = $2, updated_at = NOW()
WHERE id = $3 RETURNING *
```

#### **Delete Race:**

```sql
DELETE FROM races WHERE id = $1
```

#### **Check Applications:**

```sql
SELECT COUNT(*) FROM applications WHERE race_id = $1
```

## 🔐 Security Features

### **Authorization:**

- ✅ Role-based access control (Administrator only)
- ✅ JWT token validation
- ✅ User context in all operations

### **Validation:**

- ✅ Input validation with Joi schemas
- ✅ Business rule validation (duplicate names, applications check)
- ✅ SQL injection prevention with parameterized queries

### **Error Handling:**

- ✅ Graceful error handling
- ✅ Proper HTTP status codes
- ✅ Detailed error messages
- ✅ Event publishing failure handling

## 📝 Logging

### **Log Examples:**

```
15:21:15 [info]: Race created successfully {"raceId":"b76e18dc-1010-4984-a55a-fd33dc6f6c05","name":"Summer Trail Run","distance":"10k","userId":"6cf88057-b731-493d-b57f-810f02fde432"}

15:21:20 [info]: Race updated successfully {"raceId":"b76e18dc-1010-4984-a55a-fd33dc6f6c05","name":"Summer Trail Marathon","distance":"Marathon","userId":"6cf88057-b731-493d-b57f-810f02fde432"}

15:21:26 [info]: Race deleted successfully {"raceId":"b76e18dc-1010-4984-a55a-fd33dc6f6c05","name":"Summer Trail Marathon","distance":"Marathon","userId":"6cf88057-b731-493d-b57f-810f02fde432"}
```

## 🎯 Next Steps

### **What's Next:**

1. ✅ Race API endpoints - **COMPLETED**
2. ❌ Application API endpoints - **NEXT**
3. ❌ Query Service implementation
4. ❌ Client App (Next.js)

### **Application API Endpoints to Implement:**

- `POST /api/applications` - Create application
- `DELETE /api/applications/:id` - Delete application

---

**Note**: This implementation follows CQRS pattern where Command Service handles write operations and publishes events for Query Service to consume.
