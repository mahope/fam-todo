
# apps/web/Dockerfile
FROM node:23-alpine
WORKDIR /app

# Copy package files and prisma schema
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
