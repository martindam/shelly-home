/**
 * Outdoor Light Control for Shelly Pro Dimmer 2 PM
 * 
 * Requirements:
 * - Should be on at 6am and until 30 min after sunrise. If sunrise is after 6:30am, it should not turn on that morning
 * - Evening: Should be on between 30 min before sunset and 11pm
 * - If motion sensor is triggered and it is between sunset and sunrise, the light should be on for 15 minutes
 * 
 * Output Channel: 1 (id: 1 in the API)
 */

// Configuration
let OUTPUT_CHANNEL = 1;
let MOTION_SENSOR_INPUT = 0;  // Input channel for motion sensor
let MOTION_LIGHT_DURATION = 15 * 60 * 1000;  // 15 minutes in milliseconds
let SENSOR_ACTIVE_AFTER = 23 * 60 // 23:00
let SENSOR_ACTIVE_BEFORE = 6 * 60 // 06:00

// State variables
let motionTimer = null;
let timeWindowActive = false;
let sunriseMinute = null; // Sunrise time in minutes of today. May equal the sunrise time of yesterday

// Schedule trigger constants
let TRIGGER_MORNING_ON = "MORNING_ON";
let TRIGGER_MORNING_OFF = "MORNING_OFF";
let TRIGGER_EVENING_ON = "EVENING_ON";
let TRIGGER_EVENING_OFF = "EVENING_OFF";
let TRIGGER_CAPTURE_SUNRISE = "CAPTURE_SUNRISE";

/**
 * Control the light
 */
function setLight(state, brightness) {
    let params = {
        id: OUTPUT_CHANNEL,
        on: state
    };
    
    if (brightness !== undefined) {
        params.brightness = brightness;
    }
    
    Shelly.call(
        "Light.Set",
        params,
        function(result, error_code, error_message) {
            if (error_code === 0) {
                print("Light " + (state ? "turned ON" : "turned OFF") + " successfully");
            } else {
                print("Failed to control light. Error: " + error_code + " - " + error_message);
            }
        }
    );
}

/**
 * Clear motion timer
 */
function clearMotionTimer() {
    if (motionTimer !== null) {
        Timer.clear(motionTimer);
        motionTimer = null;
        print("Motion timer cleared");
    }
}

/**
 * Handle motion sensor event
 */
function handleMotionSensor() {
    let now = new Date();
    let nowInMinutesOfDay = now.getHours()*60 + now.getMinutes()
    let active = nowInMinutesOfDay >= SENSOR_ACTIVE_AFTER || nowInMinutesOfDay <= SENSOR_ACTIVE_BEFORE
    if (!active) {
        print("Motion detected outside active time window, ignoring");
        return;
    }
    
    print("Motion detected - turning on light for 15 minutes");
    setLight(true, 100);
    
    // Clear any existing timer and set a new one
    clearMotionTimer();
    motionTimer = Timer.set(MOTION_LIGHT_DURATION, false, function() {
        print("Motion timer expired - turning off light");
        setLight(false);
        motionTimer = null;
    });
}

/**
 * Create a schedule
 */
function createSchedule(scheduleId, timespec, trigger, description) {
    print("Creating schedule " + scheduleId + ": " + description + " (" + timespec + ")");
    
    Shelly.call(
        "Schedule.Create",
        {
            enable: true,
            timespec: timespec,
            calls: [{
                "method": "Script.Eval",
                "params": { 
                    id: Shelly.getCurrentScriptId(), 
                    code: "scheduleCallback(\"" + trigger + "\")"
                }
            }]
        },
        function(result, error_code, error_message) {
            if (error_code === 0) {
                print("Schedule " + result.id + " created successfully: " + description);
            } else {
                print("Failed to create schedule " + scheduleId + ". Error: " + error_code + " - " + error_message);
            }
        }
    );
}

/**
 * Delete existing schedule if it exists
 */
function deleteSchedule(scheduleId, callback) {
    Shelly.call(
        "Schedule.Delete",
        { id: scheduleId },
        function(result, error_code, error_message) {
            if (error_code === 0 || error_code === -103) {
                // Success or schedule doesn't exist - both are fine
                if (callback) callback();
            } else {
                print("Warning: Could not delete schedule " + scheduleId + ": " + error_message);
                if (callback) callback();
            }
        }
    );
}

/**
 * Check if we should turn on the morning light at 6am
 */
