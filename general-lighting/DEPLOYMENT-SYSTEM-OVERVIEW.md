# 🏠 Shelly Remote Control - Automated Deployment System

## System Overview

This deployment system allows you to manage multiple Shelly I4 Plus devices from a single central configuration file. Instead of manually configuring each device through its web interface, you define everything in JSON and deploy with one command.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  remote-control-config.json                            │    │
│  │  ─────────────────────────────                         │    │
│  │  Central configuration defining:                       │    │
│  │  • All I4 Plus devices                                 │    │
│  │  • Button mappings for each device                     │    │
│  │  • Which dimmers each button controls                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  deploy-remote-control.js                              │    │
│  │  ─────────────────────────                             │    │
│  │  Deployment script that:                               │    │
│  │  1. Reads configuration                                │    │
│  │  2. Generates custom script for each device            │    │
│  │  3. Connects via HTTP RPC API                          │    │
│  │  4. Uploads and starts scripts                         │    │
│  └────────────────────────────────────────────────────────┘    │
│                           ↓                                      │
└──────────────────────────┼───────────────────────────────────────┘
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
┌─────────────────────────┐   ┌─────────────────────────┐
│  Shelly I4 Plus #1      │   │  Shelly I4 Plus #2      │
│  Living Room            │   │  Kitchen                │
│  ─────────────────      │   │  ────────               │
│                         │   │                         │
│  Input 0 → Dimmer A:0   │   │  Input 0 → Dimmer C:0   │
│  Input 1 → Dimmer A:1   │   │  Input 1 → Dimmer C:1   │
│  Input 2 → Disabled     │   │  Input 2 → Dimmer D:0   │
│  Input 3 → Disabled     │   │  Input 3 → Dimmer D:1   │
│                         │   │                         │
│  [remote-control.js]    │   │  [remote-control.js]    │
│  (customized)           │   │  (customized)           │
└─────────────────────────┘   └─────────────────────────┘
              ↓                         ↓
    ┌─────────────────┐       ┌─────────────────┐
    │ Shelly Dimmers  │       │ Shelly Dimmers  │
    │ (Controlled)    │       │ (Controlled)    │
    └─────────────────┘       └─────────────────┘
```

## Files and Their Purpose

### Configuration Files

| File | Purpose | Edit? |
|------|---------|-------|
| `remote-control-config.json` | **Your main config** - defines all devices and mappings | ✅ YES |
| `remote-control-config.template.json` | Example/template configuration | ℹ️ Reference |
| `remote-control.js` | Base script template | ⚠️ Only if adding features |

### Deployment Scripts

| File | Purpose | Usage |
|------|---------|-------|
| `deploy-remote-control.js` | Main deployment script | `node deploy-remote-control.js` |
| `deploy.sh` | Shell wrapper | `./deploy.sh --dry-run` |
| `package.json` | npm scripts | `npm run deploy` |

### Documentation

| File | Purpose | When to Read |
|------|---------|--------------|
| `QUICKSTART.md` | 5-minute getting started | 👈 **Start here!** |
| `DEPLOYMENT-README.md` | Quick reference | For quick lookups |
| `DEPLOYMENT-SUMMARY.md` | Command reference & overview | When you need commands |
| `REMOTE-CONTROL-DEPLOYMENT.md` | Complete documentation | For detailed info |
| `README.md` | All scripts in repo | For other scripts |

## How It Works

### 1. Configuration Phase

You edit `remote-control-config.json`:

```json
{
  "devices": [
    {
      "name": "Living Room I4",
      "ip": "192.168.1.100",
      "description": "Living room wall switches",
      "controls": [
        { "ip": "dimmer1.shelly.home", "channel": 0, "description": "Main lights" },
        { "ip": "dimmer1.shelly.home", "channel": 1, "description": "Floor lamp" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Not used" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Not used" }
      ]
    }
  ]
}
```

### 2. Generation Phase

The deployment script:
- Reads your configuration
- Takes the base `remote-control.js` template
- For each device, generates a customized version with that device's specific button mappings
- Each generated script is unique to that device

### 3. Deployment Phase

The script:
- Connects to each I4 device via HTTP (Shelly RPC API)
- Checks if a script already exists
- Stops the old script if running
- Uploads the new customized script
- Enables and starts the script
- Reports success or failure

### 4. Operation Phase

Each I4 device now runs its customized script:
- Button presses are detected
- The script sends commands to the configured dimmers
- Lights respond according to the button action

## Command Reference

### Essential Commands

```bash
# 1. Preview what will be deployed (ALWAYS DO THIS FIRST)
node deploy-remote-control.js --dry-run

