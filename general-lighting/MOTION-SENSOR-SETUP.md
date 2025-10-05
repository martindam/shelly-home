# Motion Sensor Relay Setup

This guide explains how to set up the motion sensor relay between a Shelly I4 Plus device and a Shelly Pro Dimmer 2PM for the outdoor light control system.

## Architecture

```
┌─────────────────────┐           ┌──────────────────────┐
│  Shelly I4 Plus     │           │ Shelly Pro Dimmer    │
│                     │  HTTP/RPC │      2PM             │
│  Motion Sensor ────►│──────────►│                      │
│  (Input 0)          │           │  Outdoor Light       │
│                     │           │  (Channel 1)         │
│  motion-sensor-     │           │  outdoor-light.js    │
│  relay.js           │           │                      │
└─────────────────────┘           └──────────────────────┘
```

## Setup Instructions

### 1. Configure the Shelly Pro Dimmer 2PM

1. Upload `outdoor-light.js` to the Shelly Pro Dimmer 2PM
2. Note the **Script ID** (usually 1 if it's the first script)
3. Note the **IP address** of the dimmer (e.g., `192.168.1.100` or `hostname.shelly.home`)
4. The script will handle:
   - Morning schedule (6am to sunrise+30)
   - Evening schedule (sunset-30 to 11pm)
   - Motion-triggered lighting (called remotely from I4 Plus)

### 2. Configure the Shelly I4 Plus

1. Open `motion-sensor-relay.js` and update the configuration:
   ```javascript
   let TARGET_DIMMER_IP = "192.168.1.100";  // IP of your Shelly Pro Dimmer 2PM
   let TARGET_SCRIPT_ID = 1;                // Script ID from step 1.2
   let MOTION_SENSOR_INPUT = 0;             // Input where motion sensor is connected
   ```

2. Upload `motion-sensor-relay.js` to the Shelly I4 Plus

3. Connect your motion sensor to the configured input (default: Input 0)

### 3. Configure Motion Sensor Input

On the Shelly I4 Plus device:
1. Go to **Settings → Inputs**
2. Select the input where the motion sensor is connected (e.g., Input 0)
3. Configure the input type based on your motion sensor:
   - **Button**: If using a PIR sensor with momentary output
   - **Switch**: If using a sensor with toggle output
4. Enable the input

### 4. Test the Setup

1. **Test Motion Detection**:
   - Trigger the motion sensor
   - Check the I4 Plus logs: Should see "Motion detected - triggering motion handler on dimmer"
   - Check the Dimmer logs: Should see "Motion detected - turning on light for 15 minutes"
   - Light should turn on for 15 minutes

2. **Test Time Window**:
   - Motion sensor only triggers light between 23:00 and 06:00
   - Outside this window, motion is ignored

3. **Test Schedules**:
   - Morning: Light should turn on at 6am (if sunrise is before 6:30am)
   - Morning: Light should turn off at sunrise+30
   - Evening: Light should turn on at sunset-30
   - Evening: Light should turn off at 11pm

## Configuration Variables

### outdoor-light.js (on Dimmer)
```javascript
let OUTPUT_CHANNEL = 1;                      // Dimmer output channel
let MOTION_SENSOR_INPUT = 0;                 // Not used (kept for reference)
let MOTION_LIGHT_DURATION = 15 * 60 * 1000; // 15 minutes
let SENSOR_ACTIVE_AFTER = 23 * 60;          // 23:00 (11pm)
let SENSOR_ACTIVE_BEFORE = 6 * 60;          // 06:00 (6am)
```

### motion-sensor-relay.js (on I4 Plus)
```javascript
let TARGET_DIMMER_IP = "192.168.1.100";  // Dimmer IP address
let TARGET_SCRIPT_ID = 1;                 // Script ID on dimmer
let MOTION_SENSOR_INPUT = 0;              // Input channel for motion sensor
```

## Troubleshooting

### Motion sensor not triggering light

1. **Check I4 Plus logs**:
   - Should see: "Motion sensor input 0 triggered: event=..."
   - Should see: "Motion detected - triggering motion handler on dimmer"

2. **Check network connectivity**:
   - Verify I4 Plus can reach the dimmer IP
   - Try pinging the dimmer from another device

3. **Check dimmer logs**:
   - Should see: "Motion detected - turning on light for 15 minutes"
   - Or: "Motion detected outside active time window, ignoring" (if outside 23:00-06:00)

4. **Verify configuration**:
   - Check `TARGET_DIMMER_IP` matches the dimmer's actual IP
   - Check `TARGET_SCRIPT_ID` matches the script ID on the dimmer
   - Check `MOTION_SENSOR_INPUT` matches where sensor is connected

### "Failed to trigger motion event" error

- **Error code -114**: Connection timeout - check IP address and network
- **Error code -103**: Script not found - check `TARGET_SCRIPT_ID`
- **Error code -104**: Method not found - ensure `outdoor-light.js` is running

### Light doesn't turn off after 15 minutes

- Check if another motion event is resetting the timer
- Check dimmer logs for "Motion timer expired - turning off light"
- Verify `MOTION_LIGHT_DURATION` is set correctly

## Advanced Configuration

### Using Hostname Instead of IP

You can use the Shelly hostname instead of IP address:
```javascript
let TARGET_DIMMER_IP = "shellyproem2-a1b2c3.shelly.home";
```

### Multiple Motion Sensors

To use multiple motion sensors on different I4 Plus inputs, modify the event handler:
```javascript
// In motion-sensor-relay.js
let MOTION_SENSOR_INPUTS = [0, 1, 2];  // Multiple inputs

// In event handler:
if (MOTION_SENSOR_INPUTS.indexOf(event.info.id) !== -1) {
    // Handle motion
}
```

### Different Time Windows per Sensor

Modify `handleMotionSensor()` in `outdoor-light.js` to accept parameters:
```javascript
function handleMotionSensor(activeAfter, activeBefore) {
    activeAfter = activeAfter || SENSOR_ACTIVE_AFTER;
    activeBefore = activeBefore || SENSOR_ACTIVE_BEFORE;
    // ... rest of logic
}
```

Then call with custom times from the relay script.
