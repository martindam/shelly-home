/**
 * Remote control of a Shelly Dimmer Gen3 Shelly Pro Dimmer 1PM/2PM
 * short_press = on/off toggle, double_press = on at 100% brightness, long_press = dimming.
 */

// Add here which Device(ip adress) and channel you want to control
// Channel 0 = output 1, channle 1 = output 2.
// Set IP to 0.0.0.0 to disable
let devices = [
    { ip: '2cbcbba405a4.shelly.home',       channel: 1 }, // Store bad spots  
    { ip: '2cbcbba405a4.shelly.home',  channel: 0 },  // Store bad LED
    { ip: '0.0.0.0',       channel: 0 },  
    { ip: '0.0.0.0',       channel: 0 }   
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

        // Always log the received event
        print("Input " + i + ": Received event '" + ev + "' → controlling IP " + ip + " channel " + ch);

        // STOP dimming cycle on button release (btn_up)
        if (dimstate[i] && ev === 'btn_up') {
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
            Shelly.call("http.get", {
                url: 'http://' + ip + '/light/' + ch + '?turn=toggle'
            }, null, null);

        // DOUBLE_PRESS: turn on at 100% brightness
        } else if (ev === 'double_push') {
            print("Input " + i + ": Sending light.set (100% ON) to " + ip + " channel " + ch);
            Shelly.call("http.get", {
                url: 'http://' + ip + '/rpc/light.set?id=' + ch + '&on=true&brightness=100'
            }, null, null);

        // LONG_PRESS: start dimming cycle (down or up)
        } else if (ev === 'long_push') {
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
            // If it’s another event (e.g., btn_down), ignore here
            print("Input " + i + ": Unhandled event '" + ev + "'");
            return true;
        }

    } catch (e) {
        print("Error in event handler: " + e.message);
    }
});