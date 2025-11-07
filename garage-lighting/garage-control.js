/**
 * Garage control for Shelly PlusI4
 * - Manual on/off with single_push events from respective inputs
 * - If manually turned on, light will stay on indefinitely
 * - When turned on by sensor, stays on for 5 min
 * - When turned manually off, sensor is disabled for 2 min
 * - Long press off, disables sensor indefinitely
 * - Long press on, enables sensor indefinitely
**/

// Configuration
let primary_light_ip = '2cbcbba51064.shelly.home'
let primary_light_channel = 0

// Input channels
let sensor_input_channel = 2
let manual_on_channel = 1
let manual_off_channel = 3

// State variables
let sensor_active = true
let manual_override = false
let auto_off_timer = null
let sensor_disable_timer = null

// Timer durations (in milliseconds)
let AUTO_OFF_DURATION = 5 * 60 * 1000  // 5 minutes
let SENSOR_DISABLE_DURATION = 2 * 60 * 1000  // 2 minutes

/**
 * Control the primary light using Shelly.Call
 * @param {boolean} state - true to turn on, false to turn off
 */
function controlLight(state) {
    Shelly.call(
        "HTTP.GET",
        {
            url: "http://" + primary_light_ip + "/rpc/Light.Set?id=" + primary_light_channel + "&on=" + state
        },
        function(result, error_code, error_message) {
            if (error_code === 0) {
                print("Light " + (state ? "turned ON" : "turned OFF") + " successfully");
            } else {
                print("Failed to control light. Error code: " + error_code + ", Message: " + error_message);
            }
        }
    );
}

/**
 * Clear existing auto-off timer
 */
function clearAutoOffTimer() {
    if (auto_off_timer !== null) {
        Timer.clear(auto_off_timer);
        auto_off_timer = null;
        print("Auto-off timer cleared");
    }
}

/**
 * Set auto-off timer for 5 minutes
 */
function setAutoOffTimer() {
    clearAutoOffTimer();
    auto_off_timer = Timer.set(AUTO_OFF_DURATION, false, function() {
        if (!manual_override && sensor_active) {
            print("Auto-turning off light after 5 minutes");
            controlLight(false);
        }
        auto_off_timer = null;
    });
    print("Auto-off timer set for 5 minutes");
}

/**
 * Clear sensor disable timer
 */
function clearSensorDisableTimer() {
    if (sensor_disable_timer !== null) {
        Timer.clear(sensor_disable_timer);
        sensor_disable_timer = null;
        print("Sensor disable timer cleared");
    }
}

/**
 * Disable sensor for 2 minutes
 */
function disableSensorTemporarily() {
    sensor_active = false;
    clearSensorDisableTimer();
    sensor_disable_timer = Timer.set(SENSOR_DISABLE_DURATION, false, function() {
        sensor_active = true;
        print("Sensor re-enabled after 2 minutes");
        sensor_disable_timer = null;
    });
    print("Sensor disabled for 2 minutes");
}

/**
 * Handle motion sensor events
 */
function handleMotionSensor(toggleState) {
    if (!sensor_active) {
        print("Motion sensor ignored - sensor is disabled");
        return;
    }

    if (toggleState === true) {
        // Motion detected
        print("Motion detected - turning on light");
        controlLight(true);
        clearAutoOffTimer();
    } else {
        // Motion ended
        print("Motion ended - setting 5-minute auto-off timer");
        if (!manual_override) {
            setAutoOffTimer();
        }
    }
}

/**
 * Handle manual on button
 */
function handleManualOn(event) {
    if (event === 'single_push') {
        print("Manual ON - setting override mode");
        manual_override = true;
        clearAutoOffTimer();
        controlLight(true);
    } else if (event === 'long_push') {
        print("Long press ON - enabling sensor");
        sensor_active = true;
        manual_override = false;
        clearSensorDisableTimer();
    }
}

/**
 * Handle manual off button
 */
function handleManualOff(event) {
    if (event === 'single_push') {
        print("Manual OFF - disabling sensor for 2 minutes");
        manual_override = false;
        controlLight(false);
        clearAutoOffTimer();
        disableSensorTemporarily();
    } else if (event === 'long_push') {
        print("Long press OFF - disabling sensor indefinitely");
        sensor_active = false;
        manual_override = false;
        controlLight(false);
        clearAutoOffTimer();
        clearSensorDisableTimer();
    }
}

// Main event handler
Shelly.addEventHandler(function (event) {
    try {
        print("Event received: ", JSON.stringify(event));
        
        if (typeof event.info.event === 'undefined') {
            return true;
        }

        let inputId = event.info.id;
        let eventType = event.info.event;
        let toggleState = event.info.state;

        // Handle motion sensor (input 2)
        if (inputId === sensor_input_channel) {
            handleMotionSensor(toggleState);
        }
        // Handle manual on button (input 1)
        else if (inputId === manual_on_channel) {
            handleManualOn(eventType);
        }
        // Handle manual off button (input 3)
        else if (inputId === manual_off_channel) {
            handleManualOff(eventType);
        }
        else {
            print("Input " + inputId + ": Unhandled event '" + eventType + "'");
            return true;
        }

        print("Input " + inputId + ": Event: " + eventType + ", State: " + toggleState + ", Sensor Active: " + sensor_active + ", Manual Override: " + manual_override);

    } catch (e) {
        print("Error in event handler: " + e.message);
    }
});

// Initialize state on startup
print("Garage control script initialized");
print("Sensor active: " + sensor_active + ", Manual override: " + manual_override);