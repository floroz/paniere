# ADR 5: Deployment and Hosting Solutions

## Status

Accepted

## Context

The Paniere multiplayer Tombola game requires a deployment strategy that supports:

- **High Availability**: Minimal downtime for live games
- **Real-time Performance**: Low latency for WebSocket connections
- **Scalability**: Handle traffic spikes during popular game times
- **Cost Efficiency**: Optimize costs for MVP and early growth stages
- **Developer Experience**: Simple deployment and monitoring workflows
- **Geographic Distribution**: Serve players from multiple regions
- **Automatic Scaling**: Handle varying concurrent player loads

### Application Architecture Requirements

The deployment must support:

1. **Frontend**: Static React application (SPA)
2. **Backend**: Node.js application with WebSocket support
3. **Database**: PostgreSQL for persistent data (future)
4. **Cache/Session Store**: Redis for session management and game state
5. **File Storage**: Static assets and game resources
6. **Monitoring**: Application and infrastructure monitoring

### Hosting Options Evaluated

#### 1. Vercel + Railway

- **Frontend on Vercel**: Excellent for static React apps, global CDN, automatic deployments
- **Backend on Railway**: Simple deployment, built-in PostgreSQL/Redis, WebSocket support
- **Pros**: Great DX, automatic scaling, integrated databases, simple setup
- **Cons**: Higher costs at scale, vendor lock-in, limited backend customization
- **Assessment**: Excellent for MVP and early growth

#### 2. Netlify + Render

- **Frontend on Netlify**: Similar to Vercel, great for static sites
- **Backend on Render**: Docker support, auto-scaling, managed databases
- **Pros**: Competitive pricing, good performance, Docker flexibility
- **Cons**: Less mature than competitors, smaller ecosystem
- **Assessment**: Good alternative to Vercel/Railway

#### 3. AWS (ECS/Lambda + CloudFront)

- **Frontend on CloudFront + S3**: Global CDN, high performance
- **Backend on ECS/Fargate**: Container orchestration, full control
- **Pros**: Most comprehensive, unlimited scalability, mature services
- **Cons**: Complex setup, steep learning curve, higher operational overhead
- **Assessment**: Best for large scale but overkill for MVP

#### 4. Google Cloud Platform

- **Frontend on Cloud Storage + CDN**: Similar to AWS
- **Backend on Cloud Run**: Serverless containers, pay-per-use
- **Pros**: Good performance, competitive pricing, serverless benefits
- **Cons**: Less ecosystem than AWS, WebSocket limitations in serverless
- **Assessment**: Good for specific use cases but not optimal for real-time games

#### 5. Fly.io

- **Full-stack deployment**: Docker-based, global edge locations, WebSocket optimized
- **Pros**: Excellent for real-time apps, global deployment, cost-effective
- **Cons**: Smaller company, less mature ecosystem, learning curve
- **Assessment**: Excellent choice for real-time applications

#### 6. DigitalOcean App Platform

- **Pros**: Simple deployment, good pricing, managed databases
- **Cons**: Limited geographic reach, fewer advanced features
- **Assessment**: Good for simple deployments but limited scalability

## Decision

We will use a **hybrid approach** optimized for different stages:

### MVP Stage: Vercel + Railway

- **Frontend**: Deploy on Vercel for optimal React app hosting
- **Backend**: Deploy on Railway for simplicity and integrated services
- **Database**: Railway PostgreSQL (when needed)
- **Cache**: Railway Redis for sessions and game state

### Growth Stage: Vercel + Fly.io

- **Frontend**: Continue with Vercel (proven performance)
- **Backend**: Migrate to Fly.io for better real-time performance and global distribution
- **Database**: Fly.io PostgreSQL with read replicas
- **Cache**: Fly.io Redis cluster

## Implementation Strategy

### MVP Deployment (Railway + Vercel)

#### Frontend Deployment (Vercel)

