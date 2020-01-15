/* importing required packages and modules */
const chalk = require("chalk");
const SubscribersHelper = require("./subscribers.helpers");
const { parentPort, workerData } = require("worker_threads");

/* fetching the input data passed by the parent process */
const { subscribersSegment, accessToken } = workerData;
console.log(chalk.red.inverse("hereeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"));
const manyChatApi = async (access_token, id) => {
  return await SubscribersHelper.getSubscriberInfoFromManychat(
    access_token,
    id
  );
};
(async () => {
  try {
    for (const id of subscribersSegment) {
      console.log(id, accessToken);
      const subscriberData = await manyChatApi(accessToken, id);
      console.log(chalk.green.bold.inverse("subscribersData"));
      console.log("subscriberData", id);
      if (!subscriberData) {
        console.log("undefined ..........", id);
      } else {
        parentPort.postMessage(subscriberData);
      }
    }
  } catch (error) {
    console.log(error);
  }
})();