# 2. Deploy to one device (test first)
node deploy-remote-control.js --device 192.168.1.100

# 3. Deploy to all devices
node deploy-remote-control.js

# 4. Get help
node deploy-remote-control.js --help
```

### Alternative Ways to Run

```bash
# Using shell wrapper
./deploy.sh --dry-run
./deploy.sh

# Using npm scripts
npm run deploy:dry-run
npm run deploy
```

## Button Functions

Each button on the I4 device provides these functions:

| Button Action | Result | Use Case |
|--------------|--------|----------|
| **Single Press** | Toggle on/off | Normal daily use |
| **Double Press** | Turn on at 100% | Need full brightness |
| **Long Press** | Start dimming | Adjust brightness |
| **Release** | Stop dimming | Reached desired level |

The dimming direction alternates each time (up → down → up → down...).

## Common Workflows

### Initial Setup

```bash
# 1. Edit configuration
nano remote-control-config.json

# 2. Preview
node deploy-remote-control.js --dry-run

# 3. Test on one device
node deploy-remote-control.js --device 192.168.1.100

# 4. Physically test the buttons
# Press each button to verify correct operation

# 5. Deploy to all
node deploy-remote-control.js
```

### Adding a New I4 Device

```bash
# 1. Add device to remote-control-config.json
nano remote-control-config.json

# 2. Deploy to just that device
node deploy-remote-control.js --device 192.168.1.105

# 3. Test the buttons
# Press each button to verify

# Done! The device is now part of your managed configuration
```

### Changing Button Mappings

```bash
# 1. Edit the controls array for the device
nano remote-control-config.json

# 2. Preview the change
node deploy-remote-control.js --dry-run

# 3. Deploy to that device
node deploy-remote-control.js --device 192.168.1.100

# 4. Test the buttons
# Verify the new mappings work correctly
```

### Updating All Devices

```bash
# If you improve the base remote-control.js script:

# 1. Edit remote-control.js
nano remote-control.js

# 2. Preview deployment
node deploy-remote-control.js --dry-run

# 3. Deploy to all
node deploy-remote-control.js
```

## Configuration Structure

### Device Entry

Each device in the configuration has:

```json
{
  "name": "Friendly name",           // For your reference
  "ip": "192.168.1.100",             // IP or mDNS hostname
  "description": "Location/purpose",  // Documentation
  "controls": [                       // Exactly 4 entries (inputs 0-3)
    { "ip": "...", "channel": 0, "description": "..." },  // Input 0
    { "ip": "...", "channel": 1, "description": "..." },  // Input 1
    { "ip": "...", "channel": 0, "description": "..." },  // Input 2
    { "ip": "...", "channel": 0, "description": "..." }   // Input 3
  ]
}
```

### Control Entry

Each control (button) has:

```json
{
  "ip": "dimmer.shelly.home",  // IP or hostname of dimmer (0.0.0.0 = disabled)
  "channel": 0,                // 0 = Output 1, 1 = Output 2
  "description": "What it controls"  // Documentation
}
```

## IP Addressing

### Option 1: IP Addresses

```json
"ip": "192.168.1.100"
```

**Pros:** Simple, direct  
**Cons:** May change if DHCP lease expires

### Option 2: mDNS Hostnames

```json
"ip": "a0dd6c9f5b18.shelly.home"
```

Format: `[last-12-chars-of-MAC].shelly.home`

**Pros:** Stable, doesn't change  
**Cons:** Requires mDNS support on network

**Recommendation:** Use mDNS hostnames for more reliable addressing.

## Troubleshooting

### Device Unreachable

```
Error: Device unreachable: connect ETIMEDOUT
```

**Causes:**
- Wrong IP address
- Device offline
- Network issue
- Firewall blocking

**Solutions:**
1. Verify IP: `ping 192.168.1.100`
2. Check device web interface: `http://192.168.1.100`
3. Verify same network/VLAN
4. Check firewall rules

