# Shelly Device Scripts

This repository contains a collection of JavaScript scripts for controlling Shelly smart home devices. The scripts are organized into three main categories with an automated deployment system for easy management.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Garage Lighting Control](#garage-lighting-control)
- [Outdoor Lighting Control](#outdoor-lighting-control)
- [General Lighting Control](#general-lighting-control)
- [Installation](#installation)
- [Configuration](#configuration)

---

## Overview

These scripts leverage Shelly's scripting capabilities to create advanced automation and control scenarios. Each script is designed to run on specific Shelly devices and communicate with other devices via RPC (Remote Procedure Call) over HTTP.

The repository includes an **automated deployment system** for general lighting control, allowing you to manage multiple Shelly I4 Plus devices from a single configuration file.

## Project Structure

```
shelly/
├── garage-lighting/          # Garage lighting automation
│   ├── garage-control.js           # Main control logic (I4 Plus)
│   ├── leader-follower-sync.js     # Dimmer synchronization
│   ├── input-forwarder.js          # Secondary I4 input forwarding
│   └── overcurrent-resolver.js     # Overcurrent protection handler
│
├── outdoor-lighting/         # Outdoor lighting automation
│   ├── outdoor-light.js            # Time-based & motion control
│   └── motion-sensor-relay.js      # Motion sensor interface
│
├── general-lighting/         # General lighting + deployment system
│   ├── remote-control.js                  # Base remote control script
│   ├── deploy-remote-control.js           # Automated deployment tool
│   ├── remote-control-config.json         # Central device configuration
│   ├── remote-control-config.template.json # Configuration template
│   ├── deploy.sh                          # Shell deployment wrapper
│   ├── package.json                       # Node.js dependencies
│   │
│   └── Documentation/
│       ├── START-HERE.md                  # Entry point for new users
│       ├── QUICKSTART.md                  # 5-minute setup guide
│       ├── DEPLOYMENT-README.md           # Quick reference
│       ├── DEPLOYMENT-SUMMARY.md          # Command reference
│       ├── DEPLOYMENT-SYSTEM-OVERVIEW.md  # Complete system overview
│       ├── REMOTE-CONTROL-DEPLOYMENT.md   # Full documentation
│       └── INSTALLATION-COMPLETE.md       # Post-installation guide
│
└── README.md                 # This file
```

### Supported Devices

- **Shelly Plus I4** / **Shelly I4 Plus**: 4-input devices for buttons and sensors
- **Shelly Pro Dimmer 1PM/2PM**: Dimmable light controllers with power monitoring
- **Shelly Dimmer Gen3**: Next-generation dimmer controllers

---

## Garage Lighting Control

The garage lighting system provides intelligent motion-activated lighting with manual override capabilities. It consists of four interconnected scripts that work together to create a robust lighting control system.

### Components

#### 1. `garage-control.js`
**Device:** Shelly Plus I4 (Primary Controller)

The main control logic for the garage lighting system. Manages motion sensor inputs and manual control buttons.

**Features:**
- **Motion-activated lighting**: Automatically turns on lights when motion is detected
- **Auto-off timer**: Lights turn off 5 minutes after motion ends (when in sensor mode)
- **Manual override**: Manual on keeps lights on indefinitely until manually turned off
- **Temporary sensor disable**: When manually turned off, sensor is disabled for 2 minutes
- **Long press controls**:
  - Long press ON: Enables sensor indefinitely
  - Long press OFF: Disables sensor indefinitely

**Input Configuration:**
- Input 0: *(unused)*
- Input 1: Manual ON button
- Input 2: Motion sensor
- Input 3: Manual OFF button

**Configuration Variables:**
```javascript
let primary_light_ip = 'a0dd6c9f5b18.shelly.home'
let primary_light_channel = 0
let AUTO_OFF_DURATION = 5 * 60 * 1000  // 5 minutes
let SENSOR_DISABLE_DURATION = 2 * 60 * 1000  // 2 minutes
```

#### 2. `leader-follower-sync.js`
**Device:** Shelly Pro Dimmer (Primary Light)

Synchronizes the primary dimmer's state and brightness to multiple secondary dimmers, ensuring all lights in the garage stay in sync.

**Features:**
- Monitors primary dimmer (channel 0) for state and brightness changes
- Automatically updates all secondary dimmers to match
- Supports both local (same device) and remote (network) secondary dimmers
- Handles errors gracefully with detailed logging

**Configuration:**
```javascript
let secondaryDimmers = [
    { ip: "localhost", channel: 1 },  // Local channel 1
    { ip: "b08184f21e18.shelly.home", channel: 0 },
    { ip: "b08184f23508.shelly.home", channel: 0 }
];
```

#### 3. `input-forwarder.js`
**Device:** Shelly I4 Plus (Secondary Input Device)

Forwards input events from a secondary I4 device to the primary I4 controller, allowing multiple physical button locations to control the same system.

**Features:**
- Forwards all input events (single_push, double_push, long_push, toggle)
- Configurable input mapping (map secondary inputs to different primary inputs)
- Event filtering (choose which event types to forward)
- Detailed logging for troubleshooting

**Configuration:**
```javascript
let primary_i4_ip = '192.168.1.206';

let input_mapping = {
    0: 0,  // Secondary input 0 -> Primary input 0
    1: 1,  // Secondary input 1 -> Primary input 1  
    2: 2,  // Secondary input 2 -> Primary input 2
    3: 3   // Secondary input 3 -> Primary input 3
};

let forward_events = [
    'single_push',
    'double_push', 
    'long_push',
    'toggle'
];
```

#### 4. `overcurrent-resolver.js`
**Device:** Shelly Pro Dimmer (Any Dimmer with Overcurrent Protection)

Automatically handles overcurrent conditions by immediately resending the "on" command when an overcurrent event is detected. This helps resolve transient overcurrent issues that can occur with certain LED loads.

**Features:**
- Monitors for overcurrent events on light channel 0
- Automatically attempts to turn the light back on
- Useful for LED loads that have high inrush current

---

## Outdoor Lighting Control

The outdoor lighting system provides time-based and motion-activated control for outdoor lights, with schedules based on sunrise/sunset times.

### Components

#### 1. `outdoor-light.js`
**Device:** Shelly Pro Dimmer 2PM

Main controller for outdoor lighting with sophisticated scheduling and motion detection.

**Features:**
- **Morning schedule**: 
  - Turns on at 6:00 AM
  - Turns off 30 minutes after sunrise
  - Skips morning activation if sunrise is before 5:30 AM
- **Evening schedule**:
  - Turns on 30 minutes before sunset
  - Turns off at 11:00 PM
- **Motion-activated lighting**:
  - Active between 11:00 PM and 6:00 AM
  - Turns on at 100% brightness for 15 minutes when motion detected
  - Automatically turns off after timer expires

**Configuration:**
```javascript
let OUTPUT_CHANNEL = 1;  // Output channel for the light
let MOTION_LIGHT_DURATION = 15 * 60 * 1000;  // 15 minutes
let SENSOR_ACTIVE_AFTER = 23 * 60;  // 23:00
let SENSOR_ACTIVE_BEFORE = 6 * 60;  // 06:00
```

**Schedules Created:**
1. Morning ON at 6:00 AM
2. Capture sunrise time (for decision logic)
3. Morning OFF (30 min after sunrise)
4. Evening ON (30 min before sunset)
5. Evening OFF at 11:00 PM

#### 2. `motion-sensor-relay.js`
**Device:** Shelly I4 Plus (Motion Sensor Interface)

Relays motion sensor events from an I4 Plus device to the Pro Dimmer running `outdoor-light.js`. This separation allows the motion sensor to be physically located away from the dimmer.

**Features:**
- Monitors motion sensor input
- Triggers motion handler on target dimmer via RPC
- Supports single_push, toggle, and state change events
- Detailed logging for debugging

**Configuration:**
```javascript
let TARGET_DIMMER_IP = "2cbcbba1fefc.shelly.home";
let TARGET_SCRIPT_ID = 1;  // Script ID of outdoor-light.js
let MOTION_SENSOR_INPUT = 0;  // Input channel for motion sensor
```

---

## General Lighting Control

The general lighting system provides flexible remote control of Shelly dimmers via I4 Plus button controllers, with an **automated deployment system** for managing multiple devices.

### Components

#### 1. `remote-control.js`
**Device:** Shelly I4 Plus (Button Controller)

A flexible script for controlling Shelly dimmers from button inputs. Each of the four inputs can control a different dimmer device and channel.

**Features:**
- **Single press**: Toggle light on/off
- **Double press**: Turn on at 100% brightness
- **Long press**: Start dimming cycle (alternates between dim up and dim down)
- **Button release**: Stop dimming
- Independent control of up to 4 different lights
- Configurable device and channel mapping

**Configuration:**
```javascript
let devices = [
    { ip: '2cbcbba405a4.shelly.home', channel: 1 },
    { ip: '2cbcbba405a4.shelly.home', channel: 0 },
    { ip: '0.0.0.0', channel: 0 },  // Disabled
    { ip: '0.0.0.0', channel: 0 }   // Disabled
];
```

**Usage:**
- Set IP to `0.0.0.0` to disable an input
- Each input can control a different device and channel
- Channel 0 = Output 1, Channel 1 = Output 2

#### 2. Automated Deployment System

Instead of manually configuring each I4 device, the deployment system allows you to:
- Define all devices in a single `remote-control-config.json` file
- Deploy to multiple devices with one command
- Update configurations and redeploy easily

**Quick Start:**
```bash
cd general-lighting

# 1. Edit configuration
nano remote-control-config.json

# 2. Preview deployment (safe, no changes)
node deploy-remote-control.js --dry-run

# 3. Deploy to all devices
node deploy-remote-control.js

# Or deploy to specific device
node deploy-remote-control.js --device 192.168.1.100
```

**Configuration Example:**
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

**Documentation:**
- **[START-HERE.md](general-lighting/START-HERE.md)** - Entry point for new users
- **[QUICKSTART.md](general-lighting/QUICKSTART.md)** - 5-minute setup guide
- **[DEPLOYMENT-README.md](general-lighting/DEPLOYMENT-README.md)** - Quick reference
- **[DEPLOYMENT-SYSTEM-OVERVIEW.md](general-lighting/DEPLOYMENT-SYSTEM-OVERVIEW.md)** - Complete overview
- **[REMOTE-CONTROL-DEPLOYMENT.md](general-lighting/REMOTE-CONTROL-DEPLOYMENT.md)** - Full documentation

---

## Installation

### General Steps (Manual Installation)

1. **Access Shelly Web Interface**: Navigate to your Shelly device's IP address in a web browser
2. **Open Scripts Section**: Go to Settings → Scripts
3. **Create New Script**: Click "Add Script" or "Library" → "Create Script"
4. **Copy Script Content**: Paste the appropriate script from this repository
5. **Configure**: Update the configuration variables at the top of the script (IP addresses, channels, etc.)
6. **Save and Start**: Save the script and click "Start" to activate it

### Device-Specific Installation

#### Garage Lighting System

1. **Primary I4 Controller**: Install `garage-control.js`
2. **Primary Dimmer**: Install `leader-follower-sync.js`
3. **All Dimmers**: Install `overcurrent-resolver.js` on all dimmers
4. **Secondary I4 (if used)**: Install `input-forwarder.js`
5. Update all IP addresses and channel numbers to match your setup

#### Outdoor Lighting System

1. **Pro Dimmer 2PM**: Install `outdoor-light.js` (note the script ID, usually 1)
2. **I4 Plus (Motion Sensor)**: Install `motion-sensor-relay.js`
3. Update `TARGET_DIMMER_IP` and `TARGET_SCRIPT_ID` in `motion-sensor-relay.js`
4. Configure your location in the Shelly device settings for accurate sunrise/sunset times

#### General Lighting Control

**Option 1: Automated Deployment (Recommended)**

Use the deployment system to manage multiple I4 Plus devices from a central configuration:

```bash
cd general-lighting

# 1. Edit configuration
nano remote-control-config.json

# 2. Preview deployment
node deploy-remote-control.js --dry-run

# 3. Deploy to all devices
node deploy-remote-control.js
```

**Benefits:**
- ✅ Manage all devices from one configuration file
- ✅ Deploy to multiple devices with one command
- ✅ Easy updates and redeployment
- ✅ Preview changes before applying

See **[general-lighting/START-HERE.md](general-lighting/START-HERE.md)** for detailed instructions.

**Option 2: Manual Installation (Single device)**

1. **I4 Plus (Button Controller)**: Install `remote-control.js`
2. Configure the `devices` array with your dimmer IP addresses and channels
3. Save and start the script

---

## Configuration

### Finding Device IP Addresses

Shelly devices can be accessed by:
- **IP Address**: e.g., `192.168.1.206`
- **mDNS Hostname**: e.g., `a0dd6c9f5b18.shelly.home` (last 12 characters of MAC address)

To find your device's address:
1. Check your router's DHCP client list
2. Use the Shelly mobile app
3. Use a network scanner tool

### Channel Numbers

- Most Shelly dimmers have channels starting at 0
- Channel 0 = Output 1
- Channel 1 = Output 2 (on dual-channel devices)

### Input Numbers

- Shelly I4/Plus I4 devices have 4 inputs numbered 0-3
- Check your physical wiring to determine which input corresponds to which button/sensor

### Testing

After installation:
1. Check the device logs (Settings → Scripts → Your Script → Logs)
2. Test each input/button to verify correct operation
3. Monitor the logs for any error messages
4. Adjust timing values if needed (e.g., auto-off duration, motion timer)

---

## Troubleshooting

### Common Issues

**Lights don't respond to commands:**
- Verify IP addresses are correct
- Check that target devices are online
- Review script logs for error messages

**Motion sensor not working:**
- Verify the motion sensor is wired to the correct input
- Check that the relay script has the correct target IP and script ID
- Ensure the motion sensor is within its active time window

**Schedules not triggering:**
- Verify the device location is set correctly (for sunrise/sunset)
- Check that schedules were created successfully in the logs
- Ensure the device has internet access for time synchronization

**Secondary lights not syncing:**
- Verify secondary dimmer IP addresses
- Check network connectivity between devices
- Review logs for RPC call failures

### Debug Logging

All scripts include extensive `print()` statements. To view logs:
1. Go to device web interface
2. Navigate to Settings → Scripts
3. Click on your script
4. View the "Logs" section

---

## Deployment System Features

The automated deployment system in `general-lighting/` provides:

### Key Features

✅ **Centralized Configuration** - Define all devices in one JSON file  
✅ **Dry Run Mode** - Preview changes before applying  
✅ **Selective Deployment** - Deploy to one device or all at once  
✅ **Auto-Discovery** - Finds and updates existing scripts automatically  
✅ **Error Handling** - Clear error messages and validation  
✅ **Documentation** - Comprehensive guides for all skill levels

### Common Commands

```bash
cd general-lighting

# Preview deployment (safe, no changes)
node deploy-remote-control.js --dry-run

# Deploy to all devices
node deploy-remote-control.js

# Deploy to specific device
node deploy-remote-control.js --device 192.168.1.100

# Show help
node deploy-remote-control.js --help
```

### Requirements

- Node.js (v12 or higher)
- Network access to Shelly devices
- Shelly Gen2 devices (I4 Plus, Pro Dimmer, Dimmer Gen3)

### Getting Started with Deployment

1. **New Users**: Start with [general-lighting/START-HERE.md](general-lighting/START-HERE.md)
2. **Quick Setup**: Follow [general-lighting/QUICKSTART.md](general-lighting/QUICKSTART.md)
3. **Reference**: Use [general-lighting/DEPLOYMENT-README.md](general-lighting/DEPLOYMENT-README.md)
4. **Deep Dive**: Read [general-lighting/DEPLOYMENT-SYSTEM-OVERVIEW.md](general-lighting/DEPLOYMENT-SYSTEM-OVERVIEW.md)

---

## Additional Resources

- [Shelly Scripting Documentation](https://shelly-api-docs.shelly.cloud/gen2/Scripts/Tutorial)
- [Shelly RPC API Reference](https://shelly-api-docs.shelly.cloud/gen2/ComponentsAndServices/Light)
- [Shelly Community Forum](https://community.shelly.cloud/)

---

## License

These scripts are provided as-is for personal use. Modify and adapt them to suit your specific needs.

## Contributing

Feel free to fork this repository and submit pull requests with improvements or additional features.
