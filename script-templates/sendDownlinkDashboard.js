/*
 ** Analysis Example
 ** Sending downlink using dashboard
 **
 ** Using an Input Widget in the dashboard, you will be able to trigger a downlink to
 ** any LoraWaN network server.
 ** You can get the dashboard template to use here: http://admin.tago.io/template/5f514218d4555600278023c4
 ** IMPORTANT: Your device is required to send an Uplink before any downlink can be send.
 **
 ** Environment Variables
 ** In order to use this analysis, you must setup the Environment Variable table.
 **
 ** account_token: Your account token. Check bellow how to get this.
 ** default_PORT: The default port to be used if not sent by the dashboard.
 ** device_id: The default device id to be used if not sent by the dashboard (OPTIONAL).
 ** payload: The default payload to be used if not sent by the dashboard (OPTIONAL).
 **
 ** Steps to generate an account_token:
 ** 1 - Enter the following link: https://admin.tago.io/account/
 ** 2 - Select your Profile.
 ** 3 - Enter Tokens tab.
 ** 4 - Generate a new Token with Expires Never.
 ** 5 - Press the Copy Button and place at the Environment Variables tab of this analysis.
 */
const { Analysis, Account, Utils } = require("@tago-io/sdk");

async function init(context, scope) {
  // Remove code below if you want to trigger by schedule action and using environment variables.
  if (!scope[0]) {
    return context.log("This analysis must be triggered by a widget.");
  }

  context.log("Downlink analysis started");
  // Get the environment variables.
  const environment = Utils.envToJson(context.environment);
  if (!environment.account_token) {
    return context.log('Missing "account_token" environment variable');
  } else if (environment.account_token.length !== 36) {
    return context.log('Invalid "account_token" in the environment variable');
  }

  // Setup your profile-token from the environment variable
  // IMPORTANT: You must generate the profile token from your profile settings.
  //            Any other token will generate an Authorization Denied error.
  const account = new Account({ token: environment.account_token });

  // Get the variables form_payload and form_port sent by the widget/dashboard.
  let payload = scope.find((x) => x.variable === "form_payload");
  let port = scope.find((x) => x.variable === "form_port");

  // Setup from environment variable if widget hadn't been used to trigger the analysis.
  if (!payload) {
    payload = { value: environment.payload, device: environment.device_id };
  }

  if (!port) {
    port = { value: environment.default_PORT };
  }

  // Error to make sure analysis have the information it needs.
  if (!payload.value || !payload.device) {
    return context.log('Missing "form_payload" in the data scope.');
  } else if (!port || !port.value) {
    return context.log('Missing "form_port" in the data scope o.');
  }

  // All variables that trigger the analysis have the "device" parameter, with the TagoIO Device ID.
  // Otherwise it will get from the environment variable.
  const device_id = payload.device;
  if (!device_id) {
    return context.log("Device key <device> not found in the variables sent by the widget/dashboard.");
  }

  const result = await Utils.sendDownlink(account, device_id, {
    payload: payload.value,
    port: Number(port.value),
    confirmed: false,
  }).catch((error) => error);

  console.log(result);
}

module.exports = new Analysis(init);
