/*
 * Analysis Example
 * Email export
 *
 * Learn how to send an email with data in a .csv file attachment.
 *
 * This analysis will read the variable fuel_level from your device,
 * and send the values in a .csv file to an e-mail address
 *
 * Instructions
 * To run this analysis you need to add a device token and the e-mail to the environment variables.
 * To do that, go to your device, then token and copy your token.
 * Go the the analysis, then environment variables,
 * type device_token on key, and paste your token on value
 * click the + button to add a new environment
 * on key, type email and on value, type the e-mail address
 */

const { Analysis, Device, Services, Utils } = require("@tago-io/sdk");

// The function myAnalysis will run when you execute your analysis
async function myAnalysis(context) {
  // reads the values from the environment and saves it in the variable env_vars
  const env_vars = Utils.envToJson(context.environment);
  if (!env_vars.device_token) {
    return context.log("device_token environment variable not found");
  }

  if (!env_vars.email) {
    return context.log("email environment variable not found");
  }

  const device = new Device({ token: env_vars.device_token });

  // Get the 5 last records of the variable fuel_level in the device bucket.
  const fuel_list = await device.getData({ variable: "fuel_level", qty: 5 });

  // Create csv header
  let csv = "Fuel Level";

  // For each record in the fuel_list, add the value in the csv text.
  // Use \n to break the line.
  for (const item of fuel_list) {
    csv = `${csv},\n${item.value}`;
  }

  // Print the csv text to the Tago analysis console, as a preview
  context.log(csv);

  // Start the email service
  const email = new Services({ token: context.token }).email;

  // Send the email.
  const service_response = await email.send({
    message: "This is an example of a body message",
    subject: "Exported File from TagoIO",
    to: env_vars.email,
    attachment: {
      archive: csv,
      filename: "exported_file.csv",
    },
  });

  context.log(service_response);
}

module.exports = new Analysis(myAnalysis);

// To run analysis on your machine (external)
// module.exports = new Analysis(myAnalysis, { token: "MY-ANALYSIS-TOKEN-HERE" });
