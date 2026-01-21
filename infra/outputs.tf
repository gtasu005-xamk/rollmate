output "resource_group_name" {
  value = azurerm_resource_group.rg.name
}

output "resource_group_location" {
  value = azurerm_resource_group.rg.location
}

output "log_analytics_workspace_name" {
  value = azurerm_log_analytics_workspace.law.name
}

output "application_insights_name" {
  value = azurerm_application_insights.ai.name
}

output "application_insights_connection_string" {
  value     = azurerm_application_insights.ai.connection_string
  sensitive = true
}

output "webapp_name" {
  value = azurerm_linux_web_app.api.name
}

output "api_base_url" {
  value = "https://${azurerm_linux_web_app.api.default_hostname}"
}

output "postgres_fqdn" {
  value = azurerm_postgresql_flexible_server.pg.fqdn
}

output "postgres_db_name" {
  value = azurerm_postgresql_flexible_server_database.db.name
}

output "key_vault_name" {
  value = azurerm_key_vault.kv.name
}

output "key_vault_uri" {
  value = azurerm_key_vault.kv.vault_uri
}

output "database_url_secret_uri" {
  value = "${azurerm_key_vault.kv.vault_uri}secrets/${var.database_url_secret_name}"
}

output "jwt_secret_uri" {
  value = "${azurerm_key_vault.kv.vault_uri}secrets/${var.jwt_secret_name}"
}