```typescript
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/packages/frontend/$1"
    }
  ],
  "env": {
    "VITE_BACKEND_URL": "@backend-url",
    "VITE_WEBSOCKET_URL": "@websocket-url"
  }
}
```

#### Backend Deployment (Railway)

```dockerfile
# Dockerfile for Railway deployment
FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY packages/backend/package*.json ./packages/backend/

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend

# Build shared package
RUN npm run build --workspace=shared

# Build backend
RUN npm run build --workspace=backend

# Expose port
EXPOSE $PORT

# Start application
CMD ["npm", "start", "--workspace=backend"]
```

```yaml
# railway.json
{
  "build": { "builder": "dockerfile", "dockerfilePath": "Dockerfile" },
  "deploy":
    {
      "numReplicas": 1,
      "sleepApplication": false,
      "restartPolicyType": "on_failure",
    },
}
```

#### Environment Configuration

```bash
# Railway Environment Variables
NODE_ENV=production
PORT=3000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=${{JWT_SECRET}}
CORS_ORIGIN=https://paniere.vercel.app

# Vercel Environment Variables
VITE_BACKEND_URL=https://paniere-backend.railway.app
VITE_WEBSOCKET_URL=wss://paniere-backend.railway.app
```

### Production Deployment (Fly.io + Vercel)

#### Fly.io Configuration

```toml
# fly.toml
app = "paniere-backend"
primary_region = "ams"

[build]
  dockerfile = "Dockerfile"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[[services]]
  http_checks = []
  internal_port = 8080
  processes = ["app"]
  protocol = "tcp"
  script_checks = []

  [services.concurrency]
    hard_limit = 250
    soft_limit = 200
    type = "connections"

  [[services.ports]]
    force_https = true
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.tcp_checks]]
    grace_period = "1s"
    interval = "15s"
    restart_limit = 0
    timeout = "2s"

# Auto-scaling configuration
[scaling]
  min_machines_running = 1
  max_machines_running = 10

# Multi-region deployment
[[regions]]
  primary = true
  name = "ams"  # Amsterdam (Europe)

[[regions]]
  name = "iad"  # Ashburn (US East)

[[regions]]
  name = "nrt"  # Tokyo (Asia)
```

#### Database Configuration

```bash
# Create PostgreSQL cluster
flyctl postgres create --name paniere-db --region ams

# Create Redis instance
flyctl redis create --name paniere-redis --region ams

# Attach to application
flyctl postgres attach paniere-db
flyctl redis attach paniere-redis
```

### CI/CD Pipeline

#### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy Paniere

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Type checking
        run: npm run type-check

      - name: Linting
        run: npm run lint

      - name: Unit tests
        run: npm run test

      - name: Integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: packages/frontend

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      # For Railway (MVP)
      - name: Deploy to Railway
        uses: brycedorn/railway-deploy@v1.1.0
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend

      # For Fly.io (Production)
      # - name: Deploy to Fly.io
      #   uses: superfly/flyctl-actions/setup-flyctl@master
      #   with:
      #     version: latest
      # - run: flyctl deploy --remote-only
      #   env:
      #     FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

### Monitoring and Observability

#### Application Monitoring

```typescript
// backend/src/monitoring/metrics.ts
import { register, Counter, Histogram, Gauge } from "prom-client";

// WebSocket connection metrics
export const wsConnections = new Gauge({
  name: "websocket_connections_total",
  help: "Number of active WebSocket connections",
});

export const gamesSessions = new Gauge({
  name: "active_games_total",
  help: "Number of active game sessions",
});

export const messageLatency = new Histogram({
  name: "websocket_message_duration_ms",
  help: "WebSocket message processing time",
  buckets: [1, 5, 10, 50, 100, 500, 1000, 5000],
});

export const numberDrawEvents = new Counter({
  name: "number_draws_total",
  help: "Total number of draws across all games",
});

// Health check endpoint
app.get("/health", async (request, reply) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    metrics: {
      activeConnections: wsConnections.get(),
      activeGames: gamesSessions.get(),
      uptime: process.uptime(),
    },
  };

  return reply.send(health);
});

// Metrics endpoint
app.get("/metrics", async (request, reply) => {
  reply.header("Content-Type", register.contentType);
  return register.metrics();
});
```

