# 🚀 NestList Deployment Guide - Dokploy på todo.holstjensen.eu

Denne guide gennemgår hvordan du deployer NestList til production med Dokploy.

## 📋 Prerequisites

- GitHub repository setup
- Dokploy installeret på din server
- Domain (todo.holstjensen.eu) pegende på din server
- SSL certifikat (via Let's Encrypt gennem Dokploy)

## 🔧 1. Forberedelse af GitHub Repository

### 1.1 Create GitHub Repository
```bash
# Hvis ikke allerede gjort
git remote add origin https://github.com/yourusername/nestlist.git
git branch -M main
git push -u origin main
```

### 1.2 Environment Secrets
I GitHub Settings > Secrets and variables > Actions, tilføj:
- Ingen secrets nødvendige for Dokploy deployment

## 🐳 2. Server og Dokploy Setup

### 2.1 Dokploy Installation
Hvis ikke allerede installeret på din server:
```bash
curl -sSL https://dokploy.com/install.sh | sh
```

### 2.2 Domain Configuration
- Sørg for at `todo.holstjensen.eu` peger på din servers IP
- Dokploy håndterer SSL automatisk via Let's Encrypt

## 📦 3. Dokploy Deployment Configuration

### 3.1 Opret Ny Applikation i Dokploy

1. **Log ind på Dokploy Dashboard**
   - Gå til `https://your-server-ip:3000`

2. **Create New Project**
   - Navn: `nestlist`
   - Description: `Family task management application`

3. **Add Application**
   - Type: `Docker Compose`
   - Name: `nestlist-app`
   - Git Repository: `https://github.com/yourusername/nestlist.git`
   - Branch: `main`
   - Docker Compose File: `docker-compose.production.yml`

### 3.2 Environment Variables
I Dokploy under Environment Variables, tilføj:

```env
# Database
POSTGRES_DB=nestlist
POSTGRES_USER=nestlist_user
POSTGRES_PASSWORD=generér_et_sikkert_password

# Application
NODE_ENV=production
NEXTAUTH_URL=https://todo.holstjensen.eu
NEXTAUTH_SECRET=generér_mindst_32_karakterer
JWT_SECRET=generér_mindst_32_karakterer

# Push Notifications (valgfrit - generer med web-push CLI)
VAPID_PUBLIC_KEY=din_vapid_public_key
VAPID_PRIVATE_KEY=din_vapid_private_key

# Logging
LOG_LEVEL=info
```

### 3.3 Domain Configuration
1. **Gå til Domains tab**
2. **Add Domain**
   - Domain: `todo.holstjensen.eu`
   - SSL: Enable (Let's Encrypt)
   - Port: `3000`

### 3.4 Deploy Settings
1. **Auto Deploy**: Enable
2. **Build Command**: Ikke nødvendig (Docker bygger)
3. **Health Check**: `/api/health`

## 🔑 4. Generer VAPID Keys (Valgfrit)

For push notifications:
```bash
npx web-push generate-vapid-keys
```

## 🚀 5. Initial Deployment

### 5.1 First Deploy
1. **I Dokploy Dashboard**
   - Gå til din app
   - Klik `Deploy`
   - Monitor logs for eventuelle fejl

### 5.2 Database Migration
Efter første deployment:
```bash
# SSH til din server og kør:
docker exec nestlist_web npx prisma migrate deploy
docker exec nestlist_web npx prisma generate
```

## 🔍 6. Verification

### 6.1 Health Check
```bash
curl https://todo.holstjensen.eu/api/health
```

Forventet response:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "database": "connected",
  "version": "1.0.0"
}
```

### 6.2 Test Application
1. Gå til `https://todo.holstjensen.eu`
2. Opret første admin bruger
3. Test funktionaliteter

## 🔄 7. Continuous Deployment

### 7.1 Auto Deploy Setup
Dokploy vil automatisk deploye når du pusher til `main` branch:

```bash
git add .
git commit -m "Production deployment updates"
git push origin main
```

### 7.2 Monitoring Deployment
- Monitor i Dokploy Dashboard under "Deployments"
- Check logs ved fejl
- Health check endpoint: `/api/health`

## 🛠 8. Post-Deployment Tasks

### 8.1 Create Admin User
På første besøg opretter du admin brugeren via registration flow.

### 8.2 Configure Application
1. **Opret første familie**
2. **Test alle funktioner**
3. **Konfigurer push notifications** (hvis aktiveret)

## 🔧 9. Maintenance Commands

### 9.1 Database Backup
```bash
# Automatisk backup via Docker volume
docker exec nestlist_postgres pg_dump -U nestlist_user nestlist > backup.sql
```

### 9.2 View Logs
```bash
# I Dokploy Dashboard eller:
docker logs nestlist_web
docker logs nestlist_postgres
```

### 9.3 Update Application
```bash
git pull origin main
# Dokploy deployer automatisk
```

## 🚨 10. Troubleshooting

### 10.1 Common Issues

**Database Connection Error:**
```bash
# Check database status
docker exec nestlist_postgres pg_isready -U nestlist_user -d nestlist

# Reset database hvis nødvendigt
docker exec nestlist_web npx prisma migrate reset --force
```

**SSL Certificate Issues:**
- Check domain DNS settings
- Regenerate SSL i Dokploy
- Verify port 80/443 er åbne

**Memory Issues:**
```bash
# Check container resources
docker stats
# Adjust memory limits i docker-compose.production.yml
```

### 10.2 Performance Monitoring
Monitor via:
- Dokploy Dashboard metrics
- `/api/health` endpoint
- `/api/metrics` (Prometheus format)

## 📱 11. PWA Setup

Efter deployment:
1. **Test PWA installation** på mobil
2. **Verify push notifications** virker
3. **Test offline functionality**

## 🔒 12. Security Checklist

- ✅ HTTPS aktiveret
- ✅ Environment variables sat korrekt
- ✅ Database password er sikkert
- ✅ NEXTAUTH_SECRET er mindst 32 karakterer
- ✅ JWT_SECRET er mindst 32 karakterer
- ✅ Ingen secrets i kode
- ✅ Health check endpoint er tilgængelig

## 📞 13. Support

Ved problemer:
1. Check Dokploy logs
2. Verify environment variables
3. Test health endpoint
4. Check domain/DNS settings

---

**🎉 Tillykke! NestList er nu live på https://todo.holstjensen.eu**