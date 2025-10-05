// Set the IP addresses and channels for the secondary dimmers (device B, C, etc.)
let secondaryDimmers = [
    { ip: "localhost", channel: 1 },
    { ip: "b08184f21e18.shelly.home", channel: 0 },
    { ip: "b08184f23508.shelly.home", channel: 0 }
  ];
  
  // Function to update a secondary dimmer using RPC
  function updateSecondaryDimmer(ip, channel, state, brightness) {
    if (ip == "localhost") {
      Shelly.call(
        "Light.Set", 
        {
          id: channel,
          on: state === "on" ? true : false,
          brightness: brightness
        },
        function (response, error_code, error_message) {
          try {
            if (error_code === 0) {
              print("Successfully updated local secondary dimmer on channel: " + channel);
            } else {
              print("Error updating local secondary dimmer on channel: " + channel + " - " + error_message);
            }
          } catch (err) {
            print("Exception in Light.Set call: " + JSON.stringify(err));
          }
        },
      );
      return
    }
    
    try {
      let url = "http://" + ip + "/rpc/light.set?id=" + channel + "&on=" + (state === "on" ? "true" : "false") + "&brightness=" + brightness;
  
      print("Attempting to update secondary dimmer at: " + url);
  
      Shelly.call(
        "http.get",
        { url: url },
        function (response, error_code, error_message) {
          try {
            if (error_code === 0) {
              print("Successfully updated secondary dimmer at IP: " + ip + " on channel: " + channel);
            } else {
              print("Error updating secondary dimmer at IP: " + ip + " on channel: " + channel + " - " + error_message);
            }
          } catch (err) {
            print("Exception in RPC response handler: " + JSON.stringify(err));
          }
        }
      );
    } catch (err) {
      print("Exception while preparing or sending RPC call: " + JSON.stringify(err));
    }
  }
  
  // Update all secondary dimmers
  function updateAllSecondaryDimmers(state, brightness) {
    try {
      for (let i = 0; i < secondaryDimmers.length; i++) {
        let dimmer = secondaryDimmers[i];
        updateSecondaryDimmer(dimmer.ip, dimmer.channel, state, brightness);
      }
    } catch (err) {
      print("Exception in updateAllSecondaryDimmers: " + JSON.stringify(err));
    }
  }
  
  // Monitor changes in the on/off status and brightness of the primary dimmer (channel 0)
  try {
    Shelly.addStatusHandler(function (event, user_data) {
      try {
        if (event.component === "light:0" && event.delta) {
          let state = event.delta.output ? "on" : "off";
          let brightness = event.delta.brightness !== undefined ? event.delta.brightness : 0;
  
          if (event.delta.hasOwnProperty("output") || event.delta.hasOwnProperty("brightness")) {
            print("Primary dimmer state changed - State: " + state + ", Brightness: " + brightness);
            updateAllSecondaryDimmers(state, brightness);
          }
        }
      } catch (err) {
        print("Exception in status handler: " + JSON.stringify(err));
      }
    });
  } catch (err) {
    print("Exception while registering status handler: " + JSON.stringify(err));
  }