#### Infrastructure Monitoring

```yaml
# monitoring/docker-compose.yml (for development)
version: "3.8"
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

### Scaling Strategy

#### Horizontal Scaling

```typescript
// Redis adapter for multi-instance scaling
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// Sticky sessions configuration (for load balancer)
app.register((fastify, opts, next) => {
  fastify.addHook("onRequest", async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    if (sessionId) {
      reply.header("X-Session-Affinity", sessionId);
    }
  });
  next();
});
```

#### Auto-scaling Configuration

```yaml
# For Kubernetes (future scaling)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: paniere-backend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: paniere-backend
  minReplicas: 1
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Pods
      pods:
        metric:
          name: websocket_connections_per_pod
        target:
          type: AverageValue
          averageValue: "100"
```

### Security Configuration

#### SSL/TLS Setup

```nginx
# nginx.conf (for custom deployments)
upstream backend {
    least_conn;
    server backend1:3000;
    server backend2:3000;
}

server {
    listen 443 ssl http2;
    server_name api.paniere.app;

    ssl_certificate /etc/letsencrypt/live/paniere.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/paniere.app/privkey.pem;

    # WebSocket upgrade handling
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket timeout settings
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
}
```

## Consequences

### Positive

- **Rapid MVP Deployment**: Railway + Vercel enables quick launch
- **Global Performance**: CDN distribution for frontend assets
- **Real-time Optimization**: Fly.io optimized for WebSocket performance
- **Cost Efficiency**: Pay-per-use scaling aligned with usage patterns
- **Developer Experience**: Simple deployment workflows and monitoring
- **Migration Path**: Clear upgrade path from MVP to production infrastructure

### Negative

- **Vendor Dependencies**: Reliance on multiple third-party services
- **Cost Scaling**: Costs increase with scale, especially for WebSocket connections
- **Complexity**: Multiple platforms to manage and monitor
- **Migration Overhead**: Moving between platforms requires configuration changes

### Risk Mitigation

- **Infrastructure as Code**: All configurations version controlled
- **Monitoring**: Comprehensive alerting for service health
- **Backup Plans**: Alternative deployment strategies documented
- **Cost Monitoring**: Alerts for unexpected cost increases

## Performance Targets

### Latency Requirements

- **WebSocket Message Delivery**: < 100ms p95
- **Game State Updates**: < 50ms p95
- **Frontend Load Time**: < 2s p95
- **API Response Time**: < 200ms p95

### Availability Targets

- **Uptime**: 99.9% (MVP), 99.95% (Production)
- **Recovery Time**: < 5 minutes for planned deployments
- **Data Durability**: 99.99% for game state and sessions

### Scaling Targets

- **Concurrent Players**: 1,000 (MVP), 10,000 (Growth)
- **Concurrent Games**: 100 (MVP), 1,000 (Growth)
- **Geographic Regions**: 1 (MVP), 3+ (Growth)

## Future Considerations

### Advanced Scaling

- **Edge Computing**: Deploy game logic closer to players
- **Regional Databases**: Reduce latency with regional read replicas
- **CDN Integration**: Cache game assets and static content globally
- **Microservices**: Split monolith into specialized services

### Infrastructure Evolution

- **Kubernetes**: For advanced orchestration and multi-cloud deployment
- **Service Mesh**: For advanced traffic management and security
- **Event-Driven Architecture**: NATS or Apache Kafka for event streaming
- **Database Sharding**: Horizontal database scaling strategies

## References

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Railway Deployment Documentation](https://docs.railway.app/)
- [Fly.io Real-time Apps Guide](https://fly.io/docs/app-guides/real-time/)
- [Socket.io Deployment Best Practices](https://socket.io/docs/v4/deployment/)
