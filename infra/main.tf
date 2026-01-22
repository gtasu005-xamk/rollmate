resource "azurerm_resource_group" "rg" {
  name     = local.rg_name
  location = var.location
  tags     = local.tags
}

resource "azurerm_log_analytics_workspace" "law" {
  name                = "${var.prefix}-law"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  sku               = "PerGB2018"
  retention_in_days = 30

  tags = local.tags
}

resource "azurerm_application_insights" "ai" {
  name                = "${var.prefix}-ai"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  application_type = "web"
  workspace_id     = azurerm_log_analytics_workspace.law.id

  tags = local.tags
}

resource "azurerm_service_plan" "asp" {
  name                = local.app_service_plan_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  os_type = "Linux"

  sku_name = var.app_service_sku_name

  tags = local.tags
}

resource "azurerm_linux_web_app" "api" {
  name                = local.webapp_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  service_plan_id     = azurerm_service_plan.asp.id

  https_only = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = true

    application_stack {
      node_version = "20-lts"
    }

    # Use custom startup script for migrations + start
    app_command_line = "node dist/server.js"
  }

  app_settings = {
    APPLICATION_INSIGHTS_CONNECTION_STRING = azurerm_application_insights.ai.connection_string
    
    # Build configuration
    SCM_DO_BUILD_DURING_DEPLOYMENT = "false"
    WEBSITE_RUN_FROM_PACKAGE       = "1"
    
    # CORS origin for web frontend
    CORS_ORIGIN = azurerm_static_web_app.web.default_host_name
    
    # Key Vault references (NO secret values here)
    DATABASE_URL = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.kv.vault_uri}secrets/${var.database_url_secret_name})"
    JWT_SECRET   = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault.kv.vault_uri}secrets/${var.jwt_secret_name})"
  }

  tags = local.tags

}

resource "azurerm_static_web_app" "web" {
  name                = "${var.prefix}-web"
  location            = "westeurope"
  resource_group_name = azurerm_resource_group.rg.name

  sku_tier = "Free"

  tags = local.tags
}

resource "azurerm_postgresql_flexible_server" "pg" {
  name                = local.postgres_server_name
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  version    = var.postgres_version
  sku_name   = var.postgres_sku_name
  storage_mb = var.postgres_storage_mb

  administrator_login    = var.postgres_admin_login
  administrator_password = var.postgres_admin_password

  backup_retention_days = 7

  lifecycle {
    ignore_changes = [ zone ]
  }

  tags = local.tags
}

resource "azurerm_postgresql_flexible_server_database" "db" {
  name      = var.postgres_db_name
  server_id = azurerm_postgresql_flexible_server.pg.id

  collation = "en_US.utf8"
  charset   = "UTF8"
}

# Allow access from Azure services (incl. App Service) – dev/MVP friendly
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.pg.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

data "azurerm_client_config" "current" {}

resource "azurerm_key_vault" "kv" {
  name                       = var.key_vault_name
  location                   = azurerm_resource_group.rg.location
  resource_group_name        = azurerm_resource_group.rg.name
  tenant_id                  = data.azurerm_client_config.current.tenant_id
  sku_name                   = "standard"
  enable_rbac_authorization  = true
  purge_protection_enabled   = false
  soft_delete_retention_days = 7

  tags = local.tags
}

# Allow YOU (the current principal running Terraform) to set secrets in the vault
resource "azurerm_role_assignment" "kv_admin_current_user" {
  scope                = azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Administrator"
  principal_id         = data.azurerm_client_config.current.object_id
}

# Allow the Web App's System-assigned Managed Identity to read secrets
resource "azurerm_role_assignment" "kv_secrets_user_webapp" {
  scope                = azurerm_key_vault.kv.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_linux_web_app.api.identity[0].principal_id
}

