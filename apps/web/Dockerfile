
# apps/web/Dockerfile
FROM node:23-alpine
WORKDIR /app

# Copy package files and scripts for patching
COPY package.json package-lock.json ./
COPY scripts ./scripts

# Install dependencies
RUN npm ci --legacy-peer-deps

# Apply Zod patch directly (ensuring it runs)
RUN node scripts/patch-zod.js

# Copy source code
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]