### Script Won't Start

```
Error: Deployment failed: ...
```

**Causes:**
- Invalid dimmer IP in configuration
- Device out of memory
- Script syntax error

**Solutions:**
1. Check device logs: `http://DEVICE_IP` → Settings → Scripts → Logs
2. Verify dimmer IPs are correct
3. Check device has free memory
4. Update device firmware

### Wrong Button Behavior

**Problem:** Button does something unexpected

**Causes:**
- Wrong input order in config
- Wrong dimmer IP/channel
- Physical wiring issue

**Solutions:**
1. Verify input order (0-3) matches physical buttons
2. Check dimmer IP and channel in config
3. Test each button individually
4. Check device logs for errors

## Advanced Usage

### Multiple Script IDs

If you need to run multiple scripts on a device:

```json
{
  "scriptId": 2,  // Use ID 2 instead of default 1
  "scriptName": "remote-control-alt"
}
```

### Backup Before Changes

```bash
# Backup configuration
cp remote-control-config.json remote-control-config.backup.json

# Make changes
nano remote-control-config.json

# If something goes wrong, restore
cp remote-control-config.backup.json remote-control-config.json
```

### Selective Deployment

```bash
# Deploy to multiple specific devices
node deploy-remote-control.js --device 192.168.1.100
node deploy-remote-control.js --device 192.168.1.101
node deploy-remote-control.js --device 192.168.1.102
```

## Best Practices

✅ **Always use --dry-run first** - Preview before deploying

✅ **Test on one device** - Verify before rolling out to all

✅ **Use descriptive names** - Future you will thank you

✅ **Keep backups** - Save copies of working configurations

✅ **Document changes** - Add comments in the config file

✅ **Check logs** - Review device logs after deployment

✅ **Use mDNS** - More stable than IP addresses

✅ **Version control** - Consider using git for the config file

## Security Considerations

- The deployment script connects to devices over HTTP (not HTTPS)
- Ensure your network is trusted
- Consider using VLANs to isolate IoT devices
- Keep device firmware updated
- Use strong passwords on device web interfaces

## Performance

- Deployment is sequential (one device at a time)
- Each device takes ~5-10 seconds to deploy
- 10 devices = ~1-2 minutes total
- Dry-run is instant (no network calls)

## Limitations

- Requires Node.js on your computer
- Requires network access to all devices
- Devices must be Gen2 (support RPC API)
- Limited to 4 buttons per I4 device
- Each button controls one dimmer/channel

## Future Enhancements

Possible improvements:
- Web-based configuration interface
- Parallel deployment (faster)
- Device discovery (auto-find I4 devices)
- Configuration validation
- Rollback capability
- Deployment history/logging

## Getting Help

1. **Read the docs**: Start with [QUICKSTART.md](QUICKSTART.md)
2. **Check logs**: Device web interface → Settings → Scripts → Logs
3. **Use dry-run**: Preview what will happen
4. **Test incrementally**: One device at a time
5. **Check network**: Ping devices, verify connectivity

## Resources

- **Quick Start**: [QUICKSTART.md](QUICKSTART.md) 👈 Start here
- **Command Reference**: [DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)
- **Full Documentation**: [REMOTE-CONTROL-DEPLOYMENT.md](REMOTE-CONTROL-DEPLOYMENT.md)
- **All Scripts**: [README.md](README.md)
- **Shelly API**: https://shelly-api-docs.shelly.cloud/gen2/

---

**Ready to get started?** → Read [QUICKSTART.md](QUICKSTART.md) 🚀

