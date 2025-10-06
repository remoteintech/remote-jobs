#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');
const process = require('process');

// Helper to log messages
const log = (msg) => console.log(`[INFO] ${msg}`);
const error = (msg) => console.error(`[ERROR] ${msg}`);

// Paths
const BUILD_SCRIPT = path.join(__dirname, 'build-site.js');
const SITE_DIR = path.join(__dirname, '..', 'site', 'build');

// Optional CLI args: port and host
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || 'localhost';

// Function to build site
function buildSite() {
    log('Building static site...');
    const result = spawnSync(process.execPath, [BUILD_SCRIPT], { stdio: 'inherit' });

    if (result.error) {
        error('Build process failed.');
        throw result.error;
    }
    if (result.status > 0) {
        error(`Build process exited with code ${result.status}`);
        process.exit(result.status);
    }
    log('Build completed successfully.');
}

// Function to serve site
function serveSite() {
    log(`Serving site from ${SITE_DIR} at http://${HOST}:${PORT}`);
    process.argv.splice(2, 0, SITE_DIR, '-p', PORT, '-a', HOST);
    require('http-server/bin/http-server');
}

// Main
(function main() {
    buildSite();
    serveSite();
})();
