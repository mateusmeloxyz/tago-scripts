/*
 ** Analysis Example
 ** Get Device List
 **
 ** This analysis retrieves the device list of your account and print to the console.
 ** There are examples on how to apply filter.
 **
 ** Environment Variables
 ** In order to use this analysis, you must setup the Environment Variable table.
 **
 ** account_token: Your account token
 **
 ** Steps to generate an account_token:
 ** 1 - Enter the following link: https://admin.tago.io/account/
 ** 2 - Select your Profile.
 ** 3 - Enter Tokens tab.
 ** 4 - Generate a new Token with Expires Never.
 ** 5 - Press the Copy Button and place at the Environment Variables tab of this analysis.
 */

 const { Analysis, Account, Utils } = require("@tago-io/sdk");

 async function listDevicesByTag(context) {
   // Transform all Environment Variable to JSON.
   const envVars = Utils.envToJson(context.environment);
 
   if (!envVars.account_token) {
     return context.log("Missing account_token environment variable");
   }
 
   const account = new Account({ token: envVars.account_token });
 
   // Example of filtering devices by tag.
   // to use this filter, just remove the comment on the line 49
   const filter = {
     tags: [
       {
         key: "key_name", // change by your key name
         value: "key_value", // change by your key value
       },
     ],
     // You also can filter by: name, last_input, last_output, bucket, etc.
   };
 
   // Searching all devices with tag we want
   const devices = await account.devices.list({
     page: 1,
     fields: ["id", "tags"],
     // filter,
     amount: 100,
   });
 
   if (!devices.length) {
     return context.log("Devices not found");
   }
 
   context.log(JSON.stringify(devices));
 }
 
 module.exports = new Analysis(listDevicesByTag);
 
 // To run analysis on your machine (external)
 // module.exports = new Analysis(listDevicesByTag, { token: "YOUR-TOKEN" });
 
 async function listDevicesByTag(context) {
   // Transform all Environment Variable to JSON.
   const envVars = Utils.envToJson(context.environment);
 
   if (!envVars.account_token) {
     return context.log("Missing account_token environment variable");
   }
 
   const account = new Account({ token: envVars.account_token });
 
   // Example of filtering devices by tag.
   // to use this filter, just remove the comment on the line 49
   const filter = {
     tags: [
       {
         key: "key_name", // change by your key name
         value: "key_value", // change by your key value
       },
     ],
     // You also can filter by: name, last_input, last_output, bucket, etc.
   };
 
   // Searching all devices with tag we want
   const devices = await account.devices.list({
     page: 1,
     fields: ["id", "tags"],
     // filter,
     amount: 100,
   });
 
   if (!devices.length) {
     return context.log("Devices not found");
   }
 
   context.log(JSON.stringify(devices));
 }
 
 module.exports = new Analysis(listDevicesByTag);
 
 // To run analysis on your machine (external)
 // module.exports = new Analysis(listDevicesByTag, { token: "YOUR-TOKEN" });
 