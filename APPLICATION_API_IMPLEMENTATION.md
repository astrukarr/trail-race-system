# Application API Endpoints - Implementation Summary

## 📋 Overview

This document summarizes the implementation of Application API endpoints in the Command Service.

## 🚀 What Was Implemented

### **Application API Endpoints**

- `POST /api/applications` - Create application
- `DELETE /api/applications/:id` - Delete application

## 🔧 Implementation Details

### **1. POST /api/applications - Create Application**

#### **Features:**

- ✅ **Authorization**: Only Applicant role can create applications
- ✅ **Validation**: Joi schema validation for all fields
- ✅ **Race Existence Check**: Verifies race exists before creating application
- ✅ **Duplicate Prevention**: Prevents user from applying for same race twice
- ✅ **Database**: Stores application in PostgreSQL
- ✅ **Event Publishing**: Publishes APPLICATION_CREATED event to RabbitMQ
- ✅ **Logging**: Logs all operations with user context

#### **Request Body:**

```json
{
  "firstName": "Test",
  "lastName": "User",
  "club": "Test Club",
  "raceId": "8836353a-0100-4e86-b74a-d7ca19a88866"
}
```

#### **Response:**

```json
{
  "message": "Application created successfully",
  "application": {
    "id": "d952e6e4-800a-4b56-9770-631bf48d53c9",
    "firstName": "Test",
    "lastName": "User",
    "club": "Test Club",
    "raceId": "8836353a-0100-4e86-b74a-d7ca19a88866",
    "createdAt": "2025-09-14T11:25:02.928Z",
    "updatedAt": "2025-09-14T11:25:02.928Z"
  }
}
```

#### **Validation Rules:**

- `firstName`: Required, max 255 characters
- `lastName`: Required, max 255 characters
- `club`: Optional, max 255 characters (can be empty string)
- `raceId`: Required, must be valid UUID

### **2. DELETE /api/applications/:id - Delete Application**

#### **Features:**

- ✅ **Authorization**: Only Applicant role can delete applications
- ✅ **Ownership Check**: Users can only delete their own applications
- ✅ **Existence Check**: Verifies application exists before deleting
- ✅ **Database**: Deletes application from PostgreSQL
- ✅ **Event Publishing**: Publishes APPLICATION_DELETED event to RabbitMQ
- ✅ **Logging**: Logs all operations with user context

#### **Response:**

```json
{
  "message": "Application deleted successfully",
  "application": {
    "id": "d952e6e4-800a-4b56-9770-631bf48d53c9",
    "firstName": "Test",
    "lastName": "User",
    "club": "Test Club",
    "raceId": "8836353a-0100-4e86-b74a-d7ca19a88866"
  }
}
```

## 🧪 Testing Results

### **✅ Successful Tests:**

1. **Create Application as Applicant**

   ```bash
   curl -X POST http://localhost:3001/api/applications \
     -H "Authorization: Bearer APPLICANT_TOKEN" \
     -d '{"firstName":"Test","lastName":"User","club":"Test Club","raceId":"8836353a-0100-4e86-b74a-d7ca19a88866"}'
   ```

   **Result**: ✅ Application created successfully

2. **Delete Application as Applicant**
   ```bash
   curl -X DELETE http://localhost:3001/api/applications/APPLICATION_ID \
     -H "Authorization: Bearer APPLICANT_TOKEN"
   ```
   **Result**: ✅ Application deleted successfully

### **✅ Error Handling Tests:**

1. **Race Not Found**

   ```bash
   curl -X POST http://localhost:3001/api/applications \
     -H "Authorization: Bearer APPLICANT_TOKEN" \
     -d '{"firstName":"Test","lastName":"User","club":"Test Club","raceId":"00000000-0000-0000-0000-000000000000"}'
   ```

   **Result**: ✅ "Race not found" (404)

2. **Validation Error**

   ```bash
   curl -X POST http://localhost:3001/api/applications \
     -H "Authorization: Bearer APPLICANT_TOKEN" \
     -d '{"firstName":"","lastName":"User","club":"Test Club","raceId":"8836353a-0100-4e86-b74a-d7ca19a88866"}'
   ```

   **Result**: ✅ "Validation error" (400)

3. **Duplicate Application Prevention**

   - User tries to apply for same race twice
     **Result**: ✅ "You have already applied for this race" (409)

