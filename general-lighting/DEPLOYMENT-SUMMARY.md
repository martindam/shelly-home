# Remote Control Deployment System - Summary

## What You Have

A complete automated deployment system for managing `remote-control.js` across multiple Shelly I4 Plus devices.

## Files Created

### Core Files
- **`deploy-remote-control.js`** - Main deployment script (Node.js)
- **`deploy.sh`** - Convenience shell wrapper
- **`remote-control-config.json`** - Your central configuration (edit this!)
- **`remote-control-config.template.json`** - Template/example configuration

### Documentation
- **`QUICKSTART.md`** - Quick start guide (start here!)
- **`REMOTE-CONTROL-DEPLOYMENT.md`** - Complete deployment documentation
- **`README.md`** - Updated with deployment instructions
- **`package.json`** - npm scripts for convenience

### Supporting Files
- **`.gitignore`** - Protects backup files and system files

## Quick Command Reference

```bash
# Preview what would be deployed (always run this first!)
node deploy-remote-control.js --dry-run

# Deploy to all configured devices
node deploy-remote-control.js

# Deploy to specific device only
node deploy-remote-control.js --device 192.168.1.100

# Show help
node deploy-remote-control.js --help

# Using shell wrapper (alternative)
./deploy.sh --dry-run
./deploy.sh

# Using npm (alternative)
npm run deploy:dry-run
npm run deploy
```

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  remote-control-config.json                                 │
│  (Your central configuration)                               │
│                                                              │
│  - Device 1: Living Room I4 @ 192.168.1.100                │
│    • Input 0 → Dimmer A, Channel 0                         │
│    • Input 1 → Dimmer A, Channel 1                         │
│    • Input 2 → Disabled                                     │
│    • Input 3 → Disabled                                     │
│                                                              │
│  - Device 2: Kitchen I4 @ 192.168.1.101                    │
│    • Input 0 → Dimmer B, Channel 0                         │
│    • Input 1 → Dimmer B, Channel 1                         │
│    • Input 2 → Dimmer C, Channel 0                         │
│    • Input 3 → Disabled                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  deploy-remote-control.js                                   │
│  (Deployment script)                                        │
│                                                              │
│  1. Reads configuration                                     │
│  2. Generates customized script for each device            │
│  3. Connects to each I4 device via HTTP RPC                │
│  4. Uploads and starts the script                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Shelly I4 Plus Devices                                     │
│                                                              │
│  Each device gets its own customized remote-control.js     │
│  with the correct button mappings                          │
└─────────────────────────────────────────────────────────────┘
```

## Typical Workflow

### Initial Setup
1. Edit `remote-control-config.json` with your devices
2. Run `node deploy-remote-control.js --dry-run` to preview
3. Run `node deploy-remote-control.js --device IP` to test on one device
4. Test the buttons physically
5. Run `node deploy-remote-control.js` to deploy to all

### Adding a New I4 Device
1. Add device entry to `remote-control-config.json`
2. Deploy to just that device: `node deploy-remote-control.js --device NEW_IP`
3. Test and verify

### Changing Button Mappings
1. Edit the `controls` array in `remote-control-config.json`
2. Run `--dry-run` to preview changes
3. Deploy to affected device(s)

### Updating the Base Script
1. Edit `remote-control.js` to add features/fix bugs
2. Run deployment to push to all devices

## Configuration Example

```json
{
  "devices": [
    {
      "name": "Living Room I4",
      "ip": "192.168.1.100",
      "description": "Living room wall switches",
      "controls": [
        { "ip": "dimmer1.shelly.home", "channel": 0, "description": "Main lights" },
        { "ip": "dimmer1.shelly.home", "channel": 1, "description": "Accent lights" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Not used" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Not used" }
      ]
    }
  ],
  "scriptId": 1,
  "scriptName": "remote-control"
}
```

## Button Functions

Each I4 input button supports:

| Action | Function |
|--------|----------|
| Single Press | Toggle light on/off |
| Double Press | Turn on at 100% brightness |
| Long Press | Start dimming (alternates up/down) |
| Release | Stop dimming |

## Benefits

✅ **Centralized Management** - Edit one file, deploy to many devices

✅ **Version Control** - Track changes to your configuration over time

✅ **Easy Updates** - Change button mappings without manual device access

✅ **Consistency** - All devices use the same base script logic

✅ **Documentation** - Configuration file documents what each button does

✅ **Safety** - Dry-run mode lets you preview before deploying

✅ **Selective Deployment** - Deploy to specific devices or all at once

## Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Device unreachable | Check IP, ping device, verify network |
| Script won't start | Check device logs, verify dimmer IPs |
| Wrong button behavior | Verify input order in config (0-3) |
| Deployment fails | Check device memory, update firmware |

## Next Steps

1. **Read QUICKSTART.md** - Get started in 5 minutes
2. **Edit remote-control-config.json** - Add your actual devices
3. **Run --dry-run** - Preview your configuration
4. **Deploy to one device** - Test before deploying to all
5. **Deploy to all** - Roll out to your entire setup

## Support

- **Quick Start**: [QUICKSTART.md](QUICKSTART.md)
- **Full Documentation**: [REMOTE-CONTROL-DEPLOYMENT.md](REMOTE-CONTROL-DEPLOYMENT.md)
- **All Scripts**: [README.md](README.md)
- **Shelly API**: https://shelly-api-docs.shelly.cloud/gen2/

## Tips

💡 Always use `--dry-run` first

💡 Test on one device before deploying to all

💡 Keep backups of your configuration file

💡 Use descriptive names in the `description` fields

💡 Check device logs if something doesn't work

💡 Use mDNS hostnames for more stable addressing

---

**Ready to get started?** → Read [QUICKSTART.md](QUICKSTART.md)

