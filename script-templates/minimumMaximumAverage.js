/*
 * Analysis Example
 * Minimum, maximum, and average
 *
 * Get the minimum, maximum, and the average value of the variable temperature from your device,
 * and save these values in new variables
 *
 * Instructions
 * To run this analysis you need to add a device token to the environment variables,
 * To do that, go to your device, then token and copy your token.
 * Go the the analysis, then environment variables,
 * type device_token on key, and paste your token on value
 */

const { Analysis, Device, Utils } = require("@tago-io/sdk");

// The function myAnalysis will run when you execute your analysis
async function myAnalysis(context) {
  // reads the values from the environment and saves it in the variable env_vars
  const env_vars = Utils.envToJson(context.environment);
  if (!env_vars.device_token) {
    return context.log("Device token not found on environment parameters");
  }

  const device = new Device({ token: env_vars.device_token });

  // This is a filter to get the minimum value of the variable temperature in the last day
  const minFilter = {
    variable: "temperature",
    query: "min",
    start_date: "1 day",
  };

  // Now we use the filter for the device to get the data
  // check if the variable min has any value
  // if so, we crete a new object to send to TagoIO
  const [min] = await device.getData(minFilter);
  if (min) {
    const minValue = {
      variable: "temperature_minimum",
      value: min.value,
      unit: "F",
    };

    // Now we send the new object with the minimum value
    await device
      .sendData(minValue)
      .then(context.log("Temperature Minimum Updated"));
  } else {
    context.log("Minimum value not found");
  }

  // This is a filter to get the maximum value of the variable temperature in the last day
  const maxFilter = {
    variable: "temperature",
    query: "max",
    start_date: "1 day",
  };

  const [max] = await device.getData(maxFilter);

  if (max) {
    const maxValue = {
      variable: "temperature_maximum",
      value: max.value,
      unit: "F",
    };

    await device
      .sendData(maxValue)
      .then(context.log("Temperature Maximum Updated"));
  } else {
    context.log("Maximum value not found");
  }

  // This is a filter to get the last 1000 values of the variable temperature in the last day
  const avgFilter = {
    variable: "temperature",
    qty: 1000,
    start_date: "1 day",
  };

  const dataAvgArray = await device.getData(avgFilter);

  if (dataAvgArray.length) {
    let temperatureSum = dataAvgArray.reduce((previousValue, currentValue) => {
      return previousValue + Number(currentValue.value);
    }, 0);

    temperatureSum = temperatureSum / dataAvgArray.length;

    const avgValue = {
      variable: "temperature_average",
      value: temperatureSum,
      unit: "F",
    };

    await device
      .sendData(avgValue)
      .then(context.log("Temperature Average Updated"));
  } else {
    context.log("No result found for the avg calculation");
  }
}

module.exports = new Analysis(myAnalysis);

// To run analysis on your machine (external)
// module.exports = new Analysis(myAnalysis, { token: "YOUR-TOKEN" });
