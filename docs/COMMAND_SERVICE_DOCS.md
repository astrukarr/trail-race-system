# Command Service - Detaljna Dokumentacija

## 📋 Pregled

Command Service je mikroservis koji upravlja svim **write operacijama** (CREATE, UPDATE, DELETE) u trail race sustavu. Ovo je "izvor istine" - sve promjene u sustavu počinju ovdje.

## 🏗️ Arhitektura

```
Client → Command Service → Database + RabbitMQ → Query Service
```

### CQRS Pattern

- **Command Service** = Upravlja promjenama (write operations)
- **Query Service** = Upravlja čitanjem (read operations)
- **RabbitMQ** = Komunikacija između servisa

## 📁 Struktura Projekta

```
command-service/
├── package.json              # Dependencies i scripts
├── Dockerfile                # Container configuration
├── healthcheck.js            # Docker health check
├── .env.example              # Environment variables template
├── logs/                     # Log files directory
└── src/
    ├── index.js              # Main server entry point
    ├── config/
    │   └── index.js          # Configuration management
    ├── utils/
    │   └── logger.js         # Winston logging setup
    ├── database/
    │   └── index.js          # PostgreSQL connection
    ├── messaging/
    │   └── index.js          # RabbitMQ connection
    ├── middleware/
    │   ├── auth.js           # JWT authentication
    │   └── errorHandler.js   # Error handling
    └── routes/
        ├── auth.js           # Authentication endpoints
        ├── race.js           # Race management (placeholder)
        └── application.js    # Application management (placeholder)
```

## 🔧 Implementirane Komponente

### 1. **Package.json** - Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2", // Web framework
    "cors": "^2.8.5", // Cross-origin requests
    "helmet": "^7.1.0", // Security headers
    "dotenv": "^16.3.1", // Environment variables
    "pg": "^8.11.3", // PostgreSQL client
    "amqplib": "^0.10.3", // RabbitMQ client
    "jsonwebtoken": "^9.0.2", // JWT authentication
    "bcryptjs": "^2.4.3", // Password hashing
    "joi": "^17.11.0", // Input validation
    "winston": "^3.11.0", // Logging
    "uuid": "^9.0.1" // UUID generation
  }
}
```

### 2. **Dockerfile** - Containerization

```dockerfile
FROM node:18-alpine              # Lightweight Node.js image
WORKDIR /app                     # Working directory
COPY package*.json ./            # Copy package files
RUN npm install --only=production # Install dependencies
COPY . .                         # Copy source code
RUN adduser -S nodejs -u 1001   # Create non-root user
USER nodejs                     # Switch to non-root user
EXPOSE 3001                     # Expose port
HEALTHCHECK CMD node healthcheck.js # Health check
CMD ["npm", "start"]            # Start command
```

### 3. **Main Server (src/index.js)**

```javascript
const express = require("express");
const app = express();

// Security middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS configuration

// Body parsing
app.use(express.json()); // Parse JSON bodies

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/races", authMiddleware, raceRoutes);
app.use("/api/applications", authMiddleware, applicationRoutes);

// Error handling
app.use(errorHandler);
```

### 4. **Configuration (src/config/index.js)**

```javascript
const config = {
  port: process.env.PORT || 3001,
  database: {
    url: process.env.DATABASE_URL,
    // ... other DB settings
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    topics: {
      commands: "race_application_commands",
      responses: "race_application_responses",
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "24h",
  },
};
```

### 5. **Database Connection (src/database/index.js)**

```javascript
const { Pool } = require("pg");

// Connection pool
const pool = new Pool({
  connectionString: config.database.url,
  max: 20, // Max connections
  idleTimeoutMillis: 30000, // Close idle connections
});

// Query function with logging
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  logger.debug("Executed query", {
    duration: `${duration}ms`,
    rows: result.rowCount,
  });

  return result;
}
```

### 6. **RabbitMQ Messaging (src/messaging/index.js)**

```javascript
const amqp = require("amqplib");

// Connect to RabbitMQ
const connection = await amqp.connect(config.rabbitmq.url);
const channel = await connection.createChannel();

// Setup exchanges and queues
await channel.assertExchange("race_application_commands", "topic");
await channel.assertExchange("race_application_responses", "topic");

