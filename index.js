const Flood = require('flood-api').default
const config = require('./config.json');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./torrent-data.sqlite');

// this functions grabs the torrent names and upload totals from Flood
async function getTorrentData() {

    console.log(':: Getting data from Flood');

    var timestamp = Math.floor(Date.now() / 1000);

    // TO DO: Check if this needs to be here, or if it can be outside of this function

    const flood = new Flood({
        baseUrl: config['flood-url'],
        username: config['flood-username'],
        password: config['flood-password']
    });

    const list = await flood.torrents.list();

    var stmtName = db.prepare("INSERT OR IGNORE INTO name(hash, name) VALUES (?, ?)");
    var stmtData = db.prepare("INSERT OR IGNORE INTO data(hash, timestamp, upTotal) VALUES (?, ?, ?)");

    for (var hash in list.torrents) {
        stmtName.run(hash, list.torrents[hash].name);
        stmtData.run(hash, timestamp, list.torrents[hash].upTotal);
    }

    stmtName.finalize();
    stmtData.finalize();

}

// let's create our database, if it doesn't exist yet
db.parallelize(function () {
    db.run("CREATE TABLE IF NOT EXISTS data (hash VARCHAR NOT NULL, timestamp INTEGER NOT NULL, upTotal INTEGER NOT NULL, UNIQUE (hash,timestamp))");
    db.run("CREATE TABLE IF NOT EXISTS name (hash VARCHAR PRIMARY KEY NOT NULL UNIQUE, name VARCHAR NOT NULL)");
});

// runs the actual flood data
getTorrentData();
