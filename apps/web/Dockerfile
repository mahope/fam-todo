
# apps/web/Dockerfile
FROM node:23-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
