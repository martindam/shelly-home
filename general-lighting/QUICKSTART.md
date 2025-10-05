# Quick Start Guide - Remote Control Deployment

This guide will help you quickly set up and deploy the remote control script to your Shelly I4 Plus devices.

## Prerequisites

- ✅ Node.js installed (check with `node --version`)
- ✅ Shelly I4 Plus devices on your network
- ✅ Shelly Pro Dimmer 1PM/2PM or Dimmer Gen3 devices to control
- ✅ Network access to all devices

## Step 1: Configure Your Devices

Edit `remote-control-config.json` and replace the example configuration with your actual devices:

```json
{
  "devices": [
    {
      "name": "Living Room I4",
      "ip": "192.168.1.100",
      "description": "Living room wall switches",
      "controls": [
        { "ip": "192.168.1.150", "channel": 0, "description": "Main ceiling lights" },
        { "ip": "192.168.1.150", "channel": 1, "description": "Floor lamp" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Not used" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Not used" }
      ]
    }
  ],
  "scriptId": 1,
  "scriptName": "remote-control"
}
```

### Finding Your Device IP Addresses

**Option 1: Check your router**
- Log into your router's admin interface
- Look for DHCP client list
- Find devices named "shellyplus-i4-..." or "shellyprodimmer-..."

**Option 2: Use the Shelly mobile app**
- Open the Shelly app
- Each device shows its IP address in the device settings

**Option 3: Use mDNS hostnames**
- Format: `[last-12-chars-of-mac].shelly.home`
- Example: `a0dd6c9f5b18.shelly.home`
- Find the MAC address on the device label or in the Shelly app

## Step 2: Test with Dry Run

Before deploying, preview what will happen:

```bash
node deploy-remote-control.js --dry-run
```

This will show:
- ✓ Which devices will be updated
- ✓ The button configuration for each device
- ✓ A preview of the generated script
- ✓ No actual changes will be made

## Step 3: Deploy to One Device First

Test on a single device before deploying to all:

```bash
node deploy-remote-control.js --device 192.168.1.100
```

Replace `192.168.1.100` with your actual device IP.

## Step 4: Test the Buttons

After deployment, test each button on the I4 device:

- **Single press**: Should toggle the light on/off
- **Double press**: Should turn light on at 100% brightness
- **Long press**: Should start dimming (up or down)
- **Release**: Should stop dimming

## Step 5: Deploy to All Devices

Once you've verified one device works correctly:

```bash
node deploy-remote-control.js
```

This will deploy to all devices configured in `remote-control-config.json`.

## Using npm Scripts (Optional)

If you prefer, you can use npm scripts:

```bash
npm run deploy:dry-run    # Preview deployment
npm run deploy            # Deploy to all devices
npm run deploy:help       # Show help
```

## Common Issues

### "Device unreachable"

**Problem**: Can't connect to the device

**Solutions**:
1. Verify the IP address is correct
2. Ping the device: `ping 192.168.1.100`
3. Check that the device is powered on
4. Ensure you're on the same network

### "Script deployment failed"

**Problem**: Script uploaded but won't start

**Solutions**:
1. Check device logs in web interface (http://DEVICE_IP → Settings → Scripts)
2. Verify dimmer IP addresses are correct in your config
3. Check that the device has enough free memory
4. Try updating device firmware

### Wrong button behavior

**Problem**: Button does the wrong thing

**Solutions**:
1. Check your `controls` array in the config - make sure the order matches your physical buttons
2. Remember: Input 0 = first button, Input 1 = second button, etc.
3. Redeploy to that specific device after fixing the config

## Next Steps

### Add More Devices

1. Add new device entries to `remote-control-config.json`
2. Run `node deploy-remote-control.js --device NEW_IP` to deploy to just that device
3. Test and verify
4. The new device is now part of your managed configuration

### Update Existing Configuration

1. Edit the `controls` array for any device in `remote-control-config.json`
2. Run deployment (optionally with `--dry-run` first)
3. The script will automatically update the device

### Backup Your Configuration

```bash
cp remote-control-config.json remote-control-config.backup.json
```

## Example Configurations

### All 4 Buttons Used

```json
{
  "name": "Kitchen I4",
  "ip": "192.168.1.101",
  "description": "Kitchen switches",
  "controls": [
    { "ip": "192.168.1.151", "channel": 0, "description": "Main lights" },
    { "ip": "192.168.1.151", "channel": 1, "description": "Under-cabinet" },
    { "ip": "192.168.1.152", "channel": 0, "description": "Dining room" },
    { "ip": "192.168.1.152", "channel": 1, "description": "Pendant lights" }
  ]
}
```

### Only 2 Buttons Used

```json
{
  "name": "Bedroom I4",
  "ip": "192.168.1.102",
  "description": "Bedroom switches",
  "controls": [
    { "ip": "192.168.1.153", "channel": 0, "description": "Ceiling light" },
    { "ip": "192.168.1.153", "channel": 1, "description": "Reading lamp" },
    { "ip": "0.0.0.0", "channel": 0, "description": "Not used" },
    { "ip": "0.0.0.0", "channel": 0, "description": "Not used" }
  ]
}
```

### Using mDNS Hostnames

```json
{
  "name": "Office I4",
  "ip": "a0dd6c9f5b18.shelly.home",
  "description": "Office switches",
  "controls": [
    { "ip": "2cbcbba405a4.shelly.home", "channel": 0, "description": "Desk lamp" },
    { "ip": "2cbcbba405a4.shelly.home", "channel": 1, "description": "Overhead" },
    { "ip": "0.0.0.0", "channel": 0, "description": "Not used" },
    { "ip": "0.0.0.0", "channel": 0, "description": "Not used" }
  ]
}
```

## Button Functions Reference

Each button on your I4 device supports these actions:

| Action | Function |
|--------|----------|
| **Single Press** | Toggle light on/off |
| **Double Press** | Turn on at 100% brightness |
| **Long Press** | Start dimming (alternates between up/down) |
| **Release** | Stop dimming |

## Help and Documentation

- **Full deployment guide**: See [REMOTE-CONTROL-DEPLOYMENT.md](REMOTE-CONTROL-DEPLOYMENT.md)
- **All scripts documentation**: See [README.md](README.md)
- **Command help**: Run `node deploy-remote-control.js --help`
- **Shelly API docs**: https://shelly-api-docs.shelly.cloud/gen2/

## Tips

💡 **Always use --dry-run first** when making changes

💡 **Test on one device** before deploying to all

💡 **Keep backups** of your configuration file

💡 **Use descriptive names** in the description fields - you'll thank yourself later

💡 **Check device logs** if something doesn't work as expected (http://DEVICE_IP → Settings → Scripts → Logs)

