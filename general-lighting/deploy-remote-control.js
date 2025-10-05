#!/usr/bin/env node

/**
 * Deployment script for remote-control.js
 * 
 * This script reads the central configuration from remote-control-config.json
 * and deploys customized versions of remote-control.js to each Shelly I4 Plus device.
 * 
 * Usage:
 *   node deploy-remote-control.js [options]
 * 
 * Options:
 *   --dry-run    Show what would be deployed without actually deploying
 *   --device IP  Deploy only to the specified device IP
 *   --help       Show this help message
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// Configuration
const CONFIG_FILE = 'remote-control-config.json';
const SCRIPT_FILE = 'remote-control.js';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const helpRequested = args.includes('--help');
const deviceIndex = args.indexOf('--device');
const targetDevice = deviceIndex !== -1 ? args[deviceIndex + 1] : null;

if (helpRequested) {
    console.log(`
Deployment script for remote-control.js

Usage:
  node deploy-remote-control.js [options]

Options:
  --dry-run    Show what would be deployed without actually deploying
  --device IP  Deploy only to the specified device IP
  --help       Show this help message

Example:
  node deploy-remote-control.js --dry-run
  node deploy-remote-control.js --device 192.168.1.100
  node deploy-remote-control.js
`);
    process.exit(0);
}

// Read configuration file
function readConfig() {
    try {
        const configPath = path.join(__dirname, CONFIG_FILE);
        const configData = fs.readFileSync(configPath, 'utf8');
        return JSON.parse(configData);
    } catch (error) {
        console.error(`Error reading configuration file ${CONFIG_FILE}:`, error.message);
        process.exit(1);
    }
}

// Read the base script template
function readScriptTemplate() {
    try {
        const scriptPath = path.join(__dirname, SCRIPT_FILE);
        return fs.readFileSync(scriptPath, 'utf8');
    } catch (error) {
        console.error(`Error reading script file ${SCRIPT_FILE}:`, error.message);
        process.exit(1);
    }
}

// Generate customized script for a specific device
function generateScript(deviceConfig) {
    const template = readScriptTemplate();
    
    // Build the devices array configuration
    let devicesArray = '[\n';
    deviceConfig.controls.forEach((control, index) => {
        const comment = control.description ? `  // ${control.description}` : '';
        devicesArray += `    { ip: '${control.ip}', channel: ${control.channel} }`;
        if (index < deviceConfig.controls.length - 1) {
            devicesArray += ',';
        }
        if (comment) {
            devicesArray += comment;
        }
        devicesArray += '\n';
    });
    devicesArray += ']';
    
    // Replace the devices array in the template
    // Match the devices array declaration and replace it
    const devicesRegex = /let devices = \[[^\]]*\];/s;
    const customizedScript = template.replace(devicesRegex, `let devices = ${devicesArray};`);
    
    return customizedScript;
}

// Make HTTP request to Shelly device
function shellyRequest(ip, method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: ip,
            port: 80,
            path: endpoint,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve(parsed);
                } catch (e) {
                    resolve(responseData);
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (postData) {
            req.write(postData);
        }
        
        req.end();
    });
}

// Check if device is reachable
async function checkDevice(ip) {
    try {
        const result = await shellyRequest(ip, 'GET', '/rpc/Shelly.GetDeviceInfo');
        return result;
    } catch (error) {
        throw new Error(`Device unreachable: ${error.message}`);
    }
}

// Get existing scripts on device
async function getScripts(ip) {
    try {
        const result = await shellyRequest(ip, 'GET', '/rpc/Script.List');
        return result.scripts || [];
    } catch (error) {
        throw new Error(`Failed to list scripts: ${error.message}`);
    }
}

// Create or update script on device
async function deployScript(ip, scriptId, scriptName, scriptCode) {
    try {
        // First, try to get the script to see if it exists
        const scripts = await getScripts(ip);
        const existingScript = scripts.find(s => s.id === scriptId);
        
        if (existingScript) {
            console.log(`  → Script ID ${scriptId} exists, updating...`);
            
            // Stop the script if it's running
            if (existingScript.running) {
                await shellyRequest(ip, 'POST', '/rpc/Script.Stop', { id: scriptId });
                console.log(`  → Stopped running script`);
            }
            
            // Update the script code
            await shellyRequest(ip, 'POST', '/rpc/Script.PutCode', { 
                id: scriptId, 
                code: scriptCode 
            });
            console.log(`  → Updated script code`);
            
        } else {
            console.log(`  → Script ID ${scriptId} does not exist, creating...`);
            
            // Create new script
            await shellyRequest(ip, 'POST', '/rpc/Script.Create', { 
                name: scriptName 
            });
            console.log(`  → Created new script`);
            
            // Put the code
            await shellyRequest(ip, 'POST', '/rpc/Script.PutCode', { 
                id: scriptId, 
                code: scriptCode 
            });
            console.log(`  → Uploaded script code`);
        }
        
        // Enable and start the script
        await shellyRequest(ip, 'POST', '/rpc/Script.SetConfig', { 
            id: scriptId, 
            config: { enable: true } 
        });
        console.log(`  → Enabled script`);
        
        await shellyRequest(ip, 'POST', '/rpc/Script.Start', { id: scriptId });
        console.log(`  → Started script`);
        
        return true;
    } catch (error) {
        throw new Error(`Deployment failed: ${error.message}`);
    }
}

// Deploy to a single device
async function deployToDevice(deviceConfig, config) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Device: ${deviceConfig.name}`);
    console.log(`IP: ${deviceConfig.ip}`);
    console.log(`Description: ${deviceConfig.description}`);
    console.log(`${'='.repeat(60)}`);
    
    // Show configuration
    console.log('\nConfiguration:');
    deviceConfig.controls.forEach((control, index) => {
        console.log(`  Input ${index}: ${control.ip} channel ${control.channel} - ${control.description}`);
    });
    
    if (dryRun) {
        console.log('\n[DRY RUN] Would deploy script with above configuration');
        console.log('\nGenerated script preview:');
        console.log('─'.repeat(60));
        const script = generateScript(deviceConfig);
        // Show first 20 lines
        const lines = script.split('\n').slice(0, 25);
        console.log(lines.join('\n'));
        console.log('... (truncated)');
        console.log('─'.repeat(60));
        return { success: true, dryRun: true };
    }
    
    try {
        // Check device connectivity
        console.log('\n→ Checking device connectivity...');
        const deviceInfo = await checkDevice(deviceConfig.ip);
        console.log(`  ✓ Device reachable: ${deviceInfo.model || 'Unknown model'}`);
        
        // Generate customized script
        console.log('\n→ Generating customized script...');
        const script = generateScript(deviceConfig);
        console.log(`  ✓ Script generated (${script.length} bytes)`);
        
        // Deploy script
        console.log('\n→ Deploying script...');
        await deployScript(deviceConfig.ip, config.scriptId, config.scriptName, script);
        console.log(`  ✓ Deployment successful!`);
        
        return { success: true };
    } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Main deployment function
async function main() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     Shelly Remote Control Deployment Script               ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    
    if (dryRun) {
        console.log('\n⚠️  DRY RUN MODE - No changes will be made\n');
    }
    
    // Read configuration
    const config = readConfig();
    console.log(`\nLoaded configuration from ${CONFIG_FILE}`);
    console.log(`Found ${config.devices.length} device(s) configured\n`);
    
    // Filter devices if specific device requested
    let devicesToDeploy = config.devices;
    if (targetDevice) {
        devicesToDeploy = config.devices.filter(d => d.ip === targetDevice);
        if (devicesToDeploy.length === 0) {
            console.error(`Error: Device with IP ${targetDevice} not found in configuration`);
            process.exit(1);
        }
        console.log(`Deploying only to device: ${targetDevice}\n`);
    }
    
    // Deploy to each device
    const results = [];
    for (const device of devicesToDeploy) {
        const result = await deployToDevice(device, config);
        results.push({ device: device.name, ...result });
    }
    
    // Summary
    console.log('\n\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                    DEPLOYMENT SUMMARY                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    results.forEach(result => {
        const status = result.dryRun ? '🔍 DRY RUN' : 
                      result.success ? '✓ SUCCESS' : '✗ FAILED';
        console.log(`${status} - ${result.device}`);
        if (result.error) {
            console.log(`         ${result.error}`);
        }
    });
    
    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;
    
    console.log(`\nTotal: ${successCount} successful, ${failCount} failed`);
    
    if (dryRun) {
        console.log('\n💡 Run without --dry-run to actually deploy the scripts');
    }
}

// Run the script
main().catch(error => {
    console.error('\nFatal error:', error);
    process.exit(1);
});
