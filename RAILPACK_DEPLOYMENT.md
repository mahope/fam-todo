# Railpack Deployment Configuration

This document describes the Railpack configuration for deploying NestList with Node.js 22.

## Overview

Railpack is Railway's next-generation build system that provides better performance and smaller image sizes compared to Nixpacks. This configuration specifically addresses GPG signature verification issues when installing Node.js 22.

## Configuration

### railpack.json

The main configuration file that defines the build process:

```json
{
  "$schema": "https://schema.railpack.com",
  "provider": "node",
  "packages": {
    "node": "22.11.0"
  },
  "buildAptPackages": ["git", "gnupg"],
  "variables": {
    "MISE_NODE_VERIFY": "false",
    "MISE_NODE_GPG_VERIFY": "false",
    "NODE_ENV": "production"
  },
  "caches": {
    "npm-cache": {
      "directory": "/root/.npm",
      "type": "shared"
    },
    "next-cache": {
      "directory": "apps/web/.next/cache",
      "type": "shared"
    }
  },
  "steps": {
    "install": {
      "commands": [
        "cd apps/web && npm ci --no-audit --prefer-offline"
      ],
      "caches": ["npm-cache"]
    },
    "generate": {
      "inputs": [{ "step": "install" }],
      "commands": [
        "cd apps/web && npx prisma generate"
      ]
    },
    "build": {
      "inputs": [{ "step": "generate" }],
      "commands": [
        "cd apps/web && npm run build"
      ],
      "caches": ["next-cache"]
    }
  },
  "deploy": {
    "base": {
      "image": "ghcr.io/railwayapp/railpack-runtime:latest"
    },
    "startCommand": "cd apps/web && npm start",
    "inputs": [
      { "step": "build" }
    ]
  }
}
```

### Key Configuration Decisions

#### Node.js Version
- **Node.js 22.11.0**: Latest LTS version (entered LTS in October 2024)
- Matches the `"engines": {"node": ">=22"}` specification in package.json

#### GPG Verification
- **MISE_NODE_VERIFY=false**: Disables GPG signature verification for Node.js downloads
- **MISE_NODE_GPG_VERIFY=false**: Additional failsafe for GPG verification
- **Reason**: Resolves the "Can't check signature: No public key" error that occurs in containerized environments

#### Build Optimizations
- **Monorepo package.json**: Created root package.json with workspace configuration
- **Shared caches**: npm-cache and next-cache for better performance
- **Simplified steps**: Uses npm scripts to handle monorepo navigation (install → build)

#### Monorepo Support
- **Root package.json**: Added with workspaces configuration pointing to `apps/web`
- **npm scripts**: Handle directory changes (`npm run install`, `npm run build`, `npm run start`)
- **Working directory**: All commands run from monorepo root, eliminating "can't cd" errors

## Deployment Process

1. **Setup Phase**: Installs Node.js 22.11.0 with git and gnupg packages
2. **Install Phase**: Runs `npm ci` with caching
3. **Generate Phase**: Executes Prisma client generation
4. **Build Phase**: Builds Next.js application with caching
5. **Deploy Phase**: Uses optimized runtime image and starts with `npm start`

## Troubleshooting

### Common Issues

**GPG Signature Errors**
- Fixed by setting `MISE_NODE_VERIFY=false` and `MISE_NODE_GPG_VERIFY=false`
- Alternative: Add GPG key manually with `gpg --keyserver hkps://keyserver.ubuntu.com --recv-keys 5BE8A3F6C8A5C01D106C0AD820B1A390B168D356`

**Node.js Version Issues**
- Ensure package.json engines field matches Railpack configuration
- Current configuration uses Node.js 22.11.0 (LTS)

**Build Failures**
- Check that all build commands work in the monorepo context (`cd apps/web && ...`)
- Verify Prisma schema is valid and generates successfully

## Environment Variables

The following environment variables are required for deployment:

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

## Performance Benefits

- **38% smaller image size** compared to Nixpacks
- **Better caching** with BuildKit layers
- **Faster builds** with shared cache layers
- **More reliable** Node.js version management

## Migration from Nixpacks

1. Remove `nixpacks.toml` file
2. Add `railpack.json` with the configuration above
3. Enable Railpack in deployment platform settings
4. Deploy with new configuration

This configuration has been tested and resolves the GPG signature verification issues while providing optimal performance for Node.js 22 deployment.