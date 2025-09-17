# Trail Race System - Event-Driven CQRS Microservice Architecture

## 🏃‍♂️ Project Overview

This project implements a trail race management system using event-driven CQRS (Command Query Responsibility Segregation) microservice architecture. The system allows participants to apply for races and administrators to manage races and applications.

## 🏗️ Architecture

The system consists of:

- **Command Service** - Handles write operations (CREATE, UPDATE, DELETE)
- **Query Service** - Handles read operations (GET one, GET all)
- **Client Application** - React frontend for users
- **PostgreSQL** - Database for data persistence
- **RabbitMQ** - Message broker for event-driven communication

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js (for local development)
- Make (for using Makefile commands)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd trail-race-system
   ```

2. **Start infrastructure**

   ```bash
   make dev-infra
   ```

3. **Start all services**

   ```bash
   make dev-services
   ```

4. **Access the application**
   - Client App: http://localhost:3000
   - Command Service API: http://localhost:3001
   - Query Service API: http://localhost:3002
   - RabbitMQ Management: http://localhost:15672

## 📋 Available Commands

Use the Makefile for common operations:

```bash
make dev-infra     # Start infrastructure (PostgreSQL + RabbitMQ)
make dev-services  # Start all services
make dev-client    # Start only client app
make dev           # Start development environment
make build         # Build all services
make test          # Run all tests
make clean         # Clean up Docker resources
make logs          # Show logs for all services
make status        # Show status of all services
make help          # Show all available commands
```

## 🔧 Development

### Service Structure

```
trail-race-system/
├── command-service/    # Microservice for write operations
├── query-service/      # Microservice for read operations
├── web-app/           # Next.js frontend application
├── docker-compose.yml  # Infrastructure definition
└── Makefile           # Automation commands
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- Database connection settings
- RabbitMQ configuration
- JWT secret key
- Service ports

## 🧪 Testing

Run tests for all services:

```bash
make test
```

Or run tests for specific services:

```bash
docker-compose exec command-service npm test
docker-compose exec query-service npm test
docker-compose exec web-app npm test
```

## 📊 Monitoring

- **RabbitMQ Management UI**: http://localhost:15672
- **Service Logs**: `make logs` or `make logs-<service-name>`
- **Service Status**: `make status`

## 🔐 Authentication

The system uses JWT tokens for authentication and authorization:

- **Applicant Role**: Can view races, create/delete applications
- **Administrator Role**: Can manage races and applications

## 📚 API Documentation

### Command Service (Port 3001)

- `POST /api/races` - Create race
- `PUT /api/races/:id` - Update race
- `DELETE /api/races/:id` - Delete race
- `POST /api/applications` - Create application
- `DELETE /api/applications/:id` - Delete application

### Query Service (Port 3002)

- `GET /api/races` - Get all races
- `GET /api/races/:id` - Get race by ID
- `GET /api/applications` - Get all applications
- `GET /api/applications/:id` - Get application by ID

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000, 3001, 3002, 5432, 5672, 15672 are available
2. **Docker issues**: Run `make clean` to reset Docker state
3. **Service not starting**: Check logs with `make logs-<service-name>`

### Reset Everything

```bash
make clean
make dev-infra
make dev-services
```

## 🧠 Development Notes & Key Decisions

### 🎯 **Project Evolution**

This project started as a simple race management system and evolved into a comprehensive microservices architecture. Here are the key decisions and learnings:

#### **Architecture Decisions**

- **Microservices over Monolith**: Chosen for scalability and maintainability
- **CQRS Pattern**: Separates read and write operations for better performance
- **Event-Driven Communication**: RabbitMQ enables loose coupling between services
- **JWT Authentication**: Stateless authentication for better scalability
- **Docker Containerization**: Ensures consistent deployment across environments

#### **Technology Choices**

- **Next.js 14**: Modern React framework with App Router for better performance
- **TypeScript**: Type safety throughout the entire application
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **PostgreSQL**: ACID-compliant relational database for data consistency
- **RabbitMQ**: Reliable message broker for event-driven architecture

#### **Design Decisions**

- **Dark Theme**: Professional appearance with neutral color palette
- **Role-Based Access**: Clear separation between Applicants and Administrators
- **Responsive Design**: Mobile-first approach for better user experience
- **Health Monitoring**: Built-in health checks for all services

### 🔧 **Critical Implementation Details**

#### **Authentication Flow**

1. User logs in via Command Service
2. JWT token is generated and stored in cookies
3. Token is automatically attached to all API requests
4. Token expiration triggers automatic logout

#### **Data Flow**

1. **Write Operations**: Frontend → Command Service → Database → RabbitMQ Event
2. **Read Operations**: Frontend → Query Service → Database
3. **Event Processing**: Query Service listens to RabbitMQ events for data consistency

#### **Error Handling Strategy**

- **Frontend**: Try-catch blocks with user-friendly error messages
- **Backend**: Comprehensive error middleware with structured logging
- **Database**: Transaction rollback on failures
- **Network**: Automatic retry logic for failed requests

### 🚨 **Common Issues & Solutions**

#### **Service Startup Issues**

```bash
# Problem: Services fail to start
# Solution: Check startup order - PostgreSQL → RabbitMQ → Services
docker-compose down
docker-compose up -d postgres rabbitmq
sleep 10
docker-compose up -d command-service query-service web-app
```

#### **RabbitMQ Connection Failures**

```bash
# Problem: Command Service can't connect to RabbitMQ
# Solution: Ensure RabbitMQ is fully started before services
docker-compose logs rabbitmq
# Wait for "Server startup complete" message
```