4. **Application Not Found**
   ```bash
   curl -X DELETE http://localhost:3001/api/applications/00000000-0000-0000-0000-000000000000 \
     -H "Authorization: Bearer APPLICANT_TOKEN"
   ```
   **Result**: ✅ "Application not found or you don't have permission to delete it" (404)

## 🔄 Event-Driven Architecture

### **Events Published to RabbitMQ:**

#### **1. APPLICATION_CREATED Event**

```json
{
  "type": "APPLICATION_CREATED",
  "payload": {
    "id": "d952e6e4-800a-4b56-9770-631bf48d53c9",
    "userId": "90de7bc0-88bd-46de-bfd5-d630b2065f1d",
    "raceId": "8836353a-0100-4e86-b74a-d7ca19a88866",
    "firstName": "Test",
    "lastName": "User",
    "club": "Test Club",
    "createdAt": "2025-09-14T11:25:02.928Z",
    "updatedAt": "2025-09-14T11:25:02.928Z"
  },
  "timestamp": "2025-09-14T11:25:02.928Z",
  "correlationId": "uuid"
}
```

#### **2. APPLICATION_DELETED Event**

```json
{
  "type": "APPLICATION_DELETED",
  "payload": {
    "id": "d952e6e4-800a-4b56-9770-631bf48d53c9",
    "userId": "90de7bc0-88bd-46de-bfd5-d630b2065f1d",
    "raceId": "8836353a-0100-4e86-b74a-d7ca19a88866",
    "firstName": "Test",
    "lastName": "User",
    "club": "Test Club"
  },
  "timestamp": "2025-09-14T11:25:02.928Z",
  "correlationId": "uuid"
}
```

## 📊 Database Operations

### **SQL Queries Used:**

#### **Create Application:**

```sql
INSERT INTO applications (id, user_id, race_id, first_name, last_name, club, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *
```

#### **Delete Application:**

```sql
DELETE FROM applications WHERE id = $1
```

#### **Check Race Exists:**

```sql
SELECT * FROM races WHERE id = $1
```

#### **Check Duplicate Application:**

```sql
SELECT id FROM applications WHERE user_id = $1 AND race_id = $2
```

#### **Check Application Ownership:**

```sql
SELECT * FROM applications WHERE id = $1 AND user_id = $2
```

## 🔐 Security Features

### **Authorization:**

- ✅ Role-based access control (Applicant only)
- ✅ JWT token validation
- ✅ User context in all operations
- ✅ Ownership validation (users can only delete their own applications)

### **Validation:**

- ✅ Input validation with Joi schemas
- ✅ Business rule validation (race existence, duplicate prevention)
- ✅ SQL injection prevention with parameterized queries
- ✅ UUID format validation

### **Error Handling:**

- ✅ Graceful error handling
- ✅ Proper HTTP status codes
- ✅ Detailed error messages
- ✅ Event publishing failure handling

## 📝 Logging

### **Log Examples:**

```
15:25:02 [info]: Application created successfully {"applicationId":"d952e6e4-800a-4b56-9770-631bf48d53c9","userId":"90de7bc0-88bd-46de-bfd5-d630b2065f1d","raceId":"8836353a-0100-4e86-b74a-d7ca19a88866","firstName":"Test","lastName":"User"}

15:25:02 [info]: Application deleted successfully {"applicationId":"d952e6e4-800a-4b56-9770-631bf48d53c9","userId":"90de7bc0-88bd-46de-bfd5-d630b2065f1d","raceId":"8836353a-0100-4e86-b74a-d7ca19a88866","firstName":"Test","lastName":"User"}
```

## 🎯 Business Logic

### **Application Creation Rules:**

1. ✅ Only Applicant role can create applications
2. ✅ Race must exist before creating application
3. ✅ User cannot apply for same race twice
4. ✅ All required fields must be provided
5. ✅ Club field is optional

### **Application Deletion Rules:**

1. ✅ Only Applicant role can delete applications
2. ✅ Users can only delete their own applications
3. ✅ Application must exist before deletion
4. ✅ No restrictions on deletion (unlike races with applications)

## 🎯 Next Steps

### **What's Next:**

1. ✅ Race API endpoints - **COMPLETED**
2. ✅ Application API endpoints - **COMPLETED**
3. ❌ Query Service implementation - **NEXT**
4. ❌ Client App (Next.js)

### **Query Service to Implement:**

- Event consumption from RabbitMQ
- Read-only API endpoints for races and applications
- Data synchronization with Command Service

---

**Note**: This implementation follows CQRS pattern where Command Service handles write operations and publishes events for Query Service to consume.
