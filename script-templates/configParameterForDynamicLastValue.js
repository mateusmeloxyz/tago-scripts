/*
 ** Analysis Example
 ** Configuration parameters for dynamic last value
 **
 ** Set the configurations parameters with the last value of a given variable, 
 ** in this example it is the "temperature" variable
 **
 ** Environment Variables
 ** In order to use this analysis, you must setup the Environment Variable table.
 **
 ** account_token: Your account token. Check bellow how to get this.
 **
 ** Steps to generate an account_token:
 ** 1 - Enter the following link: https://admin.tago.io/account/
 ** 2 - Select your Profile.
 ** 3 - Enter Tokens tab.
 ** 4 - Generate a new Token with Expires Never.
 ** 5 - Press the Copy Button and place at the Environment Variables tab of this analysis.
*/
const { Account, Utils, Analysis } = require('@tago-io/sdk');
const { queue } = require('async');
const moment = require('moment-timezone');

// set the timezone to show up on dashboard. TagoIO may handle ISOString automatically in a future update.
let timezone = 'America/New_York';

const getParam = (params, key) => params.find(x => x.key === key) || { key, value: '-', sent: false };
async function applyDeviceCalculation({ id: deviceID, name, account }) {
  const deviceInfoText = `${name}(${deviceID}`;
  console.info(`Processing Device ${deviceInfoText})`);
  const device = await Utils.getDevice(account, deviceID);

   // Get the temperature variable inside the device bucket.
   // notice it will get the last record at the time the analysis is running.
  const dataResult = await device.getData({ variables: ['temperature'], query: 'last_value' });
  if (!dataResult.length) {
    console.error(`No data found for ${deviceInfoText}`);
    return;
  }

   // Get configuration params list of the device
  const deviceParams = await account.devices.paramList(deviceID);

   // get the variable temperature from our dataResult array
  const temperature = dataResult.find(data => data.variable === 'temperature');
  if (temperature) {
      // get the config. parameter with key temperature
    const temperatureParam = getParam(deviceParams, 'temperature');
      // get the config. parameter with key last_record_time
    const lastRecordParam = getParam(deviceParams, 'last_record_time');

    const timeString = moment(temperature.time).tz(timezone).format('YYYY/MM/DD HH:mm A');

     // creates or edit the tempreature Param with the value of temperature.
     // creates or edit the last_record_time Param with the time of temperature.
     // Make sure to cast the value to STRING, otherwise you'll get an error.
    await account.devices.paramSet(deviceID, [
       { ...temperatureParam, value: String(temperature.value) },
       { ...lastRecordParam, value: timeString },
    ]);
  }
}

   // scope is not used for Schedule action.
async function startAnalysis(context, scope) {
  const environment = Utils.envToJson(context.environment);
  if (!environment) {
    return;
  }

  if (!environment.account_token) {
    throw 'Missing account_token environment var';
  }
   // Make sure you have account_token tag in the environment variable of the analysis.
  const account = new Account({ token: environment.account_token });

  // get timezone from the account
  ({ timezone } = await account.info());

   // Create a queue, so we don't run on Throughput errors.
   // The queue will make sure we check only 5 devices simultaneously.
  const processQueue = queue(applyDeviceCalculation, 5);

   // fetch device list filtered by tags.
   // Device list always return an Array with DeviceInfo object.
  const deviceList = await account.devices.list({
    amount: 500,
    fields: ['id', 'name', 'tags'],
    filter: {
      tags: [{ key: 'type', value: 'sensor' }],
    },
  });

  deviceList.forEach(device => processQueue.push({ ...device, account }));

   // Wait for all queue to be processed
  await processQueue.drain();
}

module.exports = new Analysis(startAnalysis);