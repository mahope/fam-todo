# Docker Archive

These files are archived from the previous Docker-based deployment setup.

## Archived Files
- `Dockerfile` - Previous Docker container configuration
- `docker-compose.production.yml` - Previous Docker Compose setup with database

## Migration Note
The application has been migrated to use **Nixpacks deployment** with a separate database instance in Dokploy.

For the current deployment setup, see:
- `nixpacks.toml` - Nixpacks configuration
- `.env.nixpacks.template` - Environment variables template
- `start.sh` - Production startup script
- `DEPLOYMENT_NIXPACKS.md` - Deployment guide