#!/usr/bin/env node

/**
 * Simple deployment verification script
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const BASE_URL = process.env.DEPLOYMENT_URL || process.argv[2] || 'http://localhost:8080';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function verify() {
  console.log(`🔍 Verifying deployment at: ${BASE_URL}`);
  
  try {
    // Test health endpoint
    const response = await makeRequest(`${BASE_URL}/api/health`);
    
    if (response.statusCode === 200) {
      const health = JSON.parse(response.body);
      console.log('✅ Health check passed:', health.status);
      console.log('✅ Deployment verification successful!');
      process.exit(0);
    } else {
      console.log('❌ Health check failed with status:', response.statusCode);
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Deployment verification failed:', error.message);
    process.exit(1);
  }
}

verify();