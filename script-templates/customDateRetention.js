/*
 * Analysis Example
 * Custom Data Retention
 *
 * Use your account token to get the list of devices, then go to each device removing the
 * variables you chooses.
 *
 * Instructions
 * To run this analysis you need to add an account token to the environment variables,
 * To do that, go to your account settings, then token and copy your token.
 * Go the the analysis, then environment variables,
 * type account_token on key, and paste your token on value
 */

const { Analysis, Account, Device, Utils } = require("@tago-io/sdk");
const dayjs = require('dayjs');

// The function myAnalysis will run when you execute your analysis
async function myAnalysis(context) {
  // reads the values from the environment and saves it in the variable env_vars
  const env_vars = Utils.envToJson(context.environment);

  if (!env_vars.account_token) {
    throw context.log("Missing account_token in the environment variables");
  }

  const account = new Account({ token: env_vars.account_token });

  // Bellow is an empty filter.
  // Examples of filter:
  // { tags: [{ key: 'tag-key', value: 'tag-value' }]}
  // { name: 'name*' }
  // { name: '*name' }
  // { bucket: 'bucket-id' }
  const filter = {};

  const devices = await account.devices.list({
    page: 1,
    fields: ["id"],
    filter,
    amount: 100,
  });

  for (const deviceObj of devices) {
    const token = await Utils.getTokenByName(account, deviceObj.id);
    const device = new Device({ token });

    const variables = ["variable1", "variable2"];
    const qty = 100; // remove 100 registers of each variable
    const end_date = dayjs().subtract(1, "month").toISOString(); // registers old than 1 month

    await device
      .deleteData({ variables, qty, end_date })
      .then(context.log)
      .catch(context.log);
  }
}

module.exports = new Analysis(myAnalysis);

// To run analysis on your machine (external)
// module.exports = new Analysis(myAnalysis, { token: "YOUR-TOKEN" });
