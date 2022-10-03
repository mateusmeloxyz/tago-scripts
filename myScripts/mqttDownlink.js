/*
 ** Analysis Example
 ** Get Device List
 **
 * Snippet to push data to MQTT. Follow this pattern within your application
 * If you want more details about MQTT, search "MQTT" in TagoIO help center.
 * You can find plenty of documentation about this topic.
 * TagoIO Team.
 **
 ** How to use?
 ** In order to trigger this analysis you must setup a Dashboard.
 ** Create a Widget "Form" and enter the variable 'push_payload'
 ** for the device you want to push with the MQTT.
 ** In User Control, select this Analysis in the Analysis Option.
 ** Save and use the form.
 */

const { Analysis, Services } = require("@tago-io/sdk");

async function mqttPushExample(context, scope) {
  if (!scope.length) {
    return context.log("This analysis must be triggered by a dashboard.");
  }

  const myData = scope.find((x) => x.variable === "push_payload") || scope[0];
  if (!myData) {
    return context.log("Couldn't find any variable in the scope.");
  }

  // Create your data object to push to MQTT
  // In this case we're sending a JSON object.
  // You can send anything you want.
  // Example:
  // const myDataObject = 'This is a string';
  const myDataObject = {
    device: "F80332010002B39D",
    port: "16",
    command: "00060100",
    confirmed: false,
    class_c: false,
  };

  // Create a object with the options you chooses
  const options = {
    retain: false,
    qos: 0,
  };

  // Publishing to MQTT
  const MQTT = new Services({ token: context.token }).MQTT;
  MQTT.publish({
    bucket: myData.bucket,
    message: JSON.stringify(myDataObject),
    topic: "itg200/F80332029D3A0000/downlink",
    options,
  }).then(context.log, context.log);
}

module.exports = new Analysis(mqttPushExample);

// To run analysis on your machine (external)
// module.exports = new Analysis(mqttPushExample, { token: "YOUR-TOKEN" });