function shouldTurnOnMorningLight(callback) {
    if (sunriseMinute === null) {
        print("Sunrise time not captured yet, fallback to turn on light");
        callback(true);
        return;
    }
    
    let now = new Date();
    let nowInMinutesOfDay = now.getHours()*60 + now.getMinutes()
    if (nowInMinutesOfDay < sunriseMinute + 30) { 
        print("Morning light: Sunrise is at " + sunriseMinute + " minutes of today, turning light ON");
        callback(true);
    } else {
        print("Morning light: Sunrise is at " + sunriseMinute + " minutes of today, skipping morning light");
        callback(false);
    }
}

/**
 * Schedule callback handler
 */
function scheduleCallback(trigger) {
    print("Schedule triggered: " + trigger);
    
    if (trigger === TRIGGER_MORNING_ON) {
        // Morning on 6am schedule.
        shouldTurnOnMorningLight(function(shouldTurnOn) {
            if (shouldTurnOn) {
                print("Morning 6am schedule: Sunrise is after 5:30am, turning light ON");
                timeWindowActive = true;
                clearMotionTimer();
                setLight(true, 100);
            } else {
                timeWindowActive = false;
                print("Morning 6am schedule: Sunrise is before 5:30am, skipping morning light");
            }
        });
        
    } else if (trigger === TRIGGER_CAPTURE_SUNRISE) {
        // Capture sunrise time
        print("Capturing sunrise time");
        let now = new Date();
        sunriseMinute = now.getHours()*60 + now.getMinutes();
        print("Sunrise time captured: " + sunriseMinute);

    } else if (trigger === TRIGGER_MORNING_OFF) {
        // Morning: Turn off light (30 min after sunrise)
        print("Morning schedule: Turning light OFF");
        timeWindowActive = false;
        clearMotionTimer();
        setLight(false);
        
    } else if (trigger === TRIGGER_EVENING_ON) {
        // Evening: Turn on light (30 min before sunset)
        print("Evening schedule: Turning light ON");
        timeWindowActive = true;
        clearMotionTimer();
        setLight(true, 100);
        
    } else if (trigger === TRIGGER_EVENING_OFF) {
        // Evening: Turn off light (11pm)
        print("Evening schedule: Turning light OFF");
        timeWindowActive = false;
        clearMotionTimer();
        setLight(false);
    }
}

/**
 * Setup all schedules - chain them to avoid "too many calls in progress" error
 */
function setupSchedules() {
    print("Setting up outdoor light schedules...");
    
    deleteSchedule(1, function() {
        createSchedule(1, "0 0 6 * * *", TRIGGER_MORNING_ON, "Morning ON at 6am");
        
        // Chain the next schedule after a delay
        Timer.set(100, false, function() {
            deleteSchedule(2, function() {
                createSchedule(2, "@sunrise", TRIGGER_CAPTURE_SUNRISE, "Capture sunrise time");
                
                Timer.set(100, false, function() {
                    deleteSchedule(3, function() {
                        createSchedule(3, "@sunrise+30m", TRIGGER_MORNING_OFF, "Morning OFF (30min after sunrise)");
                        
                        Timer.set(100, false, function() {
                            deleteSchedule(4, function() {
                                createSchedule(4, "@sunset-30m", TRIGGER_EVENING_ON, "Evening ON (30min before sunset)");
                                
                                Timer.set(100, false, function() {
                                    deleteSchedule(5, function() {
                                        createSchedule(5, "0 0 23 * * *", TRIGGER_EVENING_OFF, "Evening OFF (11pm)");
                                        print("All schedules setup complete");
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}

/**
 * Event handler for motion sensor
 * NOTE: Motion sensor is on a separate Shelly I4 Plus device running motion-sensor-relay.js
 * That script will call handleMotionSensor() via RPC when motion is detected.
 * The event handler below is commented out but kept for reference.
 */
/*
Shelly.addEventHandler(function(event) {
    try {
        // Check for input events
        if (typeof event.info === 'undefined' || typeof event.info.event === 'undefined') {
            return true;
        }
        
        // Handle motion sensor input
        if (event.info.id === MOTION_SENSOR_INPUT) {
            let eventType = event.info.event;
            let state = event.info.state;
            
            print("Motion sensor input " + MOTION_SENSOR_INPUT + " triggered: event=" + eventType + ", state=" + state);
            
            // Trigger on single_push or when state becomes true (motion detected)
            if (eventType === 'single_push' || (eventType === 'toggle' && state === true)) {
                handleMotionSensor();
            }
        }
        
    } catch (e) {
        print("Error in event handler: " + e.message);
    }
});
*/

// Initialize script
print("Outdoor Light Control script initialized");
print("Output channel: " + OUTPUT_CHANNEL);
print("Motion sensor input handled by separate I4 Plus device (motion-sensor-relay.js)");
print("Motion light duration: " + (MOTION_LIGHT_DURATION / 60000) + " minutes");

setupSchedules();