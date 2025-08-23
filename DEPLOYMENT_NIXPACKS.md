# 🚀 NestList Nixpacks Deployment Guide - Dokploy

Denne guide gennemgår hvordan du deployer NestList til production med **Nixpacks** gennem Dokploy, med en separat PostgreSQL database instance.

## 📋 Prerequisites

- GitHub repository setup
- Dokploy installeret på din server
- Domain (todo.holstjensen.eu) pegende på din server
- SSL certifikat (via Let's Encrypt gennem Dokploy)
- **Separat PostgreSQL database instance** i Dokploy

## 🔧 1. Database Setup (Først!)

### 1.1 Opret PostgreSQL Database i Dokploy
1. **Log ind på Dokploy Dashboard**
2. **Create New Project** (hvis ikke allerede oprettet)
   - Navn: `nestlist`
3. **Add Database**
   - Type: `PostgreSQL`
   - Name: `nestlist-db`
   - Database: `nestlist`
   - Username: `nestlist_user`
   - Password: `generér_et_sikkert_password`
   - Version: `16` (anbefalet)

### 1.2 Noter Database Connection Info
Efter oprettelse får du en connection string som:
```
postgresql://nestlist_user:password@nestlist-db:5432/nestlist
```

## 📦 2. Application Deployment

### 2.1 Opret Nixpacks Application i Dokploy

1. **Add Application** til samme project
   - Type: `Nixpacks`
   - Name: `nestlist-app`
   - Git Repository: `https://github.com/yourusername/nestlist.git`
   - Branch: `main`
   - Build Path: `/` (root)

### 2.2 Environment Variables

I Dokploy under Environment Variables, tilføj:

```env
# Database (Point til din PostgreSQL instance)
DATABASE_URL=postgresql://nestlist_user:your_password@nestlist-db:5432/nestlist

# Application
NODE_ENV=production
NEXTAUTH_URL=https://todo.holstjensen.eu
NEXTAUTH_SECRET=generér_mindst_32_karakterer_her
JWT_SECRET=generér_mindst_32_karakterer_her

# Push Notifications (Valgfrit - generer med web-push CLI)
VAPID_PUBLIC_KEY=din_vapid_public_key
VAPID_PRIVATE_KEY=din_vapid_private_key

# Logging
LOG_LEVEL=info
NEXT_TELEMETRY_DISABLED=1

# Optional: Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=noreply@holstjensen.eu
```

### 2.3 Domain Configuration
1. **Gå til Domains tab** for aplikationen
2. **Add Domain**
   - Domain: `todo.holstjensen.eu`
   - SSL: Enable (Let's Encrypt)
   - Port: `3000` (Next.js default port)

### 2.4 Deploy Settings
1. **Auto Deploy**: Enable
2. **Health Check Path**: `/api/health`
3. **Build Command**: Automatisk via Nixpacks (bruger `nixpacks.toml`)
4. **Start Command**: Automatisk via Nixpacks (`./start.sh`)

## 🔑 3. Generer VAPID Keys (Valgfrit)

For push notifications:
```bash
npx web-push generate-vapid-keys
```

## 🚀 4. Initial Deployment

### 4.1 First Deploy
1. **Deploy Application** - Dokploy vil automatisk:
   - Clone repository
   - Køre Nixpacks build process
   - Installere Node.js dependencies
   - Bygge Next.js application
   - Køre Prisma migrations (via `start.sh`)
   - Starte applikationen

### 4.2 Verify Deployment
- Database connection: `/api/health`
- SSL certificate: `https://todo.holstjensen.eu`
- Service worker: Check PWA functionality

## 🔄 5. Continuous Deployment

Med **Auto Deploy** aktiveret vil Dokploy automatisk deploye når du pusher til main branch.

### 5.1 Deploy Process
```bash
git add .
git commit -m "Your changes"
git push origin main
# Dokploy deployer automatisk
```

## 📋 6. Post-Deployment Checklist

- [ ] Database migrations kører korrekt
- [ ] SSL certificate er aktivt
- [ ] Health check returnerer 200
- [ ] PWA funktioner virker
- [ ] Push notifications virker (hvis aktiveret)
- [ ] All API endpoints responderer
- [ ] Authentication fungerer korrekt

## 🛠️ 7. Troubleshooting

### Common Issues

**Build Fejl:**
- Check Nixpacks logs i Dokploy
- Verificer `nixpacks.toml` syntax
- Tjek Node.js version compatibility

**Database Connection:**
- Verificer DATABASE_URL format
- Sikr database instance kører
- Check network connectivity mellem services

**Migration Fejl:**
- Check Prisma schema syntax
- Verificer database permissions
- Se application logs for detaljer

### Logs
Access logs via Dokploy dashboard:
1. Gå til Application
2. Klik på **Logs** tab
3. Se real-time logs

## 🔧 8. Maintenance

### Database Backup
Dokploy giver automatisk backup options for PostgreSQL instances.

### Application Updates
```bash
# For at force rebuild uden code changes:
# Gå til Dokploy → Application → Actions → Rebuild
```

### Environment Updates
Environment variables kan opdateres i Dokploy og kræver application restart.

## 📚 9. Key Files

- `nixpacks.toml` - Nixpacks build configuration
- `start.sh` - Production startup script med migrations
- `.env.nixpacks.template` - Environment variables template
- `apps/web/package.json` - Build og start scripts

## 🔗 10. Useful Commands

```bash
# Local testing af production build:
cd apps/web
npm run build:prod
npm run start:prod

# Generate Prisma client:
npx prisma generate

# Run migrations:
npm run migrate:deploy
```

---

## Migration fra Docker

Hvis du migrerer fra den tidligere Docker setup:
1. Docker files er arkiveret i `docker-archive/`
2. Database er nu separat PostgreSQL instance
3. Application bruger nu Nixpacks i stedet for Dockerfile
4. Samme environment variables, men DATABASE_URL peger på ekstern database