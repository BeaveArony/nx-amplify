/*
  this file will loop through all js modules which are uploaded to the lambda resource,
  provided that the file names (without extension) are included in the "MODULES" env variable.
  "MODULES" is a comma-delimmited string.
*/

exports.handler = (event, context, callback) => {
  const modules = process.env.MODULES.split(',');
  console.log('CustomMessage trigger handler called ', {
    event: JSON.stringify(event, null, 2),
    context,
    callback,
    modules,
  });
  for (let i = 0; i < modules.length; i += 1) {
    const { handler } = require(`./${modules[i]}`);
    handler(event, context, callback);
  }
};
