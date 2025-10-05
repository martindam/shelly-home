# 🎯 START HERE - Shelly Remote Control Deployment

Welcome! This is your entry point for the automated deployment system.

## 🚀 What You Want to Do

### I'm New - Just Getting Started
👉 Read **[QUICKSTART.md](QUICKSTART.md)** (5 minutes)

This will get you up and running quickly with step-by-step instructions.

### I Need a Quick Reference
👉 Read **[DEPLOYMENT-README.md](DEPLOYMENT-README.md)**

Quick command reference and common examples.

### I Want to Understand the System
👉 Read **[DEPLOYMENT-SYSTEM-OVERVIEW.md](DEPLOYMENT-SYSTEM-OVERVIEW.md)**

Complete overview of how everything works together.

### I Need Detailed Documentation
👉 Read **[REMOTE-CONTROL-DEPLOYMENT.md](REMOTE-CONTROL-DEPLOYMENT.md)**

Full documentation with troubleshooting and advanced usage.

### I Want Command Examples
👉 Read **[DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)**

Command reference and workflow examples.

## 📋 Quick Command Cheat Sheet

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

## 📁 Important Files

| File | What It Is | Do You Edit It? |
|------|------------|-----------------|
| `remote-control-config.json` | Your device configuration | ✅ **YES** - This is your main config |
| `remote-control.js` | Base script template | ⚠️ Only if adding features |
| `deploy-remote-control.js` | Deployment script | ❌ No need to edit |

## 🎓 Learning Path

1. **Read**: [QUICKSTART.md](QUICKSTART.md) (5 min)
2. **Edit**: `remote-control-config.json` with your devices
3. **Test**: `node deploy-remote-control.js --dry-run`
4. **Deploy**: `node deploy-remote-control.js --device YOUR_IP`
5. **Verify**: Press buttons to test
6. **Roll Out**: `node deploy-remote-control.js` (all devices)

## 🆘 Having Issues?

### Can't Connect to Device
- Check IP address is correct
- Ping the device: `ping 192.168.1.100`
- Verify device is powered on

### Script Won't Start
- Check device logs: `http://DEVICE_IP` → Settings → Scripts → Logs
- Verify dimmer IPs in your config
- Check device has free memory

### Wrong Button Behavior
- Verify input order (0-3) in config matches physical buttons
- Check dimmer IP and channel are correct
- Redeploy to device

## 💡 Pro Tips

✅ Always use `--dry-run` first  
✅ Test on one device before deploying to all  
✅ Use descriptive names in your config  
✅ Keep backups of your configuration  
✅ Check device logs if something doesn't work  

## 📚 All Documentation

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[QUICKSTART.md](QUICKSTART.md)** | Get started in 5 minutes | 👈 **Start here!** |
| **[DEPLOYMENT-README.md](DEPLOYMENT-README.md)** | Quick reference | When you need a quick lookup |
| **[DEPLOYMENT-SUMMARY.md](DEPLOYMENT-SUMMARY.md)** | Command reference | When you need commands |
| **[DEPLOYMENT-SYSTEM-OVERVIEW.md](DEPLOYMENT-SYSTEM-OVERVIEW.md)** | Complete overview | When you want to understand everything |
| **[REMOTE-CONTROL-DEPLOYMENT.md](REMOTE-CONTROL-DEPLOYMENT.md)** | Full documentation | When you need detailed info |
| **[README.md](README.md)** | All scripts in repo | For other scripts (garage, outdoor, etc.) |

## 🎯 What This System Does

Instead of manually configuring each Shelly I4 Plus device:

1. ✅ Define all devices in **one JSON file**
2. ✅ Run **one command** to deploy to all
3. ✅ Update config and redeploy when things change

## 🏗️ System Architecture

```
Your Config (JSON)
       ↓
Deployment Script
       ↓
Multiple I4 Devices
       ↓
Control Dimmers
```

Each I4 device gets a customized script with its specific button mappings.

## 🔧 Requirements

- ✅ Node.js (v12+)
- ✅ Shelly I4 Plus devices
- ✅ Shelly Pro Dimmer 1PM/2PM or Dimmer Gen3
- ✅ Network access to devices

## 🎮 Button Functions

Each button supports:

- **Single Press** → Toggle on/off
- **Double Press** → 100% brightness
- **Long Press** → Start dimming
- **Release** → Stop dimming

## 🚦 Next Steps

### Right Now
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Edit `remote-control-config.json`
3. Run `node deploy-remote-control.js --dry-run`

### After That
1. Deploy to one device: `node deploy-remote-control.js --device IP`
2. Test the buttons
3. Deploy to all: `node deploy-remote-control.js`

---

**Ready?** → Open [QUICKSTART.md](QUICKSTART.md) and let's get started! 🚀

