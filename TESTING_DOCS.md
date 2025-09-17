# Database Schema i Testiranje - Dokumentacija

## 📊 Database Schema

### **Kreirane tablice:**

#### **1. Users Table**

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Applicant', 'Administrator')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **2. Races Table**

```sql
CREATE TABLE races (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    distance VARCHAR(50) NOT NULL CHECK (distance IN ('5k', '10k', 'HalfMarathon', 'Marathon')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **3. Applications Table**

```sql
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    club VARCHAR(255),
    race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(race_id, user_id) -- Prevent duplicate applications
);
```

## 🧪 Kako testirati

### **1. Database Setup**

#### **A) Automatski setup**

```bash
# Pokreni infrastrukturu
make dev-infra

# Pokreni Command Service
cd command-service
npm install
npm run setup-db
```

#### **B) Ručno testiranje baze**

```bash
# Poveži se na PostgreSQL
docker exec -it trail-race-postgres psql -U trail_race_user -d trail_race_db

# Provjeri tablice
\dt

# Provjeri podatke
SELECT * FROM users;
SELECT * FROM races;
SELECT * FROM applications;
```

### **2. API Testing**

#### **A) Automatski test**

```bash
# Pokreni Command Service
cd command-service
npm run dev

# U novom terminalu, pokreni testove
npm run test-api
```

#### **B) Ručno testiranje s Postman**

**1. Health Check**

```
GET http://localhost:3001/health
```

**2. User Registration**

```
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User",
  "role": "Applicant"
}
```

**3. User Login**

```
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**4. Get Current User**

```
GET http://localhost:3001/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

#### **C) Ručno testiranje s curl**

**1. Health Check**

```bash
curl http://localhost:3001/health
```

**2. User Login**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**3. Get Current User**

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### **3. Browser Testing**

**1. Health Check**

- Otvori http://localhost:3001/health
- Trebao bi vidjeti JSON response

**2. API Documentation**

- Otvori http://localhost:3001/api/auth/me
- Trebao bi vidjeti error (jer nema token)

## 🔍 Što testirati

### **Database Tests**

- ✅ Tablice su kreirane
- ✅ Sample podaci su umetnuti
- ✅ Indexi rade
- ✅ Foreign key constraints rade

### **API Tests**

- ✅ Health check radi
- ✅ User registration radi
- ✅ User login radi
- ✅ JWT token se generira
- ✅ Authentication middleware radi
- ✅ Error handling radi

### **Security Tests**

- ✅ Password se hashira
- ✅ JWT token se validira
- ✅ Role-based access radi
- ✅ Input validation radi

## 🚨 Česti problemi i rješenja

### **Problem 1: Database connection failed**

```bash
# Rješenje: Provjeri da li je PostgreSQL pokrenut
make dev-infra
docker ps
```

### **Problem 2: Port already in use**

```bash
# Rješenje: Zaustavi postojeće servise
make clean
make dev-infra
```

### **Problem 3: JWT token invalid**

```bash
# Rješenje: Provjeri da li je JWT_SECRET postavljen
echo $JWT_SECRET
```

### **Problem 4: CORS error**

```bash
# Rješenje: Provjeri CORS_ORIGIN u konfiguraciji
```

## 📝 Test Results

### **Očekivani rezultati:**

**1. Database Setup**

```
✅ Database schema created successfully
✅ Created tables: users, races, applications
✅ Sample data inserted: users=2, races=4, applications=2
```

**2. API Tests**

```
✅ Health check passed
✅ User registration passed
✅ User login passed, token received
✅ Get current user passed
✅ Create race failed (insufficient role - expected)
✅ Create application passed
```

## 🎯 Sljedeći koraci

### **Nakon uspješnog testiranja:**

1. ✅ Database schema je gotova
2. ✅ Command Service radi
3. ✅ Authentication radi
4. ❌ **Sljedeći korak: Implementirati Race i Application API endpointove**

### **Što trebamo implementirati:**

- `POST /api/races` - Create race
- `PUT /api/races/:id` - Update race
- `DELETE /api/races/:id` - Delete race
- `POST /api/applications` - Create application
- `DELETE /api/applications/:id` - Delete application

---

**Napomena**: Ova dokumentacija će se ažurirati kako napredujemo s implementacijom.
