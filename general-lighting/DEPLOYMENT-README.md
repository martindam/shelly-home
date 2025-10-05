# 🚀 Remote Control Deployment System

Automated deployment of `remote-control.js` to multiple Shelly I4 Plus devices from a central configuration.

## 📋 What This Does

Instead of manually editing and uploading scripts to each I4 device, you:
1. Define all your devices and button mappings in **one JSON file**
2. Run **one command** to deploy to all devices
3. Update the config and redeploy when things change

## ⚡ Quick Start (5 Minutes)

### 1. Edit Configuration

Open `remote-control-config.json` and add your devices:

```json
{
  "devices": [
    {
      "name": "Living Room I4",
      "ip": "192.168.1.100",
      "controls": [
        { "ip": "192.168.1.150", "channel": 0, "description": "Main lights" },
        { "ip": "192.168.1.150", "channel": 1, "description": "Floor lamp" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Not used" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Not used" }
      ]
    }
  ]
}
```

### 2. Preview

```bash
node deploy-remote-control.js --dry-run
```

### 3. Deploy

```bash
# Deploy to one device first (test)
node deploy-remote-control.js --device 192.168.1.100

# Deploy to all devices
node deploy-remote-control.js
```

### 4. Test

Press the buttons on your I4 device:
- **Single press** → Toggle on/off
- **Double press** → 100% brightness
- **Long press** → Start dimming
- **Release** → Stop dimming

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[QUICKSTART.md](QUICKSTART.md)** | 5-minute getting started guide |
| **[DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)** | Overview and command reference |
| **[REMOTE-CONTROL-DEPLOYMENT.md](REMOTE-CONTROL-DEPLOYMENT.md)** | Complete documentation |

## 🎯 Common Commands

```bash
# Preview deployment (safe, no changes)
node deploy-remote-control.js --dry-run

# Deploy to all devices
node deploy-remote-control.js

# Deploy to specific device
node deploy-remote-control.js --device 192.168.1.100

# Show help
node deploy-remote-control.js --help
```

## 📁 Files

```
remote-control-config.json          ← Edit this with your devices
deploy-remote-control.js            ← Deployment script
remote-control.js                   ← Base script template
remote-control-config.template.json ← Example configuration
QUICKSTART.md                       ← Start here!
DEPLOYMENT-SUMMARY.md               ← Overview
REMOTE-CONTROL-DEPLOYMENT.md        ← Full docs
```

## 💡 Key Features

✅ **Centralized Config** - One file for all devices  
✅ **Dry Run Mode** - Preview before deploying  
✅ **Selective Deploy** - Update one or all devices  
✅ **Auto-Discovery** - Finds and updates existing scripts  
✅ **Error Handling** - Clear error messages  
✅ **Documentation** - Config file documents itself  

## 🔧 Requirements

- Node.js (v12+)
- Shelly I4 Plus devices
- Shelly Pro Dimmer 1PM/2PM or Dimmer Gen3
- Network access to devices

## 🆘 Troubleshooting

**Can't connect to device?**
- Check IP address
- Ping the device
- Verify same network

**Script won't start?**
- Check device logs (http://DEVICE_IP → Settings → Scripts)
- Verify dimmer IPs are correct
- Check device has free memory

**Wrong button behavior?**
- Check input order (0-3) in config
- Redeploy to device

## 📖 Example Configurations

### All 4 Buttons

```json
{
  "name": "Kitchen I4",
  "ip": "192.168.1.101",
  "controls": [
    { "ip": "192.168.1.151", "channel": 0, "description": "Main" },
    { "ip": "192.168.1.151", "channel": 1, "description": "Under-cabinet" },
    { "ip": "192.168.1.152", "channel": 0, "description": "Dining" },
    { "ip": "192.168.1.152", "channel": 1, "description": "Pendant" }
  ]
}
```

### Using mDNS Hostnames

```json
{
  "name": "Office I4",
  "ip": "a0dd6c9f5b18.shelly.home",
  "controls": [
    { "ip": "2cbcbba405a4.shelly.home", "channel": 0, "description": "Desk" },
    { "ip": "2cbcbba405a4.shelly.home", "channel": 1, "description": "Overhead" },
    { "ip": "0.0.0.0", "channel": 0, "description": "Unused" },
    { "ip": "0.0.0.0", "channel": 0, "description": "Unused" }
  ]
}
```

## 🎓 Learn More

- **Shelly API**: https://shelly-api-docs.shelly.cloud/gen2/
- **All Scripts**: See [README.md](README.md)
- **Full Docs**: See [REMOTE-CONTROL-DEPLOYMENT.md](REMOTE-CONTROL-DEPLOYMENT.md)

---

**Ready?** → Start with [QUICKSTART.md](QUICKSTART.md) 🚀

