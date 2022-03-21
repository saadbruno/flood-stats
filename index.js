const Flood = require('flood-api').default
const config = require('./config.json');

async function main() {

  console.log('starting main');

  const flood = new Flood({
    baseUrl: config['flood-url'],
    username: config['flood-username'],
    password: config['flood-password']
  });

  const list = await flood.torrents.list();
  console.log(list);


}

main();
