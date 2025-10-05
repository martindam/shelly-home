/**
 * Motion Sensor Relay for Shelly I4 Plus
 * 
 * This script runs on a Shelly I4 Plus device and relays motion sensor
 * input events to a Shelly Pro Dimmer 2PM running the outdoor-light.js script.
 * 
 * The motion sensor should be connected to one of the I4 Plus inputs.
 * When motion is detected, this script will trigger a script evaluation on the
 * target dimmer device to handle the motion event.
 */

// Configuration
let TARGET_DIMMER_IP = "2cbcbba1fefc.shelly.home";  // IP address of the Shelly Pro Dimmer 2PM
let TARGET_SCRIPT_ID = 1;  // Script ID of outdoor-light.js on the dimmer
let MOTION_SENSOR_INPUT = 0;  // Input channel where motion sensor is connected

/**
 * Trigger motion event on the target dimmer
 */
function triggerMotionOnDimmer() {
    let url = "http://" + TARGET_DIMMER_IP + "/rpc/Script.Eval";
    
    // Build the RPC request to call handleMotionSensor() on the target script
    let rpcRequest = {
        "id": TARGET_SCRIPT_ID,
        "code": "handleMotionSensor()"
    };
    
    print("Motion detected - triggering motion handler on dimmer at " + TARGET_DIMMER_IP);
    
    Shelly.call(
        "HTTP.POST",
        {
            url: url,
            content_type: "application/json",
            body: JSON.stringify(rpcRequest)
        },
        function(result, error_code, error_message) {
            if (error_code === 0) {
                print("Successfully triggered motion event on dimmer");
            } else {
                print("Failed to trigger motion event. Error code: " + error_code + ", Message: " + error_message);
            }
        }
    );
}

/**
 * Event handler for motion sensor input
 */
Shelly.addEventHandler(function(event) {
    try {
        // Check if this is an input event
        if (typeof event.info === 'undefined' || typeof event.info.event === 'undefined') {
            return true;
        }
        
        // Only handle events from the motion sensor input
        if (event.info.id !== MOTION_SENSOR_INPUT) {
            return true;
        }
        
        let eventType = event.info.event;
        let state = event.info.state;
        
        print("Motion sensor input " + MOTION_SENSOR_INPUT + " triggered: event=" + eventType + ", state=" + state);
        
        // Trigger on motion detected (state becomes true or single_push/toggle events)
        if (state === true || eventType === 'single_push' || eventType === 'toggle') {
            triggerMotionOnDimmer();
        }
        
    } catch (e) {
        print("Error in motion sensor relay event handler: " + e.message);
    }
});

// Initialize script
print("Motion Sensor Relay script initialized");
print("Target dimmer IP: " + TARGET_DIMMER_IP);
print("Target script ID: " + TARGET_SCRIPT_ID);
print("Motion sensor input: " + MOTION_SENSOR_INPUT);
print("Ready to relay motion events to dimmer");
