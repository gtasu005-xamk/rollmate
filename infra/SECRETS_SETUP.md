# Key Vault Secrets Setup

This document describes how to populate Key Vault with required secrets for the Rollmate application.

## Prerequisites

- Azure CLI installed (`az --version`)
- Authenticated to Azure (`az login`)
- Key Vault Administrator role on the Key Vault (granted automatically by Terraform)

## Required Secrets

### 1. DATABASE_URL

PostgreSQL connection string for the application database.

```bash
# Format: postgresql://<username>:<password>@<host>:5432/<database>?sslmode=require

# Get the PostgreSQL server hostname from Terraform output
terraform output postgres_fqdn

# Example command (replace values):
az keyvault secret set \
  --vault-name rollmatedevswekv \
  --name DATABASE-URL \
  --value "postgresql://rollmateadmin:YOUR_SECURE_PASSWORD@rollmate-swe-dev-psql.postgres.database.azure.com:5432/rollmate?sslmode=require"
```

**Important:** Use the same admin password you set when running `terraform apply` (via `TF_VAR_postgres_admin_password` environment variable).

### 2. JWT_SECRET

Secret key for signing JWT tokens in authentication.

```bash
# Generate a secure random secret (PowerShell)
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "Generated JWT_SECRET: $jwtSecret"

# Store in Key Vault
az keyvault secret set \
  --vault-name rollmatedevswekv \
  --name JWT-SECRET \
  --value "$jwtSecret"
```

Alternatively, generate with OpenSSL:
```bash
openssl rand -base64 64
```

## Verification

After setting secrets, verify they are accessible:

```bash
# List secrets
az keyvault secret list --vault-name rollmatedevswekv --query "[].name" -o tsv

# Verify App Service can access (check the References are correct)
terraform output database_url_secret_uri
terraform output jwt_secret_uri
```

## App Service Integration

App Service automatically resolves Key Vault references in `app_settings` via:

1. **System-assigned Managed Identity** - Created by Terraform
2. **Key Vault Secrets User role** - Assigned by Terraform
3. **Key Vault References** - Format: `@Microsoft.KeyVault(SecretUri=...)`

No additional configuration needed after secrets are created.

## Local Development

For local backend development, create `backend/.env` (already in `.gitignore`):

```env
DATABASE_URL="postgresql://rollmateadmin:YOUR_PASSWORD@rollmate-swe-dev-psql.postgres.database.azure.com:5432/rollmate?sslmode=require"
JWT_SECRET="your-local-dev-secret"
PORT=3000
```

**NEVER commit this file to Git.**

## Security Checklist

- [x] `.env` files in `.gitignore` (root and backend/)
- [x] `terraform.tfvars` in `.gitignore`
- [x] Key Vault created with RBAC authorization
- [x] App Service uses System-assigned Managed Identity
- [x] App Service settings use Key Vault References (not plaintext)
- [x] No secrets in Terraform state outputs (only URIs)
- [ ] Secrets populated in Key Vault (manual step)
- [ ] Verified App Service can start and resolve secrets

## Troubleshooting

### App Service can't resolve secrets

1. Check Managed Identity is assigned:
   ```bash
   az webapp identity show --name rollmate-swe-dev-api --resource-group rollmate-swe-dev-rg
   ```

2. Check RBAC assignment:
   ```bash
   az role assignment list --assignee <principal_id_from_above> --scope /subscriptions/.../resourceGroups/rollmate-swe-dev-rg/providers/Microsoft.KeyVault/vaults/rollmatedevswekv
   ```

3. Check Key Vault Reference format in App Settings:
   ```bash
   az webapp config appsettings list --name rollmate-swe-dev-api --resource-group rollmate-swe-dev-rg
   ```

### Cannot set secrets in Key Vault

Ensure you have Key Vault Administrator role:
```bash
az role assignment create \
  --role "Key Vault Administrator" \
  --assignee <your-user-principal-id> \
  --scope <key-vault-resource-id>
```

This is automatically granted by Terraform to the user running `terraform apply`.
