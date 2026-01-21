# GitHub Actions - Azure Deployment Guide

## Setup: GitHub Secrets

Lisää nämä GitHub repositorioosi (Settings → Secrets and variables → Actions):

### 1. Azure Credentials
```
AZURE_CREDENTIALS
```
Luo Azure Service Principal:
```bash
az ad sp create-for-rbac --name "rollmate-github-actions" \
  --role contributor \
  --scopes /subscriptions/{SUBSCRIPTION_ID}/resourceGroups/{RESOURCE_GROUP}
```
Liitä koko JSON-output tähän secretiin.

### 2. Container Registry
```
AZURE_CONTAINER_REGISTRY_LOGIN_SERVER  # Esim: myregistry.azurecr.io
AZURE_CONTAINER_REGISTRY_USERNAME      # Esim: myregistry
AZURE_CONTAINER_REGISTRY_PASSWORD      # Salasana tai access key
```

### 3. App Service
```
AZURE_WEBAPP_NAME         # Esim: rollmate-dev-api
AZURE_RESOURCE_GROUP      # Esim: rollmate-dev-rg
```

## Workflow: deploy-backend.yml

Triggerit:
- Push to `main` (backend/** muutoksilla)
- Manual trigger (`workflow_dispatch`)

Prosessi:
1. Buildaa Docker image
2. Pushaa Azure Container Registryyn
3. Deployaa Azure Web Appiin

## Testing locally

```bash
# Build image
cd backend
docker build -t rollmate-api:latest .

# Run image
docker run -e PORT=3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  -p 3000:3000 \
  rollmate-api:latest

# Test
curl http://localhost:3000/health
```

## Troubleshooting

- Workflow fails at "Push image to ACR": Tarkista `AZURE_CONTAINER_REGISTRY_PASSWORD` (ei ole salasana, vaan access key)
- Deploy fails: Tarkista että `AZURE_CREDENTIALS` on oikea JSON ja `AZURE_WEBAPP_NAME` on olemassa
- App startup fails: Katso Azure Portal → App Service → Logs ja `docker logs`
