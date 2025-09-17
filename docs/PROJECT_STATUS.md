# Trail Race System - Status Dokumentacija

## 📋 Analiza Zadatka

### Što trebamo napraviti:

Trail race sustav s event-driven CQRS mikroservisnom arhitekturom koji omogućuje:

- **Applicants** (trkači) mogu se prijaviti na utrke i upravljati svojim prijavama
- **Administrators** mogu upravljati utrkama i prijavama
- Sustav koristi CQRS pattern gdje su odvojeni command (pisanje) i query (čitanje) servisi
- Event-driven komunikacija kroz RabbitMQ

### Arhitektura:

```
User → API Gateway → Command Service (write) → RabbitMQ → Query Service (read) → Database
```

## ✅ Što je već napravljeno:

### 1. Osnovna struktura projekta

- ✅ Kreiran glavni direktorij `trail-race-system`
- ✅ Kreirani direktoriji za servise: `command-service`, `query-service`, `client-app`
- ✅ Napravljen `docker-compose.yml` s infrastrukturom
- ✅ Napravljen `Makefile` s komandama za development
- ✅ Napravljen detaljni `README.md` s dokumentacijom

### 2. Docker infrastruktura

- ✅ PostgreSQL baza podataka (port 5432)
- ✅ RabbitMQ messaging sustav (porti 5672, 15672)
- ✅ Network konfiguracija za komunikaciju između servisa
- ✅ Volume konfiguracija za perzistenciju podataka

### 3. Makefile komande

- ✅ `make dev-infra` - pokretanje infrastrukture
- ✅ `make dev-services` - pokretanje svih servisa
- ✅ `make build` - build svih servisa
- ✅ `make test` - pokretanje testova
- ✅ `make clean` - čišćenje Docker resursa
- ✅ `make logs` - prikaz logova
- ✅ `make status` - status servisa

## ❌ Što trebamo napraviti:

### 1. Command Service (Node.js)

- ✅ Osnovna struktura projekta (package.json, Dockerfile)
- ✅ Express.js server setup
- ✅ Database connection (PostgreSQL)
- ✅ RabbitMQ connection
- ✅ JWT authentication middleware
- ✅ Authentication routes (login, register, me)
- ✅ **Race API endpoints (CREATE, UPDATE, DELETE) - NOVO!**
- ✅ **Application API endpoints (CREATE, DELETE) - NOVO!**
- ✅ **Event publishing na RabbitMQ - NOVO!**
- ✅ Error handling
- ✅ Logging
- ❌ Tests

### 2. Query Service (Node.js)

- ✅ Osnovna struktura projekta (package.json, Dockerfile)
- ✅ Express.js server setup
- ✅ Database connection (PostgreSQL)
- ✅ RabbitMQ consumer
- ✅ JWT authentication middleware
- ✅ **API endpoints za Race (GET one, GET all) - NOVO!**
- ✅ **API endpoints za Application (GET one, GET all) - NOVO!**
- ✅ **Event consumption iz RabbitMQ - NOVO!**
- ✅ **Database synchronization - NOVO!**
- ✅ Error handling
- ✅ Logging
- ✅ Tests

### 3. Client App (React)

- ❌ Osnovna struktura projekta (package.json, Dockerfile)
- ❌ React app setup
- ❌ Authentication system (login/logout)
- ❌ Race listing page
- ❌ Application form
- ❌ User applications management
- ❌ Administrator dashboard
- ❌ API integration
- ❌ Error handling
- ❌ Tests

### 4. Database Schema

- ✅ Race table
- ✅ Application table
- ✅ User table
- ✅ Migrations

### 5. Messaging Topics

- ✅ Command topic (operations)
- ✅ Response topic (outcomes)

## 🎯 Sljedeći koraci (redoslijed):

1. **Command Service Setup** - osnovna struktura i konfiguracija
2. **Database Schema** - kreiranje tablica
3. **Query Service Setup** - osnovna struktura i konfiguracija
4. **RabbitMQ Integration** - messaging setup
5. **Authentication System** - JWT implementacija
6. **API Endpoints** - implementacija svih endpointa
7. **Client App** - React frontend
8. **Testing** - unit i integration testovi
9. **Documentation** - finalna dokumentacija

## 📚 Koncepti koje trebamo objasniti:

### CQRS (Command Query Responsibility Segregation)

- **Command Side**: Upravlja promjenama (CREATE, UPDATE, DELETE)
- **Query Side**: Upravlja čitanjem podataka (GET operations)
- **Benefit**: Optimizacija za čitanje i pisanje odvojeno

### Event-Driven Architecture

- **Events**: Poruke koje opisuju što se dogodilo
- **Publisher**: Command service šalje evente
- **Consumer**: Query service prima evente
- **Benefit**: Loose coupling između servisa

### Microservices

- **Command Service**: Samostalan servis za write operacije
- **Query Service**: Samostalan servis za read operacije
- **Client App**: Frontend aplikacija
- **Benefit**: Skalabilnost i nezavisnost

## 🔧 Tehnologije koje koristimo:

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Messaging**: RabbitMQ
- **Frontend**: React
- **Authentication**: JWT
- **Containerization**: Docker + Docker Compose
- **Package Manager**: pnpm
- **Testing**: Jest
- **Logging**: Winston (planirano)

---

**Napomena**: Ovaj dokument će se ažurirati kako napredujemo s implementacijom.
