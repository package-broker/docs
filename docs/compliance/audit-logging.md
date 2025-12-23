# Audit Logging Guide

PACKAGE.broker provides structured logging and optional analytics tracking to help you monitor system activity.

## Overview

**Currently Implemented**:
- Structured JSON logging (all deployments)
- Optional Analytics Engine events (Cloudflare Workers)
- Request/response logging with correlation IDs

**Planned** (see [Roadmap](../reference/roadmap)):
- Persistent audit log database table
- Configurable retention policies
- Export capabilities for compliance
- Search and filtering interface

## Current Logging Capabilities

### Structured Logging

All deployments emit structured JSON logs for:
- Request/response events
- Authentication attempts
- Package downloads
- Repository sync operations
- Error conditions

## What Events Are Logged

### Request Logging

All HTTP requests are logged with:
- Request ID (for correlation)
- Timestamp
- Method and path
- Response status
- Duration

**Example log entry:**
```json
{
  "level": "info",
  "message": "Request completed",
  "timestamp": "2025-01-15T10:30:00Z",
  "requestId": "req_abc123",
  "context": {
    "method": "GET",
    "path": "/packages.json",
    "status": 200,
    "duration": 45
  }
}
```

### Analytics Events (Cloudflare Workers)

When Analytics Engine is configured, the following events are tracked:
- Package downloads
- Package metadata requests
- Repository sync operations
- Authentication events
- Token usage

**Note**: Analytics Engine is optional and requires paid Cloudflare Workers plan.

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

## Accessing Logs

### Cloudflare Workers

**Workers Logs** (Free Tier):
- Automatic structured JSON logging
- 3-day retention
- Access via `npx wrangler tail` or Cloudflare dashboard

**Analytics Engine** (Paid Tier):
- Optional event tracking
- Query via Analytics Engine API
- Longer retention available

### Docker Deployment

**Container Logs**:
```bash
docker logs package-broker --tail 100
```

**Log Aggregation**:
- Configure logging driver for external aggregation
- Use Docker logging plugins (e.g., fluentd, loki)
- Forward to centralized logging system

## Planned Features

:::info Planned Feature

The following audit logging features are planned for future releases:

- **Persistent Audit Log Table**: Database-backed audit log storage
- **Retention Policies**: Configurable log retention periods
- **Export API**: Programmatic log export for compliance
- **Search Interface**: Dashboard-based log search and filtering

See [Roadmap](../reference/roadmap) for implementation timeline.

:::

## Compliance Considerations

For SOC-2 and ISO 27001 compliance, consider:

1. **Log Aggregation**: Forward logs to external SIEM/logging system
2. **Retention**: Configure retention policies in your logging infrastructure
3. **Access Control**: Restrict log access to authorized personnel
4. **Monitoring**: Set up alerts for security events

## Next Steps

- Review [SOC-2 Compliance](../soc2-compliance) for compliance requirements
- Check [Roadmap](../reference/roadmap) for audit logging improvements
- Configure log aggregation for your deployment environment
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
- Check [SOC 2 Compliance Guide](../soc2-compliance.md)
- Open an issue on [GitHub](https://github.com/package-broker/server/issues)

