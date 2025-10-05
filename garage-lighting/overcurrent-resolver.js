function resendOnSignal(channel) {
  Shelly.call(
      "Light.Set", 
      {
        id: channel,
        on: true,
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
    )
}

try {
  Shelly.addStatusHandler(function (event, user_data) {
    try {
      print("Event received: ", JSON.stringify(event));

      if (event.component === "light:0" && event.delta && event.delta.hasOwnProperty("overcurrent")) {
        print("Overcurrent detected")
        resendOnSignal(0);
      }
    } catch (err) {
      print("Exception in status handler: " + JSON.stringify(err));
    }
  });
} catch (err) {
  print("Exception while registering status handler: " + JSON.stringify(err));
}