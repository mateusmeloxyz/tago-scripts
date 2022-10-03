/*
 ** Analysis Example
 ** Creating devices using dashboard
 **
 ** Using an Input Widget in the dashboard, you will be able to create devices in your account.
 ** You can get the dashboard template to use here: https://admin.tago.io/template/6143555a314cef001871ec78
 ** Use a dummy HTTPs device with the dashboard.
 **
 ** Environment Variables
 ** In order to use this analysis, you must setup the Environment Variable table.
 **   account_token: Your account token. Check bellow how to get this.
 **
 ** Steps to generate an account_token:
 ** 1 - Enter the following link: https://admin.tago.io/account/
 ** 2 - Select your Profile.
 ** 3 - Enter Tokens tab.
 ** 4 - Generate a new Token with Expires Never.
 ** 5 - Press the Copy Button and place at the Environment Variables tab of this analysis.
 */
 const { Analysis, Account, Utils, Device } = require("@tago-io/sdk");

 async function startAnalysis(context, scope) {
   if (!scope[0]) {
     return context.log("The analysis must be triggered by a widget.");
   }
 
   context.log("Creating your device");
   // Get the environment variables.
   const env = Utils.envToJson(context.environment);
   if (!env.account_token) return context.log('Missing "account_token" environment variable');
   else if (env.account_token.length !== 36) return context.log('Invalid "account_token" in the environment variable');
 
   // Instance the Account class
   const account = new Account({ token: env.account_token });
 
   // Get the token of the settings device used in the dashboard, then instance the device class.
   // We will use this to send the Validation (feedback) to the dashboard.
   const dashboard_dev_token = await Utils.getTokenByName(account, scope[0].device);
   const dashboard_device = new Device({ token: dashboard_dev_token });
 
   // Get the variables sent by the widget/dashboard.
   const network_id = scope.find((x) => x.variable === "device_network");
   const connector_id = scope.find((x) => x.variable === "device_connector");
   const device_name = scope.find((x) => x.variable === "device_name");
   const device_eui = scope.find((x) => x.variable === "device_eui");
 
   if (!connector_id || !connector_id.value) {
     return context.log('Missing "device_connector" in the data scope.');
   } else if (!network_id || !network_id.value) {
     return context.log('Missing "device_network" in the data scope.');
   } else if (!device_eui || !device_eui.value) {
     return context.log('Missing "device_eui" in the data scope.');
   }
 
   const result = await account.devices
     .create({
       name: device_name.value,
       // Serie number is the parameter for device eui, sigfox id, etc..
       serie_number: device_eui.value,
       tags: [
         // You can add custom tags here.
         { key: "type", value: "sensor" },
         { key: "device_eui", value: device_eui.value },
       ],
       connector: connector_id.value,
       network: network_id.value,
       active: true,
       type: "immutable",
       chunk_period: "month", //consider change
       chunk_retention: 1, //consider change
     })
     .catch((error) => {
       // Send the validation to the device.
       // That way we create an error in the dashboard for feedback.
       dashboard_device.sendData({ variable: "validation", value: `Error when creating the device ${error}`, metadata: { color: "red" } });
       throw error;
     });
 
   // To add Configuration Parameters to the device:
   account.devices.paramSet(result.device_id, { key: "param_key", value: "10", sent: false });
 
   // To add any data to the device that was just created:
   // const device = new Device({ token: result.token });
   // device.sendData({ variable: 'temperature', value: 17 });
 
   // Send feedback to the dashboard:
   dashboard_device.sendData({ variable: "validation", value: "Device succesfully created!", metadata: { type: "success" } });
   context.log(`Device succesfully created. ID: ${result.device_id}`);
 }
 
 module.exports = new Analysis(startAnalysis);
 
 async function startAnalysis(context, scope) {
   if (!scope[0]) {
     return context.log("The analysis must be triggered by a widget.");
   }
 
   context.log("Creating your device");
   // Get the environment variables.
   const env = Utils.envToJson(context.environment);
   if (!env.account_token) return context.log('Missing "account_token" environment variable');
   else if (env.account_token.length !== 36) return context.log('Invalid "account_token" in the environment variable');
 
   // Instance the Account class
   const account = new Account({ token: env.account_token });
 
   // Get the token of the settings device used in the dashboard, then instance the device class.
   // We will use this to send the Validation (feedback) to the dashboard.
   const dashboard_dev_token = await Utils.getTokenByName(account, scope[0].device);
   const dashboard_device = new Device({ token: dashboard_dev_token });
 
   // Get the variables sent by the widget/dashboard.
   const network_id = scope.find((x) => x.variable === "device_network");
   const connector_id = scope.find((x) => x.variable === "device_connector");
   const device_name = scope.find((x) => x.variable === "device_name");
   const device_eui = scope.find((x) => x.variable === "device_eui");
 
   if (!connector_id || !connector_id.value) {
     return context.log('Missing "device_connector" in the data scope.');
   } else if (!network_id || !network_id.value) {
     return context.log('Missing "device_network" in the data scope.');
   } else if (!device_eui || !device_eui.value) {
     return context.log('Missing "device_eui" in the data scope.');
   }
 
   const result = await account.devices
     .create({
       name: device_name.value,
       // Serie number is the parameter for device eui, sigfox id, etc..
       serie_number: device_eui.value,
       tags: [
         // You can add custom tags here.
         { key: "type", value: "sensor" },
         { key: "device_eui", value: device_eui.value },
       ],
       connector: connector_id.value,
       network: network_id.value,
       active: true,
       type: "immutable",
       chunk_period: "month", //consider change
       chunk_retention: 1, //consider change
     })
     .catch((error) => {
       // Send the validation to the device.
       // That way we create an error in the dashboard for feedback.
       dashboard_device.sendData({ variable: "validation", value: `Error when creating the device ${error}`, metadata: { color: "red" } });
       throw error;
     });
 
   // To add Configuration Parameters to the device:
   account.devices.paramSet(result.device_id, { key: "param_key", value: "10", sent: false });
 
   // To add any data to the device that was just created:
   // const device = new Device({ token: result.token });
   // device.sendData({ variable: 'temperature', value: 17 });
 
   // Send feedback to the dashboard:
   dashboard_device.sendData({ variable: "validation", value: "Device succesfully created!", metadata: { type: "success" } });
   context.log(`Device succesfully created. ID: ${result.device_id}`);
 }
 
 module.exports = new Analysis(startAnalysis);
 