// Publish command
async function publishCommand(commandType, payload) {
  const message = {
    type: commandType,
    payload: payload,
    timestamp: new Date().toISOString(),
    correlationId: uuidv4(),
  };

  await channel.publish(
    "race_application_commands",
    `command.${commandType}`,
    Buffer.from(JSON.stringify(message))
  );
}
```

### 7. **Authentication Middleware (src/middleware/auth.js)**

```javascript
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.substring(7);
  const decoded = jwt.verify(token, config.jwt.secret);

  // Add user info to request
  req.user = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
  };

  next();
}
```

### 8. **Authentication Routes (src/routes/auth.js)**

```javascript
// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;

  // Find user in database
  const result = await query(
    "SELECT id, email, password, role, first_name, last_name FROM users WHERE email = $1",
    [email]
  );

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.secret,
    { expiresIn: "24h" }
  );

  res.json({ message: "Login successful", token, user });
});

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  const { email, password, firstName, lastName, role } = req.body;

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Create user
  const userId = uuidv4();
  await query(
    "INSERT INTO users (id, email, password, first_name, last_name, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())",
    [userId, email, hashedPassword, firstName, lastName, role]
  );

  res.status(201).json({ message: "User registered successfully" });
});
```

## 🔐 Security Features

### 1. **Helmet.js** - Security Headers

```javascript
app.use(helmet()); // Adds security headers
```

### 2. **CORS** - Cross-Origin Requests

```javascript
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
```

### 3. **JWT Authentication**

- Tokens expire after 24 hours
- Secret key from environment variables
- Role-based access control

### 4. **Password Hashing**

```javascript
const hashedPassword = await bcrypt.hash(password, 12);
```

### 5. **Input Validation**

```javascript
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
```

## 📊 Logging System

### Winston Logger Configuration

```javascript
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});
```

### Log Levels

- **error** - Error messages
- **warn** - Warning messages
- **info** - General information
- **debug** - Debug information

## 🚀 API Endpoints

### Authentication Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user info

### Race Endpoints (IMPLEMENTED)

- `POST /api/races` - Create race (Admin only)
- `PUT /api/races/:id` - Update race (Admin only)
- `DELETE /api/races/:id` - Delete race (Admin only)

**Features:**

- ✅ Role-based authorization (Administrator only)
- ✅ Input validation with Joi schemas
- ✅ Duplicate name prevention
- ✅ Event publishing to RabbitMQ
- ✅ Comprehensive error handling
- ✅ Detailed logging

### Application Endpoints (IMPLEMENTED)

- `POST /api/applications` - Create application (Applicant only)
- `DELETE /api/applications/:id` - Delete application (Applicant only)

**Features:**

- ✅ Role-based authorization (Applicant only)
- ✅ Input validation with Joi schemas
- ✅ Race existence validation
- ✅ Duplicate application prevention
- ✅ Ownership validation (users can only delete their own applications)
- ✅ Event publishing to RabbitMQ
- ✅ Comprehensive error handling
- ✅ Detailed logging

## 🔄 Event-Driven Communication

### Command Flow

1. Client sends request to Command Service
2. Command Service validates request
3. Command Service updates database
4. Command Service publishes event to RabbitMQ
5. Query Service consumes event and updates read model

### Event Structure

```javascript
{
  type: "RACE_CREATED",
  payload: {
    id: "uuid",
    name: "Trail Race",
    distance: "10k"
  },
  timestamp: "2024-01-01T00:00:00.000Z",
  correlationId: "uuid"
}
```

## 🐳 Docker Configuration

### Health Check

```javascript
// healthcheck.js
const http = require("http");
const options = {
  hostname: "localhost",
  port: process.env.PORT || 3001,
  path: "/health",
  method: "GET",
  timeout: 2000,
};
```

### Environment Variables

```bash
PORT=3001
DATABASE_URL=postgresql://user:pass@localhost:5432/db
RABBITMQ_URL=amqp://user:pass@localhost:5672
JWT_SECRET=your-secret-key
```

## 🧪 Testing (Coming Soon)

### Planned Tests

- Unit tests for routes
- Integration tests for database
- Authentication tests
- Error handling tests

## 📝 Next Steps

### Immediate Tasks

1. ✅ Create database schema (Race, Application, User tables)
2. ✅ Implement Race API endpoints
3. ✅ Implement Application API endpoints
4. ✅ Add event publishing to RabbitMQ
5. ✅ Write tests

### Future Enhancements

- Rate limiting
- Request validation middleware
- Database migrations
- API documentation (Swagger)
- Monitoring and metrics

## 🔍 Key Concepts Explained

### CQRS (Command Query Responsibility Segregation)

- **Command Side**: Handles write operations (CREATE, UPDATE, DELETE)
- **Query Side**: Handles read operations (GET)
- **Benefit**: Optimized for different access patterns

### Event-Driven Architecture

- **Events**: Messages describing what happened
- **Publisher**: Command Service sends events
- **Consumer**: Query Service receives events
- **Benefit**: Loose coupling between services

### Microservices

- **Command Service**: Independent service for write operations
- **Query Service**: Independent service for read operations
- **Benefit**: Scalability and independence

---

**Napomena**: Ova dokumentacija će se ažurirati kako napredujemo s implementacijom.
