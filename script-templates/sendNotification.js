const { Analysis, Services, Utils } = require("@tago-io/sdk");

/**
 * The main function used by Tago to run the script.
 * It sends a notification to the account and another one linked to a dashboard.
 * Optional: You can set a dashboard_id using an environment variable
 * this will show a button on the notification to send the user directly to the dashboard
 */
async function sendNotification(context) {
  // reads the values from the environment variables and saves it in the variable env_vars
  const env_var = Utils.envToJson(context.environment);

  const notification = new Services({ token: context.token }).Notification;

  // In this variable, you type the title of the notification
  const title = 'Your title';

  // In this variable, you type the message that you will send on the notification
  const message = 'Your message';

  try {
    const service_response = await notification.send({
      message,
      title,
      ref_id: env_var.dashboard_id || undefined,
    });

    context.log(service_response);
  } catch (error) {
    context.log(error);
  }
}

module.exports = new Analysis(sendNotification);

// To run analysis on your machine (external)
// module.exports = new Analysis(sendNotification, { token: "YOUR-TOKEN" });
