/**
 * Remote control of Shelly devices (Dimmers and Switches)
 * Supports: Shelly Dimmer Gen3, Shelly Pro Dimmer 1PM/2PM, Shelly Mini Gen 3, etc.
 * 
 * For dimmers:
 *   - short_press = on/off toggle
 *   - double_press = on at 100% brightness
 *   - long_press = dimming up/down (alternating)
 * 
 * For switches:
 *   - short_press = on/off toggle
 *   - double_press = turn on
 *   - long_press = ignored
 */

// Add here which Device(ip adress), channel, and type you want to control
// Channel 0 = output 1, channle 1 = output 2.
// Type: 'dimmer' for dimmers (uses Light commands), 'switch' for non-dimmers (uses Switch commands)
// Set IP to 0.0.0.0 to disable
let devices = [
    { ip: '2cbcbba405a4.shelly.home',       channel: 1, type: 'dimmer' }, // Store bad spots  
    { ip: '2cbcbba405a4.shelly.home',       channel: 0, type: 'dimmer' }, // Store bad LED
    { ip: '0.0.0.0',                        channel: 0, type: 'dimmer' },  
    { ip: '0.0.0.0',                        channel: 0, type: 'dimmer' }   
];

// State arrays
let dimstate = [ false, false, false, false ];
let up       = [ false, false, false, false ];

// Handle button input events
Shelly.addEventHandler(function (event) {
    try {
        if (typeof event.info.event === 'undefined') {
            return true;
        }

        let i   = event.info.id;    // input ID (0–3)
        let ev  = event.info.event; // event name
        let dev = devices[i];       // device configuration for this input

        // If there is no device configured or IP is '0.0.0.0', do nothing
        if (!dev || !dev.ip || dev.ip === '0.0.0.0') {
            print("Input " + i + ": No device configured or IP=0.0.0.0 → nothing done");
            return true;
        }

        let ip = dev.ip;
        let ch = dev.channel;
        let type = dev.type || 'dimmer'; // default to dimmer for backward compatibility

        // Always log the received event
        print("Input " + i + ": Received event '" + ev + "' → controlling " + type + " at IP " + ip + " channel " + ch);

        // STOP dimming cycle on button release (btn_up) - only for dimmers
        if (dimstate[i] && ev === 'btn_up' && type === 'dimmer') {
            dimstate[i] = false;
            print("Input " + i + ": Stopping dim cycle (DimStop) on " + ip + " channel " + ch);
            Shelly.call("http.get", {
                url: 'http://' + ip + '/rpc/Light.DimStop?id=' + ch
            }, null, null);
            return true;
        }

        // SINGLE_PRESS: toggle on/off
        if (ev === 'single_push') {
            print("Input " + i + ": Sending toggle command to " + ip + " channel " + ch);
            if (type === 'dimmer') {
                Shelly.call("http.get", {
                    url: 'http://' + ip + '/light/' + ch + '?turn=toggle'
                }, null, null);
            } else {
                // For switches, use Switch.Toggle RPC method
                Shelly.call("http.get", {
                    url: 'http://' + ip + '/rpc/Switch.Toggle?id=' + ch
                }, null, null);
            }

        // DOUBLE_PRESS: turn on at 100% brightness (dimmer) or just turn on (switch)
        } else if (ev === 'double_push') {
            if (type === 'dimmer') {
                print("Input " + i + ": Sending light.set (100% ON) to " + ip + " channel " + ch);
                Shelly.call("http.get", {
                    url: 'http://' + ip + '/rpc/light.set?id=' + ch + '&on=true&brightness=100'
                }, null, null);
            } else {
                // For switches, just turn on
                print("Input " + i + ": Sending Switch.Set (ON) to " + ip + " channel " + ch);
                Shelly.call("http.get", {
                    url: 'http://' + ip + '/rpc/Switch.Set?id=' + ch + '&on=true'
                }, null, null);
            }

        // LONG_PRESS: start dimming cycle (down or up) - only for dimmers
        } else if (ev === 'long_push') {
            if (type === 'dimmer') {
                dimstate[i] = true;
                up[i] = !up[i];  // flip direction each time a long press happens

                if (up[i]) {
                    print("Input " + i + ": Starting DimUp on " + ip + " channel " + ch);
                    Shelly.call("http.get", {
                        url: 'http://' + ip + '/rpc/Light.DimUp?id=' + ch
                    }, null, null);
                } else {
                    print("Input " + i + ": Starting DimDown on " + ip + " channel " + ch);
                    Shelly.call("http.get", {
                        url: 'http://' + ip + '/rpc/Light.DimDown?id=' + ch
                    }, null, null);
                }
            } else {
                // For switches, long press does nothing (or could toggle as alternative)
                print("Input " + i + ": Long press ignored for switch type");
            }

        } else {
            // If it’s another event (e.g., btn_down), ignore here
            print("Input " + i + ": Unhandled event '" + ev + "'");
            return true;
        }

    } catch (e) {
        print("Error in event handler: " + e.message);
    }
});