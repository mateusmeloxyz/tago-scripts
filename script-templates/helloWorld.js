/*
 * TagoIO - Analysis Example
 * Hello World
 *
 * Check out the SDK documentation on: https://js.sdk.tago.io
 *
 * Learn how to send messages to the console located on the TagoIO analysis screen.
 * You can use this principle to show any information during and after development.
*/

const { Analysis } = require("@tago-io/sdk");

// The function myAnalysis will run when you execute your analysis
function myAnalysis(context, scope) {
  // This will log "Hello World" at the TagoIO Analysis console
  context.log("Hello World");

  // This will log the context to the TagoIO Analysis console
  context.log("Context:", context);

  // This will log the scope to the TagoIO Analysis console
  context.log("my scope:", scope);
}

module.exports = new Analysis(myAnalysis);

// To run analysis on your machine (external)
// module.exports = new Analysis(myAnalysis, { token: "YOUR-TOKEN" });
