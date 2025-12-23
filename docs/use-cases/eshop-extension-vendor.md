---
sidebar_position: 1
title: E-shop Extension Vendor Integration
description: Automate customer token provisioning when customers purchase extensions
---

# E-shop Extension Vendor Integration

This guide shows how to integrate PACKAGE.broker with an e-shop platform to automatically provision Composer tokens when customers purchase extensions.

## Use Case Overview

**Scenario**: You develop PHP extensions (e.g., Magento modules, WordPress plugins) and sell them through an e-shop. When a customer purchases an extension, they need a Composer token to download and install it.

**Solution**: Use PACKAGE.broker's Management API to automatically create customer-specific tokens when purchase events occur.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   E-shop    │ ──▶ │  Webhook/API │ ──▶ │ PACKAGE.broker  │
│  Platform   │     │   Handler    │     │  Management API │
└─────────────┘     └──────────────┘     └─────────────────┘
      │                                           │
      │                                           ▼
      │                                  ┌─────────────────┐
      │                                  │  Customer Token│
      │                                  │   (scoped to    │
      │                                  │   vendor/*)     │
      └──────────────────────────────────▶└─────────────────┘
              Customer receives token
```

## Prerequisites

:::info Planned Feature

The Management API authentication and customer token provisioning features described in this guide are planned but not yet implemented. See [Roadmap](../../reference/roadmap) for implementation status.

:::

- PACKAGE.broker instance deployed and accessible
- Management API token with `tokens:write` permission
- E-shop platform capable of making HTTP requests (webhook support)

## Step 1: Create Management API Token

First, create a Management API token in PACKAGE.broker for your e-shop integration:

1. Log into PACKAGE.broker dashboard
2. Navigate to **Settings** → **API Tokens**
3. Click **Create Management Token**
4. Select scopes:
   - `tokens:write` - Create customer tokens
   - `tokens:read` - List customer tokens
   - `customers:read` - Access customer information (if available)
5. **Copy the token** - you'll use this in your e-shop integration

## Step 2: Configure Repository Sources

Ensure your extension packages are available in PACKAGE.broker:

1. Add repository sources for your extension packages
2. Configure package filters if needed (e.g., `your-vendor/*`)
3. Verify packages are synced and available

## Step 3: Implement Purchase Webhook

In your e-shop platform, create a webhook handler that triggers on purchase completion:

### Example: PHP Webhook Handler

```php
<?php
// webhook-handler.php

$managementApiUrl = 'https://package-broker.example.com/api';
$managementToken = 'your-management-api-token';

// Receive purchase event from e-shop
$purchaseData = json_decode(file_get_contents('php://input'), true);

$customerId = $purchaseData['customer_id'];
$customerEmail = $purchaseData['customer_email'];
$orderId = $purchaseData['order_id'];
$expiresAt = strtotime('+1 year'); // Token expires in 1 year

// Create customer token via Management API
$tokenData = [
    'description' => "Customer: {$customerEmail} (Order: {$orderId})",
    'permissions' => 'readonly',
    'expires_at' => $expiresAt,
    'allowed_package_prefixes' => ['your-vendor/'], // Scope to your extensions
    'metadata' => [
        'customer_id' => $customerId,
        'customer_email' => $customerEmail,
        'order_id' => $orderId,
    ],
];

$ch = curl_init("{$managementApiUrl}/tokens");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($tokenData),
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . $managementToken,
        'Content-Type: application/json',
    ],
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 201) {
    $tokenResponse = json_decode($response, true);
    $composerToken = $tokenResponse['token'];
    
    // Send token to customer via email or store in order
    sendTokenToCustomer($customerEmail, $composerToken, $orderId);
} else {
    error_log("Failed to create token: {$response}");
}
```

### Example: Node.js Webhook Handler

```javascript
// webhook-handler.js
const axios = require('axios');

const MANAGEMENT_API_URL = 'https://package-broker.example.com/api';
const MANAGEMENT_TOKEN = 'your-management-api-token';

async function handlePurchase(purchaseData) {
  const { customerId, customerEmail, orderId } = purchaseData;
  
  // Calculate expiration (1 year from now)
  const expiresAt = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
  
  try {
    const response = await axios.post(
      `${MANAGEMENT_API_URL}/tokens`,
      {
        description: `Customer: ${customerEmail} (Order: ${orderId})`,
        permissions: 'readonly',
        expires_at: expiresAt,
        allowed_package_prefixes: ['your-vendor/'], // Scope to your extensions
        metadata: {
          customer_id: customerId,
          customer_email: customerEmail,
          order_id: orderId,
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${MANAGEMENT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const composerToken = response.data.token;
    
    // Send token to customer
    await sendTokenToCustomer(customerEmail, composerToken, orderId);
    
    return { success: true, token: composerToken };
  } catch (error) {
    console.error('Failed to create token:', error.response?.data || error.message);
    throw error;
  }
}
```

## Step 4: Send Token to Customer

After creating the token, send it to the customer via email or include it in the order confirmation:

### Email Template Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Extension Access Token</title>
</head>
<body>
  <h1>Thank you for your purchase!</h1>
  
  <p>Your Composer access token is ready. Use it to install your extensions:</p>
  
  <h2>Configure Composer</h2>
  
  <p>Add this to your <code>composer.json</code>:</p>
  <pre><code>{
  "repositories": [
    {
      "type": "composer",
      "url": "https://package-broker.example.com"
    }
  ]
}</code></pre>
  
  <p>Configure authentication:</p>
  <pre><code>$ composer config http-basic.package-broker.example.com token YOUR_TOKEN_HERE</code></pre>
  
  <p><strong>Your token:</strong> <code>YOUR_TOKEN_HERE</code></p>
  
  <p><em>This token expires on: EXPIRATION_DATE</em></p>
  
  <p>For detailed installation instructions, visit: https://docs.example.com/install</p>
</body>
</html>
```

## Step 5: Handle Subscription Cancellations

When a customer cancels their subscription or access is revoked, revoke their token:

```php
<?php
// revoke-token.php

$managementApiUrl = 'https://package-broker.example.com/api';
$managementToken = 'your-management-api-token';
$customerId = $_POST['customer_id'];

// Find token by customer ID
$tokens = getCustomerTokens($customerId, $managementApiUrl, $managementToken);

foreach ($tokens as $token) {
    // Revoke token
    $ch = curl_init("{$managementApiUrl}/tokens/{$token['id']}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => 'DELETE',
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $managementToken,
        ],
    ]);
    
    curl_exec($ch);
    curl_close($ch);
}

function getCustomerTokens($customerId, $apiUrl, $token) {
    $ch = curl_init("{$apiUrl}/tokens?customer_id={$customerId}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
        ],
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
```

## Security Considerations

### Token Scoping

Always scope customer tokens to your vendor namespace:

```json
{
  "allowed_package_prefixes": ["your-vendor/"]
}
```

This ensures customers can only access your extensions, not other packages in the instance.

### Token Expiration

Set appropriate expiration dates based on your subscription model:

- **One-time purchases**: Token expires after reasonable period (e.g., 1 year)
- **Subscriptions**: Token expires when subscription ends
- **Renewals**: Create new token or extend existing token

### Rate Limiting

Configure rate limits on customer tokens to prevent abuse:

```json
{
  "rate_limit_max": 1000  // Requests per hour
}
```

### Audit Logging

All token creation and revocation events are logged for compliance and troubleshooting.

## API Reference

### Create Customer Token

**Endpoint**: `POST /api/tokens`

**Headers**:
```
Authorization: Bearer <management-api-token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "description": "Customer: customer@example.com (Order: 12345)",
  "permissions": "readonly",
  "expires_at": 1735689600,
  "allowed_package_prefixes": ["your-vendor/"],
  "rate_limit_max": 1000,
  "metadata": {
    "customer_id": "cust_123",
    "customer_email": "customer@example.com",
    "order_id": "order_12345"
  }
}
```

**Response** (201 Created):
```json
{
  "id": "token_abc123",
  "token": "the-actual-token-value-showed-once",
  "description": "Customer: customer@example.com (Order: 12345)",
  "permissions": "readonly",
  "expires_at": 1735689600,
  "created_at": 1704067200
}
```

### List Customer Tokens

**Endpoint**: `GET /api/tokens?customer_id=cust_123`

**Headers**:
```
Authorization: Bearer <management-api-token>
```

**Response** (200 OK):
```json
[
  {
    "id": "token_abc123",
    "description": "Customer: customer@example.com (Order: 12345)",
    "permissions": "readonly",
    "expires_at": 1735689600,
    "created_at": 1704067200,
    "last_used_at": 1704153600
  }
]
```

### Revoke Token

**Endpoint**: `DELETE /api/tokens/{token_id}`

**Headers**:
```
Authorization: Bearer <management-api-token>
```

**Response** (200 OK):
```json
{
  "message": "Token revoked"
}
```

## Troubleshooting

### Token Creation Fails

- Verify Management API token has `tokens:write` permission
- Check token hasn't expired
- Ensure request format matches API specification
- Review PACKAGE.broker logs for detailed error messages

### Customer Can't Access Packages

- Verify token has correct `allowed_package_prefixes`
- Check package names match the vendor namespace
- Ensure repository sources are synced and active
- Verify token hasn't expired

### Rate Limiting Issues

- Check token `rate_limit_max` setting
- Consider increasing limit for legitimate high-volume customers
- Monitor token usage via Management API

## Next Steps

- Review API documentation: [API Reference](../reference/api)
- Understand token management: [Token Management](../administration/tokens)
- Check [Roadmap](../reference/roadmap) for Management API implementation status

