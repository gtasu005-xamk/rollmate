locals {
  tags = merge(
    {
      project     = "rollmate"
      environment = var.env
      managed_by  = "terraform"
    },
    var.tags
  )

  rg_name               = "${var.prefix}-rg"
  app_service_plan_name = "${var.prefix}-asp"
  webapp_name           = "${var.prefix}-api"
  postgres_server_name  = "${var.prefix}-psql"


}
