/**
 * Shelly I4 Input Forwarder
 * Forwards all input events from this secondary I4 to a primary I4 device
 * 
 * This script should be installed on the secondary I4 device.
 * Any input event (single_push, double_push, long_push, btn_up, btn_down) 
 * will be forwarded to the corresponding input on the primary I4.
 */

// Configuration
let primary_i4_ip = '192.168.1.206';

// Optional: Map secondary inputs to different primary inputs
// If not specified, input 0->0, 1->1, 2->2, 3->3
let input_mapping = {
    0: 0,  // Secondary input 0 -> Primary input 0
    1: 1,  // Secondary input 1 -> Primary input 1  
    2: 2,  // Secondary input 2 -> Primary input 2
    3: 3   // Secondary input 3 -> Primary input 3
};

// Optional: Filter which events to forward (comment out events you don't want to forward)
let forward_events = [
    'single_push',
    'double_push', 
    'long_push',
    'toggle'
];

/**
 * Forward an input event to the primary I4 device
 * @param {number} input_id - The input ID on this secondary device
 * @param {string} event_type - The type of event (single_push, etc.)
 * @param {boolean} state - The input state (true/false)
 */
function forwardInputEvent(input_id, event_type, state) {
    // Check if this event type should be forwarded
    let should_forward = false;
    for (let i = 0; i < forward_events.length; i++) {
        if (forward_events[i] === event_type) {
            should_forward = true;
            break;
        }
    }
    
    if (!should_forward) {
        print("Input " + input_id + ": Event '" + event_type + "' not in forward list, skipping");
        return;
    }
    
    // Get the mapped input ID on the primary device
    let primary_input_id = input_mapping[input_id];
    if (primary_input_id === undefined) {
        print("Input " + input_id + ": No mapping defined for this input, skipping");
        return;
    }
    
    print("Input " + input_id + ": Forwarding '" + event_type + "' (state: " + state + ") to primary I4 input " + primary_input_id);
    
    // For I4 devices, we need to trigger the input event on the primary device
    // This is done by calling the Input.Trigger method on the primary device
    let rpc_method = "Input.Trigger";
    
    // Build the RPC URL
    let rpc_url = "http://" + primary_i4_ip + "/rpc/" + rpc_method + 
                  "?id=" + primary_input_id + "&event_type=" + event_type;
    
    print("Sending RPC call: " + rpc_url);
    
    Shelly.call(
        "HTTP.GET",
        {
            url: rpc_url
        },
        function(result, error_code, error_message) {
            if (error_code === 0) {
                print("Successfully forwarded input " + input_id + " event to primary I4");
            } else {
                print("Failed to forward input " + input_id + " event. Error code: " + error_code + ", Message: " + error_message);
            }
        }
    );
}

/**
 * Handle input events from this secondary I4 device
 */
Shelly.addEventHandler(function (event) {
    try {
        // Check if this is an input event
        if (typeof event.info.event === 'undefined') {
            return true;
        }
        
        // Only handle input events (not other component events)
        if (event.component !== 'input:' + event.info.id) {
            return true;
        }
        
        let input_id = event.info.id;
        let event_type = event.info.event;
        let state = event.info.state;
        
        print("Secondary I4 Input " + input_id + ": Received event '" + event_type + "' with state " + state);
        
        // Forward the event to the primary I4
        forwardInputEvent(input_id, event_type, state);
        
    } catch (e) {
        print("Error in input forwarder event handler: " + e.message);
    }
});

// Initialize the script
print("Shelly I4 Input Forwarder initialized");
print("Primary I4 IP: " + primary_i4_ip);
print("Input mapping: " + JSON.stringify(input_mapping));
print("Forwarding events: " + JSON.stringify(forward_events));
print("Ready to forward input events to primary I4 device");
