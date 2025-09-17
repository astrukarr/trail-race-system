# Development commands
.PHONY: dev dev-infra dev-services dev-client build test clean logs

# Pokretanje cijele infrastrukture (baza + messaging)
dev-infra:
	@echo "🚀 Starting infrastructure services..."
	docker-compose up -d postgres rabbitmq
	@echo "✅ Infrastructure ready!"
	@echo "📊 PostgreSQL: http://localhost:5432"
	@echo "🐰 RabbitMQ Management: http://localhost:15672"

# Pokretanje svih servisa
dev-services:
	@echo "🚀 Starting all services..."
	docker-compose up -d
	@echo "✅ All services ready!"
	@echo "🔧 Command Service: http://localhost:3001"
	@echo "📊 Query Service: http://localhost:3002"
	@echo "🌐 Client App: http://localhost:3000"

# Pokretanje samo frontend aplikacije
dev-client:
	@echo "🚀 Starting client application..."
	docker-compose up -d client-app
	@echo "✅ Client app ready at http://localhost:3000"

# Pokretanje development okruženja
dev: dev-infra
	@echo "⏳ Waiting for infrastructure to be ready..."
	sleep 5
	@echo "🚀 Starting development services..."
	docker-compose up command-service query-service client-app

# Build svih servisa
build:
	@echo "🔨 Building all services..."
	docker-compose build
	@echo "✅ Build complete!"

# Pokretanje testova
test:
	@echo "🧪 Running tests..."
	docker-compose exec command-service npm test
	docker-compose exec query-service npm test
	docker-compose exec client-app npm test

# Čišćenje Docker resursa
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f
	@echo "✅ Cleanup complete!"

# Prikaz logova
logs:
	docker-compose logs -f

# Prikaz logova određenog servisa
logs-command:
	docker-compose logs -f command-service

logs-query:
	docker-compose logs -f query-service

logs-client:
	docker-compose logs -f client-app

# Restart određenog servisa
restart-command:
	docker-compose restart command-service

restart-query:
	docker-compose restart query-service

restart-client:
	docker-compose restart client-app

# Status svih servisa
status:
	docker-compose ps

# Help
help:
	@echo "Available commands:"
	@echo "  dev-infra     - Start infrastructure (PostgreSQL + RabbitMQ)"
	@echo "  dev-services  - Start all services"
	@echo "  dev-client    - Start only client app"
	@echo "  dev           - Start development environment"
	@echo "  build         - Build all services"
	@echo "  test          - Run all tests"
	@echo "  clean         - Clean up Docker resources"
	@echo "  logs          - Show logs for all services"
	@echo "  logs-command  - Show logs for command service"
	@echo "  logs-query    - Show logs for query service"
	@echo "  logs-client   - Show logs for client app"
	@echo "  restart-*     - Restart specific service"
	@echo "  status        - Show status of all services"
	@echo "  help          - Show this help"
