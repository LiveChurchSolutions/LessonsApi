const { createServer, proxy } = require('aws-serverless-express');
const { init } = require('./dist/App');
const { Pool } = require('./dist/apiBase/pool');
const { TranscodeHelper } = require('./dist/helpers/TranscodeHelper');
const { Environment } = require('./dist/helpers/Environment');

Environment.init(process.env.APP_ENV);
Pool.initPool();

const universal = function universal(event, context) {
  init().then(app => {
    const server = createServer(app);
    return proxy(server, event, context);
  });

}


const videoPingback = async (event, context) => {
  console.log(JSON.stringify(event));
  await TranscodeHelper.handlePingback(event);
}

module.exports.universal = universal;
module.exports.videoPingback = videoPingback;