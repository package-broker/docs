---
sidebar_position: 1
title: Backups and Restore
description: Backup and restore procedures for PACKAGE.broker
---

# Backups and Restore

Regular backups are essential for production deployments. This guide covers backup and restore procedures for PACKAGE.broker.

## What to Backup

### Database

The database contains:
- Repository source configurations
- Token metadata
- Package metadata
- User accounts

**Critical**: Without database backup, you'll lose all configuration.

### Storage

Storage contains:
- Package distribution archives (ZIP files)
- Cached artifacts

**Note**: Artifacts can be re-downloaded from source repositories, but backups speed up recovery.

### Encryption Key

**Critical**: Store encryption key securely. Without it, you cannot decrypt stored credentials.

## Backup Procedures

### PostgreSQL Database

**Manual Backup**:
```bash
pg_dump -h host -U user -d package_broker > backup_$(date +%Y%m%d).sql
```

**Automated Backup** (cron):
```bash
# Daily backup at 2 AM
0 2 * * * pg_dump -h host -U user -d package_broker > /backups/db_$(date +\%Y\%m\%d).sql
```

**Docker Deployment**:
```bash
docker exec package-broker-postgres \
  pg_dump -U user package_broker > backup.sql
```

### SQLite Database

**Manual Backup**:
```bash
cp /data/database.sqlite /backups/database_$(date +%Y%m%d).sqlite
```

**Docker Deployment**:
```bash
docker cp package-broker:/data/database.sqlite ./backup.sqlite
```

### Cloudflare D1 Database

**Export via Wrangler**:
```bash
npx wrangler d1 export package-broker-db --output backup.sql
```

**Automated Backup** (GitHub Actions or similar):
```yaml
- name: Backup D1 Database
  run: |
    npx wrangler d1 export package-broker-db --output backup.sql
    # Upload to S3 or other storage
```

### Storage Backups

**S3-Compatible Storage**:
- Enable versioning on bucket
- Use lifecycle policies for retention
- Cross-region replication (optional)

**Filesystem Storage**:
```bash
tar -czf storage_backup_$(date +%Y%m%d).tar.gz /data/storage
```

**Cloudflare R2**:
- Export to S3 for backup
- Use R2 lifecycle rules
- Manual export via API

### Encryption Key

**Store securely**:
- Environment variable (not in code)
- Secret manager (AWS Secrets Manager, HashiCorp Vault)
- Encrypted file (GPG-encrypted)

**Document location** (for recovery):
- Store in secure password manager
- Share with trusted team members
- Document in disaster recovery plan

## Restore Procedures

### Database Restore

**PostgreSQL**:
```bash
psql -h host -U user -d package_broker < backup.sql
```

**SQLite**:
```bash
cp backup.sqlite /data/database.sqlite
chmod 644 /data/database.sqlite
```

**Cloudflare D1**:
```bash
npx wrangler d1 execute package-broker-db --file=backup.sql --remote
```

### Storage Restore

**S3-Compatible**:
- Restore from versioned backup
- Copy from backup bucket
- Re-sync from source repositories (slower)

**Filesystem**:
```bash
tar -xzf storage_backup.tar.gz -C /data/
```

**R2**:
- Import from S3 backup
- Re-sync from source repositories

### Full Restore

1. **Stop PACKAGE.broker**:
   ```bash
   docker stop package-broker
   ```

2. **Restore database**:
   ```bash
   # PostgreSQL
   psql -h host -U user -d package_broker < backup.sql
   
   # SQLite
   cp backup.sqlite /data/database.sqlite
   ```

3. **Restore storage**:
   ```bash
   # Extract or copy storage files
   tar -xzf storage_backup.tar.gz -C /data/
   ```

4. **Verify encryption key**:
   - Ensure `ENCRYPTION_KEY` matches backup
   - Test credential decryption

5. **Start PACKAGE.broker**:
   ```bash
   docker start package-broker
   ```

6. **Verify health**:
   ```bash
   curl http://localhost:8080/health
   ```

## Backup Schedule

### Recommended Schedule

| Component | Frequency | Retention |
|-----------|-----------|-----------|
| Database | Daily | 30 days |
| Storage | Weekly | 90 days |
| Encryption Key | On change | Permanent |

### Automated Backups

Set up automated backups:
- **Database**: Daily automated backups
- **Storage**: Weekly snapshots
- **Monitoring**: Alert on backup failures

## Disaster Recovery

### Recovery Time Objective (RTO)

**Target**: Restore service within 4 hours

**Steps**:
1. Provision new infrastructure (if needed)
2. Restore database (30 minutes)
3. Restore storage (1-2 hours)
4. Verify and test (30 minutes)

### Recovery Point Objective (RPO)

**Target**: Maximum 24 hours of data loss

**Strategy**:
- Daily database backups
- Continuous storage replication (if using S3)
- Point-in-time recovery (PostgreSQL)

## Testing Backups

### Regular Testing

Test restore procedures monthly:
1. Create test environment
2. Restore from backup
3. Verify functionality
4. Document issues

### Verification Checklist

- [ ] Database restore successful
- [ ] Storage artifacts accessible
- [ ] Encryption key works
- [ ] Health endpoint responds
- [ ] Package downloads work
- [ ] Authentication works

## Next Steps

- Review [Deployment Overview](../deployment/overview) for production setup
- See [Configuration Reference](../reference/configuration) for backup-related settings
- Check [Troubleshooting](../troubleshooting/) for restore issues


