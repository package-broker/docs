---
sidebar_position: 2
title: Scaling
description: Scaling PACKAGE.broker for high-traffic deployments
---

# Scaling

PACKAGE.broker is designed to scale horizontally and vertically. This guide covers scaling strategies for different deployment platforms.

## Scaling Strategies

### Horizontal Scaling

Run multiple instances behind a load balancer:
- **Docker**: Multiple containers
- **Kubernetes**: Multiple pod replicas
- **Cloudflare Workers**: Automatic (edge network)

### Vertical Scaling

Increase resources for single instance:
- More CPU/RAM
- Faster storage
- Larger database

## Database Scaling

### PostgreSQL

**Read Replicas**:
- Configure read replicas for read-heavy workloads
- Route read queries to replicas
- Write queries to primary

**Connection Pooling**:
- Use PgBouncer or similar
- Reduce connection overhead
- Improve performance

**Partitioning** (for very large deployments):
- Partition artifacts table by date
- Archive old data
- Improve query performance

### SQLite

**Limitations**:
- Single-writer constraint
- Not suitable for high concurrency
- Migrate to PostgreSQL for scaling

### Cloudflare D1

**Automatic Scaling**:
- D1 scales automatically
- Free tier: 5GB storage, 5M reads/month
- Paid tier: Higher limits

## Storage Scaling

### S3-Compatible Storage

**Best Practices**:
- Use CDN for package downloads
- Enable caching headers
- Use lifecycle policies for old artifacts

**Performance**:
- Multi-region deployment
- CloudFront/Cloudflare CDN
- Pre-signed URLs for direct access

### Filesystem Storage

**Limitations**:
- Single server constraint
- Network file systems (NFS) add latency
- Migrate to S3 for scaling

## Caching

### Redis

**Configuration**:
- Use Redis cluster for high availability
- Configure eviction policies
- Monitor memory usage

**Cache Strategy**:
- Cache package metadata (TTL: 1 hour)
- Cache package lists (TTL: 5 minutes)
- Cache repository sync results

### Cloudflare KV

**Automatic Scaling**:
- KV scales automatically
- Free tier: 100k reads/day
- Paid tier: Higher limits

## Load Balancing

### Docker Deployment

**Nginx/HAProxy**:
```nginx
upstream package_broker {
    server package-broker-1:8080;
    server package-broker-2:8080;
    server package-broker-3:8080;
}
```

**Health Checks**:
- Monitor `/health` endpoint
- Remove unhealthy instances
- Automatic failover

### Kubernetes

**Service Configuration**:
```yaml
apiVersion: v1
kind: Service
spec:
  type: LoadBalancer
  selector:
    app: package-broker
  ports:
    - port: 80
      targetPort: 8080
```

**Horizontal Pod Autoscaler**:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

## Performance Optimization

### Database Indexes

Ensure indexes exist:
- Package name lookups
- Repository queries
- Token lookups

### Query Optimization

- Use connection pooling
- Batch operations where possible
- Monitor slow queries

### CDN Configuration

**Cloudflare**:
- Enable caching for `/dist/*` paths
- Cache package metadata
- Set appropriate TTLs

## Monitoring

### Key Metrics

Track:
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate
- Cache hit rate
- Database connection pool usage

### Alerts

Set up alerts for:
- High error rate (>1%)
- Slow response times (>1s p95)
- Database connection exhaustion
- Storage capacity (>80%)

## Scaling by Platform

### Docker

**Vertical**:
- Increase container resources
- Use larger database instance

**Horizontal**:
- Run multiple containers
- Use load balancer
- Shared database/storage

### Cloudflare Workers

**Automatic**:
- Workers scale automatically
- Edge network distribution
- No manual scaling needed

**Limits**:
- Free tier: 100k requests/day
- Paid tier: Unlimited requests
- CPU time limits apply

### Kubernetes

**Horizontal Pod Autoscaler**:
- Scale based on CPU/memory
- Scale based on custom metrics
- Configure min/max replicas

**Cluster Autoscaler**:
- Add nodes when needed
- Remove unused nodes
- Cost optimization

## Capacity Planning

### Estimate Requirements

**Small Team** (less than 10 developers):
- 1 instance
- SQLite or small PostgreSQL
- Filesystem or S3 storage

**Medium Team** (10-50 developers):
- 2-3 instances
- PostgreSQL with read replica
- S3 storage with CDN

**Large Team** (50+ developers):
- 5+ instances
- PostgreSQL cluster
- Multi-region S3 with CDN
- Redis cluster

## Next Steps

- Review [Deployment Overview](../deployment/overview) for platform-specific guidance
- See [Configuration Reference](../reference/configuration) for scaling-related settings
- Check [Troubleshooting](../troubleshooting/index) for performance issues