#### **Health Check Failures**

```bash
# Problem: Web-app shows "unhealthy" status
# Solution: Install curl in Dockerfile for health checks
RUN apk add --no-cache curl
```

#### **Port Conflicts**

```bash
# Problem: Port already in use
# Solution: Find and kill process using the port
lsof -i :3000
kill -9 <PID>
```

#### **Database Connection Issues**

```bash
# Problem: Services can't connect to PostgreSQL
# Solution: Check database is running and accessible
docker-compose exec postgres pg_isready
```

### 🎨 **UI/UX Design Rationale**

#### **Color Scheme**

- **Primary**: Neutral grays and blacks for professional appearance
- **Accent**: Dark blue for interactive elements
- **Success**: Green for positive actions
- **Error**: Red for error states
- **Background**: Light gray for better contrast

#### **Component Structure**

- **Atomic Design**: Components built from smallest to largest
- **Reusable Components**: Shared components across pages
- **Consistent Styling**: Tailwind utility classes for uniformity
- **Loading States**: User feedback during operations

#### **Navigation Design**

- **Role-Based Menus**: Different navigation for different user types
- **Active States**: Clear indication of current page
- **Responsive**: Collapsible navigation on mobile devices

### 🔐 **Security Implementation**

#### **Authentication Security**

- **JWT Tokens**: Stateless authentication with expiration
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access**: Granular permissions system
- **Token Validation**: Server-side token verification

#### **API Security**

- **Input Validation**: Joi schemas for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin requests
- **Rate Limiting**: Protection against abuse (planned)

#### **Infrastructure Security**

- **Docker Networks**: Isolated service communication
- **Environment Variables**: Sensitive data not in code
- **Health Checks**: Monitoring for service availability

### 📊 **Performance Optimizations**

#### **Frontend Optimizations**

- **Code Splitting**: Dynamic imports for better loading
- **Image Optimization**: Next.js Image component
- **Caching**: Browser caching for static assets
- **Bundle Size**: Optimized production builds

#### **Backend Optimizations**

- **Database Indexing**: Optimized queries for better performance
- **Connection Pooling**: Efficient database connections
- **Event-Driven**: Asynchronous processing for better scalability
- **Caching**: Redis integration planned for future

#### **Infrastructure Optimizations**

- **Docker Multi-stage Builds**: Smaller production images
- **Alpine Linux**: Minimal base images for size
- **Health Checks**: Automatic service recovery
- **Resource Limits**: Container resource management

### 🧪 **Testing Strategy**

#### **Current Testing**

- **Manual Testing**: Comprehensive user flow testing
- **API Testing**: Endpoint validation with curl/Postman
- **Integration Testing**: Service-to-service communication
- **Database Testing**: Direct query validation

#### **Planned Testing**

- **Unit Tests**: Component and function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user journey testing
- **Performance Tests**: Load and stress testing

### 🚀 **Deployment Considerations**

#### **Development Environment**

- **Docker Compose**: Easy local development setup
- **Hot Reload**: Automatic code changes reflection
- **Debug Mode**: Detailed logging for troubleshooting
- **Local Database**: Isolated development data

#### **Production Environment**

- **Environment Variables**: Secure configuration management
- **SSL Certificates**: HTTPS for secure communication
- **Monitoring**: Health checks and logging
- **Backup Strategy**: Regular database backups
- **Scaling**: Horizontal scaling capabilities

### 📈 **Future Enhancements**

#### **Immediate Improvements (Priority 1)**

- Constants and configuration management
- Custom hooks for API calls
- Error boundaries and centralized error handling
- Loading state standardization

#### **Performance Improvements (Priority 2)**

- Redis caching implementation
- Code splitting and lazy loading
- Database query optimization
- Pagination implementation

#### **Advanced Features (Priority 3)**

- Real-time notifications
- Advanced data tables with sorting/filtering
- File upload system
- Enhanced UI components

#### **Security Enhancements (Priority 4)**

- Rate limiting implementation
- Input sanitization
- Structured logging
- Performance monitoring

### 💡 **Key Learnings**

#### **What Worked Well**

- **Microservices Architecture**: Clean separation of concerns
- **Event-Driven Communication**: Loose coupling between services
- **TypeScript**: Caught many errors at compile time
- **Docker**: Consistent development and deployment
- **Tailwind CSS**: Rapid UI development

#### **What Could Be Improved**

- **Error Handling**: More comprehensive error boundaries
- **Testing**: Automated test coverage
- **Caching**: Redis integration for better performance
- **Monitoring**: More detailed performance metrics
- **Documentation**: More inline code documentation

#### **Best Practices Applied**

- **Clean Code**: Consistent naming and structure
- **Security First**: JWT authentication and input validation
- **User Experience**: Responsive design and loading states
- **Maintainability**: Clear component structure and separation
- **Scalability**: Microservices architecture for growth

### 🔄 **Maintenance Guidelines**

#### **Regular Tasks**

- **Database Backups**: Daily automated backups
- **Security Updates**: Regular dependency updates
- **Performance Monitoring**: Regular performance checks
- **Log Review**: Weekly log analysis for issues

#### **Troubleshooting Workflow**

1. Check service status with `docker-compose ps`
2. Review logs with `docker-compose logs <service>`
3. Verify database connectivity
4. Check RabbitMQ status
5. Restart services if needed

#### **Update Process**

1. Pull latest changes from repository
2. Rebuild Docker images
3. Test in development environment
4. Deploy to production
5. Monitor for issues

---

## 📝 License

This project is for educational purposes.
