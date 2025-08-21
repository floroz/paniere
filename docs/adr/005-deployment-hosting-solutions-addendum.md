# ADR 5 Addendum: Backend Hosting Cost Analysis

## Why Not Continue with Netlify?

You raise an excellent point - the frontend is already on Netlify. Here's why the original ADR suggested Vercel:

### Current Situation

- Frontend is deployed on Netlify
- No compelling reason to migrate
- **Recommendation: Keep frontend on Netlify**

### Netlify vs Vercel for Frontend

Both are essentially equivalent for static React apps:

- Same performance (global CDN)
- Similar pricing (generous free tiers)
- Comparable DX

**Decision: Stay with Netlify for frontend**

## Backend Hosting Cost Analysis

### Option 1: Railway (Recommended for MVP)

**Pricing Structure:**

- $5/month base (includes $5 usage)
- Pay-as-you-go after that

**Monthly Cost Estimate (MVP):**

```
Base Plan:           $5.00
Backend (1GB RAM):   ~$5-10
Redis (256MB):       ~$5
PostgreSQL (1GB):    ~$5
----------------------------
Total:              $20-25/month
```

**Pros:**

- Predictable pricing
- Integrated Redis/PostgreSQL
- Excellent WebSocket support
- One-click deployments

**Cons:**

- Can get expensive at scale
- Limited to their regions

### Option 2: Fly.io

**Pricing Structure:**

- Pay for resources used
- No minimum charges

**Monthly Cost Estimate (MVP):**

```
VM (shared-cpu-1x): $3.19
Redis (256MB):      $10
PostgreSQL (1GB):   $15
Bandwidth (10GB):   Free
----------------------------
Total:             ~$28/month
```

**Scaling Costs:**

```
10 VMs globally:    $31.90
Redis cluster:      $30
PostgreSQL replica: $30
----------------------------
Total:             ~$92/month
```

**Pros:**

- Global edge deployment
- Excellent for WebSockets
- Scales efficiently
- No vendor lock-in

**Cons:**

- More complex setup
- Requires Docker knowledge

### Option 3: Render

**Pricing Structure:**

- Free tier available
- Paid plans start at $7/month

**Monthly Cost Estimate (MVP):**

```
Starter Instance:   $7
Redis:             $10
PostgreSQL:        $7
----------------------------
Total:            $24/month
```

**Pros:**

- Simple pricing
- Good free tier
- Auto-scaling available

**Cons:**

- Slower cold starts
- Limited regions

### Option 4: DigitalOcean App Platform

**Pricing Structure:**

- Basic plan: $5/month
- Professional: $12/month

**Monthly Cost Estimate (MVP):**

```
Basic App:         $5
Managed Redis:     $15
Managed PostgreSQL: $15
----------------------------
Total:            $35/month
```

**Pros:**

- Simple, predictable pricing
- Good documentation
- Reliable infrastructure

**Cons:**

- More expensive for managed services
- Limited auto-scaling

### Option 5: AWS (Fargate + ElastiCache)

**Monthly Cost Estimate (MVP):**

```
Fargate (0.25 vCPU): ~$10
ALB:                 $22
ElastiCache:         $15
RDS PostgreSQL:      $15
----------------------------
Total:              ~$62/month
```

**Pros:**

- Ultimate scalability
- Enterprise-grade
- Every service imaginable

**Cons:**

- Complex setup
- Expensive for small apps
- Steep learning curve

### Option 6: Google Cloud Run

**Monthly Cost Estimate (MVP):**

```
Cloud Run:          ~$5-10
Memorystore Redis:  $35
Cloud SQL:          $10
----------------------------
Total:             ~$50-55/month
```

**Pros:**

- Serverless scaling
- Pay per request
- Good for variable traffic

**Cons:**

- WebSocket limitations
- Expensive Redis
- Complex networking

## Recommendations by Stage

### MVP Stage (0-1000 users)

**Recommended: Railway**

- Cost: $20-25/month
- Reasoning: Simplest setup, integrated services, great DX

### Growth Stage (1000-10,000 users)

**Recommended: Fly.io**

- Cost: $50-100/month
- Reasoning: Global deployment, WebSocket optimized, better scaling

### Scale Stage (10,000+ users)

**Recommended: AWS or Google Cloud**

- Cost: $200+/month
- Reasoning: Need for advanced features, custom scaling, enterprise support

## Hidden Costs to Consider

1. **Bandwidth**: Most providers include some free bandwidth
   - Railway: 100GB free
   - Fly.io: 100GB free
   - Render: 100GB free
   - AWS: Charged from byte 1

2. **SSL Certificates**: All providers include free SSL

3. **Monitoring/Logging**:
   - Basic: Included in all
   - Advanced: $10-50/month extra

4. **Backups**:
   - Railway: Included
   - Others: Usually extra

5. **Support**:
   - Community: Free
   - Priority: $100-500/month

## Auth-as-a-Service Cost Impact

Since we're using Clerk for authentication:

**Clerk Pricing:**

- Free: 5,000 monthly active users
- Pro: $25/month + $0.02/MAU after 10k

This is much cheaper than building and maintaining our own auth system.

## Final Recommendation

### For Paniere MVP:

1. **Frontend**: Keep on Netlify (already there)
2. **Backend**: Start with Railway ($25/month)
3. **Auth**: Clerk free tier
4. **Payments**: Stripe (2.9% + $0.30 per transaction)

**Total Infrastructure Cost**: ~$25/month + transaction fees

This gives you:

- Reliable hosting for 1000+ concurrent users
- Integrated Redis and PostgreSQL
- Simple deployment process
- Room to grow

When you hit consistent revenue or need global distribution, migrate to Fly.io.
