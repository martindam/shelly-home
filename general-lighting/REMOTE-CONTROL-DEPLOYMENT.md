# Remote Control Deployment System

This deployment system allows you to manage and deploy the `remote-control.js` script to multiple Shelly I4 Plus devices from a central configuration file.

## Overview

Instead of manually editing and uploading the script to each I4 device, you can:
1. Define all your devices and their button mappings in `remote-control-config.json`
2. Run the deployment script to automatically push customized scripts to all devices
3. Update the central config and redeploy when you need to make changes

## Files

- **`remote-control.js`** - The base script template
- **`remote-control-config.json`** - Central configuration file defining all I4 devices and their button mappings
- **`deploy-remote-control.js`** - Node.js deployment script that pushes customized scripts to devices

## Setup

### Prerequisites

- Node.js installed on your computer (version 12 or higher)
- Network access to your Shelly devices
- Shelly I4 Plus devices on your network

### Initial Configuration

1. Edit `remote-control-config.json` to define your devices:

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
        { "ip": "0.0.0.0", "channel": 0, "description": "Disabled" },
        { "ip": "0.0.0.0", "channel": 0, "description": "Disabled" }
      ]
    }
  ],
  "scriptId": 1,
  "scriptName": "remote-control"
}
```

**Configuration Fields:**

- **`name`**: Friendly name for the I4 device (for your reference)
- **`ip`**: IP address or mDNS hostname of the I4 device
- **`description`**: Description of the device location/purpose
- **`controls`**: Array of 4 objects (one per input button) defining what each button controls:
  - **`ip`**: IP address or mDNS hostname of the dimmer to control (use `0.0.0.0` to disable)
  - **`channel`**: Channel number on the dimmer (0 = Output 1, 1 = Output 2)
  - **`description`**: What this button controls (for documentation)
- **`scriptId`**: Script ID to use on the device (usually 1)
- **`scriptName`**: Name for the script on the device

## Usage

### Dry Run (Preview)

Before deploying, you can preview what would be deployed:

```bash
node deploy-remote-control.js --dry-run
```

This will show:
- Which devices would be updated
- The configuration for each device
- A preview of the generated script

### Deploy to All Devices

Deploy to all configured devices:

```bash
node deploy-remote-control.js
```

### Deploy to Specific Device

Deploy to only one device:

```bash
node deploy-remote-control.js --device 192.168.1.100
```

### Help

Show usage information:

```bash
node deploy-remote-control.js --help
```

## How It Works

1. **Configuration Loading**: The script reads `remote-control-config.json`
2. **Script Generation**: For each device, it generates a customized version of `remote-control.js` with the device-specific button mappings
3. **Device Connection**: Connects to each Shelly I4 device via HTTP RPC API
4. **Script Deployment**: 
   - Checks if script already exists
   - Stops running script if necessary
   - Updates or creates the script
   - Starts the script automatically
5. **Verification**: Reports success or failure for each device

## Example Workflow

### Adding a New I4 Device

1. Install the physical I4 device and connect it to your network
2. Find its IP address (check your router or Shelly app)
3. Add it to `remote-control-config.json`:

```json
{
  "name": "Bedroom I4",
  "ip": "192.168.1.105",
  "description": "Bedroom wall switches",
  "controls": [
    { "ip": "bedroom-dimmer.shelly.home", "channel": 0, "description": "Ceiling light" },
    { "ip": "bedroom-dimmer.shelly.home", "channel": 1, "description": "Reading lamp" },
    { "ip": "0.0.0.0", "channel": 0, "description": "Unused" },
    { "ip": "0.0.0.0", "channel": 0, "description": "Unused" }
  ]
}
```

4. Deploy to just that device:
```bash
node deploy-remote-control.js --device 192.168.1.105
```

### Updating Button Mappings

1. Edit the `controls` array in `remote-control-config.json` for the device you want to change
2. Run deployment (optionally with `--dry-run` first to preview)
3. The script will automatically update the device

### Updating All Devices

If you make changes to the base `remote-control.js` script:

1. Edit `remote-control.js` with your improvements
2. Run deployment to push to all devices:
```bash
node deploy-remote-control.js
```

## Troubleshooting

### Device Unreachable

**Error**: `Device unreachable: connect ETIMEDOUT`

**Solutions**:
- Verify the IP address is correct
- Check that the device is powered on and connected to the network
- Try pinging the device: `ping 192.168.1.100`
- Ensure your computer is on the same network

### Script Deployment Failed

**Error**: `Deployment failed: ...`

**Solutions**:
- Check the device logs in the Shelly web interface
- Verify the device has enough memory for scripts
- Try deploying to just that device with `--device` flag
- Check if the device firmware is up to date

### Wrong Configuration Applied

If a device has the wrong button mappings:

1. Verify the configuration in `remote-control-config.json`
2. Run with `--dry-run` to preview what would be deployed
3. Check that you're deploying to the correct IP address
4. Redeploy to that specific device

### Script Not Starting

If the script deploys but doesn't start:

1. Check the device web interface (Settings → Scripts)
2. Look at the script logs for errors
3. Verify the dimmer IP addresses in the configuration are correct
4. Try manually starting the script from the web interface

## Advanced Usage

### Custom Script ID

By default, scripts use ID 1. If you need a different ID (e.g., if you have multiple scripts):

1. Change `scriptId` in `remote-control-config.json`
2. Redeploy

### Using mDNS Hostnames

Instead of IP addresses, you can use mDNS hostnames:

```json
{
  "ip": "a0dd6c9f5b18.shelly.home",
  "controls": [
    { "ip": "2cbcbba405a4.shelly.home", "channel": 0, "description": "..." }
  ]
}
```

The hostname format is: `[last-12-chars-of-mac].shelly.home`

### Backup Configuration

Before making major changes, backup your configuration:

```bash
cp remote-control-config.json remote-control-config.backup.json
```

## Button Functions Reminder

Each button on the I4 device supports:

- **Single Press**: Toggle light on/off
- **Double Press**: Turn on at 100% brightness
- **Long Press**: Start dimming (alternates between dim up/down)
- **Release**: Stop dimming

## API Reference

The deployment script uses the Shelly Gen2 RPC API:

- `Shelly.GetDeviceInfo` - Get device information
- `Script.List` - List all scripts on device
- `Script.Create` - Create a new script
- `Script.PutCode` - Upload script code
- `Script.SetConfig` - Configure script settings
- `Script.Start` - Start a script
- `Script.Stop` - Stop a script

For more information: [Shelly RPC API Documentation](https://shelly-api-docs.shelly.cloud/gen2/)

## Tips

1. **Use descriptive names**: The `description` fields help you remember what each button does
2. **Start with dry-run**: Always preview with `--dry-run` before deploying
3. **Deploy incrementally**: Use `--device` to test on one device before deploying to all
4. **Keep backups**: Save backup copies of your configuration file
5. **Document changes**: Add comments in the config file to track changes
6. **Test after deployment**: Press each button to verify correct operation

## Integration with Other Scripts

This deployment system is specifically for `remote-control.js`. For other scripts in this repository:

- **`garage-control.js`**: Manual installation (usually only one instance)
- **`outdoor-light.js`**: Manual installation (device-specific schedules)
- **`input-forwarder.js`**: Could benefit from similar deployment system
- **`leader-follower-sync.js`**: Manual installation (device-specific followers)

If you have multiple instances of other scripts, you could create similar deployment systems following this pattern.

