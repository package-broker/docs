# Audit Logging Guide

PACKAGE.broker provides comprehensive audit logging to help you meet compliance requirements and track system activity.

## Overview

Audit logs record all significant events in PACKAGE.broker, including:
- User authentication and authorization
- Package access and downloads
- Configuration changes
- Administrative actions
- Security events

## What Events Are Logged

### Authentication Events

- Login attempts (successful and failed)
- Token creation and revocation
- Password changes
- Session management

**Example log entry:**
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "event": "authentication",
  "action": "login_success",
  "user": "admin@example.com",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0..."
}
```

### Package Access Events

- Package downloads
- Repository access
- Package metadata requests
- Composer API calls

**Example log entry:**
```json
{
  "timestamp": "2025-01-15T10:31:00Z",
  "event": "package_access",
  "action": "download",
  "package": "vendor/package",
  "version": "1.2.3",
  "user": "token:ci-cd-token",
  "ip_address": "10.0.0.50"
}
```

### Configuration Changes

- Repository source additions/removals
- Access token modifications
- Settings updates
- User permission changes

**Example log entry:**
```json
{
  "timestamp": "2025-01-15T10:32:00Z",
  "event": "configuration",
  "action": "add_source",
  "user": "admin@example.com",
  "details": {
    "source_url": "https://github.com/org/repo",
    "source_type": "github"
  }
}
```

### Administrative Actions

- User creation and deletion
- Permission changes
- System configuration updates
- Backup and restore operations

## Log Format and Structure

### Standard Log Format

All audit logs follow a consistent JSON structure:

```json
{
  "timestamp": "ISO 8601 timestamp",
  "event": "event_category",
  "action": "specific_action",
  "user": "user_identifier",
  "ip_address": "client_ip",
  "user_agent": "client_user_agent",
  "details": {
    "additional": "context"
  },
  "severity": "info|warning|error"
}
```

### Log Levels

- **Info**: Normal operational events
- **Warning**: Unusual but non-critical events
- **Error**: Error conditions requiring attention

## Log Retention Policies

### Recommended Retention Periods

| Log Type | Retention Period | Rationale |
|----------|-----------------|-----------|
| Authentication | 1 year | Security investigations |
| Package Access | 90 days | Performance analysis |
| Configuration | 2 years | Compliance requirements |
| Administrative | 2 years | Audit trail |

### Configuring Retention

Retention policies can be configured in your deployment:

**Cloudflare Workers:**
- Logs stored in Cloudflare Analytics
- Retention: 30 days (free tier)
- Export for longer retention

**Docker Deployment:**
- Configure log rotation
- Use external log aggregation
- Set retention in logging driver

## Exporting Logs

### Export Methods

1. **Dashboard Export**:
   - Navigate to "Audit Logs" in dashboard
   - Select date range
   - Export as JSON or CSV

2. **API Export**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://package-broker.your-domain.com/api/audit-logs?from=2025-01-01&to=2025-01-31
   ```

3. **Database Export** (Docker):
   ```bash
   docker exec package-broker-db \
     psql -U postgres -d package_broker \
     -c "COPY audit_logs TO '/tmp/audit_logs.csv' CSV HEADER;"
   ```

## Exporting to SIEM

### Splunk Integration

1. **Configure HTTP Event Collector**:
   - Set up Splunk HEC endpoint
   - Configure authentication token

2. **Forward Logs**:
   ```bash
   # Use Splunk Universal Forwarder
   # Or configure log forwarding in PACKAGE.broker
   ```

### Datadog Integration

1. **Set up Datadog Agent**:
   - Install Datadog agent
   - Configure log collection

2. **Forward Logs**:
   ```yaml
   # datadog.yaml
   logs_enabled: true
   logs_config:
     container_collect_all: true
   ```

### ELK Stack Integration

1. **Configure Logstash**:
   ```ruby
   input {
     http {
       port => 5044
     }
   }
   
   filter {
     json {
       source => "message"
     }
   }
   
   output {
     elasticsearch {
       hosts => ["elasticsearch:9200"]
     }
   }
   ```

2. **Forward Logs**:
   - Use HTTP input in Logstash
   - Configure PACKAGE.broker to send logs

## Tamper-Proof Logging

### Strategies

1. **Immutable Storage**:
   - Use write-once storage
   - Enable versioning
   - Use append-only logs

2. **Digital Signatures**:
   - Sign log entries
   - Verify signatures on read
   - Detect tampering

3. **External Log Aggregation**:
   - Send logs to external system immediately
   - Reduce tampering risk
   - Centralized audit trail

### Implementation

**Example: Append-only log file**
```bash
# Configure log rotation to append-only
# Use file system permissions to prevent modification
chmod 444 /var/log/package-broker/audit.log
```

**Example: Signed logs**
```javascript
// Sign each log entry
const signature = crypto.sign('sha256', logEntry, privateKey);
const signedEntry = {
  ...logEntry,
  signature: signature.toString('base64')
};
```

## Log Analysis

### Common Queries

**Failed login attempts:**
```json
{
  "event": "authentication",
  "action": "login_failed"
}
```

**Package downloads by user:**
```json
{
  "event": "package_access",
  "action": "download",
  "user": "specific-user"
}
```

**Configuration changes:**
```json
{
  "event": "configuration"
}
```

### Monitoring Alerts

Set up alerts for:
- Multiple failed login attempts
- Unusual access patterns
- Configuration changes outside business hours
- High-volume package downloads

## Compliance Considerations

### GDPR

- Anonymize IP addresses if required
- Implement data retention policies
- Provide log export capabilities
- Document data processing

### SOC 2

- Retain logs for required period
- Implement log integrity controls
- Regular log reviews
- Document log management procedures

### ISO 27001

- Comprehensive event logging
- Log retention policies
- Regular log reviews
- Tamper-proof logging

## Best Practices

1. **Enable Audit Logging**:
   - Enable logging on all deployments
   - Configure appropriate log levels
   - Test log collection

2. **Regular Reviews**:
   - Review logs weekly
   - Investigate anomalies
   - Document findings

3. **Secure Storage**:
   - Encrypt log storage
   - Restrict access to logs
   - Implement backup procedures

4. **Automation**:
   - Automate log analysis
   - Set up alerts
   - Automate log exports

## Troubleshooting

### Logs Not Appearing

1. Check logging is enabled
2. Verify log storage configuration
3. Check disk space
4. Review log permissions

### High Log Volume

1. Adjust log levels
2. Filter unnecessary events
3. Implement log sampling
4. Use log aggregation

## Support

For audit logging questions:

- Review [ISO 27001 Compliance Guide](./iso-27001-compliance.md)
- Check [SOC 2 Compliance Guide](./soc2-compliance.md)
- Open an issue on [GitHub](https://github.com/package-broker/server/issues)

