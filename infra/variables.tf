variable "env" {
  description = "Environment name (e.g., dev)"
  type        = string
}

variable "location" {
  description = "Azure region (e.g., northeurope)"
  type        = string
}

variable "prefix" {
  description = "Resource name prefix (e.g., rollmate-dev)"
  type        = string
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default     = {}
}

variable "app_service_sku_name" {
  description = "App Service Plan SKU (e.g., B1, B2)"
  type        = string
  default     = "B1"
}

variable "postgres_admin_login" {
  description = "PostgreSQL admin username"
  type        = string
  default     = "rollmateadmin"
}

variable "postgres_admin_password" {
  description = "PostgreSQL admin password (set via TF_VAR_postgres_admin_password)"
  type        = string
  sensitive   = true
}

variable "postgres_version" {
  description = "PostgreSQL version"
  type        = string
  default     = "15"
}

variable "postgres_sku_name" {
  description = "PostgreSQL SKU (dev-friendly)"
  type        = string
  default     = "B_Standard_B2ms"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB"
  type        = number
  default     = 32768
}

variable "postgres_db_name" {
  description = "Application database name"
  type        = string
  default     = "rollmate"
}

variable "key_vault_name" {
  description = "Key Vault name (globally unique; 3-24 chars; only alphanumerics)"
  type        = string
}

variable "database_url_secret_name" {
  description = "Key Vault secret name for DATABASE_URL"
  type        = string
  default     = "DATABASE-URL"
}

variable "jwt_secret_name" {
  description = "Key Vault secret name for JWT_SECRET"
  type        = string
  default     = "JWT-SECRET"
}
