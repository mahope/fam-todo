# 🚀 NestList Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 🔧 Configuration
- [x] Production environment variables updated (.env.production.template)
- [x] Docker configuration optimized (Dockerfile, docker-compose.production.yml)
- [x] Domain references updated to todo.holstjensen.eu
- [x] Health check endpoint ready (/api/health)
- [x] Next.js standalone build configuration
- [x] .dockerignore configured for optimal builds

### 📚 Documentation  
- [x] DEPLOYMENT.md guide created
- [x] README.md updated with production info
- [x] PRODUCTION_CHECKLIST.md created
- [x] Environment template provided

### 🐳 Docker & Infrastructure
- [x] Production Dockerfile optimized
- [x] Docker Compose production configuration
- [x] Health checks configured
- [x] Resource limits set
- [x] Postgres persistence configured

### 🔒 Security
- [x] Environment variables properly configured
- [x] Production secrets placeholder setup
- [x] Database user/password configuration
- [x] JWT and NextAuth secrets setup
- [x] .env.production added to .gitignore

## 🎯 Deployment Steps for You

### 1. GitHub Repository Setup
```bash
# If not already done, initialize git and push to GitHub
git init
git add .
git commit -m "Initial NestList deployment ready"
git branch -M main
git remote add origin https://github.com/yourusername/nestlist.git
git push -u origin main
```

### 2. Generate Required Secrets
```bash
# Generate secure secrets for production
node -e "console.log('NEXTAUTH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"

# Generate VAPID keys for push notifications (optional)
npx web-push generate-vapid-keys
```

### 3. Dokploy Configuration

#### 3.1 Create New Application
1. Open Dokploy Dashboard
2. Create Project: "nestlist"
3. Add Application:
   - Type: **Docker Compose**
   - Name: **nestlist-app**
   - Repository: **https://github.com/yourusername/nestlist.git**
   - Branch: **main**
   - Compose File: **docker-compose.production.yml**

#### 3.2 Environment Variables
Add these in Dokploy Environment tab:
```env
POSTGRES_DB=nestlist
POSTGRES_USER=nestlist_user
POSTGRES_PASSWORD=your_secure_database_password
NODE_ENV=production
NEXTAUTH_URL=https://todo.holstjensen.eu
NEXTAUTH_SECRET=generated_secret_from_step_2
JWT_SECRET=generated_secret_from_step_2
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
LOG_LEVEL=info
```

#### 3.3 Domain Setup
1. Domains tab → Add Domain
2. Domain: **todo.holstjensen.eu**
3. Enable SSL (Let's Encrypt)
4. Port: **3000**

### 4. First Deployment
1. Click **Deploy** in Dokploy
2. Monitor build logs
3. Wait for healthy status

### 5. Database Migration
After first successful deployment:
```bash
# SSH to your server
docker exec nestlist_web npx prisma migrate deploy
docker exec nestlist_web npx prisma generate
```

### 6. Verification
```bash
# Test health endpoint
curl https://todo.holstjensen.eu/api/health

# Should return:
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-..."
}
```

### 7. Application Setup
1. Visit https://todo.holstjensen.eu
2. Create first admin user account
3. Create first family
4. Test core functionality

## 🔄 Continuous Deployment

Once setup, automatic deployment on push to main:
```bash
git add .
git commit -m "Feature updates"
git push origin main
# Dokploy will auto-deploy via webhook
```

## 📊 Monitoring & Maintenance

### Health Monitoring
- **Health Check**: https://todo.holstjensen.eu/api/health
- **Metrics**: https://todo.holstjensen.eu/api/metrics (Prometheus format)
- **Dokploy Dashboard**: Monitor resources and logs

### Backup
```bash
# Database backup
docker exec nestlist_postgres pg_dump -U nestlist_user nestlist > backup-$(date +%Y%m%d).sql
```

### Logs
```bash
# Application logs
docker logs nestlist_web

# Database logs  
docker logs nestlist_postgres
```

## 🚨 Troubleshooting

### Common Issues
1. **SSL Certificate**: Ensure domain points to server, port 80/443 open
2. **Database Connection**: Verify POSTGRES_PASSWORD and DATABASE_URL
3. **Build Failures**: Check Node.js version, npm dependencies
4. **Memory Issues**: Monitor in Dokploy, adjust resource limits if needed

### Support Resources
- Health endpoint: `/api/health`
- Metrics endpoint: `/api/metrics`
- Dokploy logs and monitoring
- Application logs via Docker

## 🎉 Success Criteria

When deployment is successful:
- ✅ https://todo.holstjensen.eu loads successfully
- ✅ Health check returns status: "healthy"
- ✅ User registration and login works
- ✅ Database operations functional
- ✅ PWA installation works on mobile
- ✅ Real-time updates functional
- ✅ Push notifications work (if enabled)

---

**🚀 NestList is ready for production deployment!**

Follow the steps above and you'll have NestList running live on https://todo.holstjensen.eu