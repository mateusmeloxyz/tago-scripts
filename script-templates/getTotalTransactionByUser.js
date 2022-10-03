/*
 ** Analysis Example
 ** Get users total transactions
 **
 ** This analysis must run by an Scheduled Action.
 ** It gets a total amount of transactions by device, calculating by the total amount of data in the bucket
 ** each time the analysis run. Group the result by a tag.
 **
 ** Environment Variables
 ** In order to use this analysis, you must setup the Environment Variable table.
 **
 ** device_token: Token of a device where the total transactions will be stored. Get this in the Device's page.
 ** account_token: Your account token. Check bellow how to get this.
 **
 ** Steps to generate an account_token:
 ** 1 - Enter the following link: https://admin.tago.io/account/
 ** 2 - Select your Profile.
 ** 3 - Enter Tokens tab.
 ** 4 - Generate a new Token with Expires Never.
 ** 5 - Press the Copy Button and place at the Environment Variables tab of this analysis.
 */

 const { Analysis, Account, Utils, Device } = require("@tago-io/sdk");
 const _ = require("lodash");
 
 async function calculateUserTransactions(
   account,
   storage,
   user_value,
   device_list
 ) {
   // Collect the data amount for each device.
   // Result of bucket_results is:
   // [0, 120, 500, 0, 1000]
   const bucket_results = await Promise.all(
     device_list.map((device) => account.buckets.amount(device.bucket))
   );
   const total_transactions = _.sum(bucket_results);
 
   // Get the total transactions of the last analysis run.
   // Group is used to get only for this user.
   // You can change that to get a specific device for the user, instead of using a global storage device.
   // One way to do that is by just finding the device using a tag, see example:
   //
   // const [user_device] = await account.devices.list({ page: 1, fields: ['id', 'name', 'bucket', 'tags'], filter: { tags: [{ key: 'user_device', value: user_value }] }, amount: 1 });
   // const device_token = await Utils.getTokenByName(account, user_device.id);
   // const storage = new Device({ token: device_token });
   let [last_total_transactions] = await storage.getData({
     variable: "last_transactions",
     qty: 1,
     group: user_value,
   });
   if (!last_total_transactions) {
     last_total_transactions = { value: 0 };
   }
 
   const result = total_transactions - last_total_transactions.value;
 
   // Store the current total of transactions, the result for this analysis run and the key.
   // Now you can just plot these variables in a dynamic table.
   await storage.sendData([
     {
       variable: "last_transactions",
       value: total_transactions,
       group: user_value,
     },
     { variable: "transactions_result", value: result, group: user_value },
     { variable: "user", value: user_value, group: user_value },
   ]);
 }
 
 async function myAnalysis(context) {
   // Transform all Environment Variable to JSON.
   const environment = Utils.envToJson(context.environment);
   if (!environment.account_token) {
     return context.log(
       "You must setup an account_token in the Environment Variables."
     );
   } else if (!environment.device_token) {
     return context.log(
       "You must setup an device_token in the Environment Variables."
     );
   }
   // Instance the account class
   const account = new Account({ token: environment.account_token });
   const storage = new Device({ token: environment.device_token });
 
   // Setup the tag we will be searching in the device list
   const tag_to_search = "user_email";
 
   // Get the device_list and group it by the tag value.
   // Result of grouped_device_list is:
   // [
   //   { value: 'test@tago.io', device_list: [ [Object], [Object] ] },
   //   { value: 'user@tago.io', device_list: [ [Object] ] }
   // ]
   const device_list = await account.devices.list({
     page: 1,
     fields: ["id", "name", "bucket", "tags"],
     filter: { tags: [{ key: tag_to_search }] },
     amount: 10000,
   });
   const grouped_device_list = _.chain(device_list)
     .groupBy(
       (collection) => collection.tags.find((x) => x.key === tag_to_search).value
     )
     .map((value, key) => ({ value: key, device_list: value }))
     .value();
 
   // Call a new function for each group in assynchronous way.
   await Promise.all(
     grouped_device_list.map((group) =>
       calculateUserTransactions(
         account,
         storage,
         group.value.replace(/ /g, ""),
         group.device_list
       )
     )
   );
 }
 
 module.exports = new Analysis(myAnalysis);
 
 // To run analysis on your machine (external)
 // module.exports = new Analysis(myAnalysis, { token: "YOUR-TOKEN" });
 