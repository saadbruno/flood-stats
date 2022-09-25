const Flood = require('flood-api').default
const config = require('./config.json');
const express = require('express');
const seedrandom = require('seedrandom');
const web = express();
const port = config['port'] ? config['port'] : 3000; // if there's a port set on config.json, use that. Otherwise use 3000
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./torrent-data.sqlite');
var CronJob = require('cron').CronJob;

const cronSched = config['cron'] ? config['cron'] : "0 0 * * *"; // if there's a cron schedule set in the config, we use that, otherwise we default to midnight
const cronTz = config['cron-timezone'] ? config['cron-timezone'] : "Etc/UTC"; // if there's a cron timezone set in the config, we use that, otherwise we default to Etc/UTC

console.log(`======= FLOOD STATS =======\n
Using:\n
:: Flood address:  ${config['flood-url']}
:: Flood username: ${config['flood-username']}
:: Web port:       ${port}
:: Cron:           ${cronSched}
:: Timezone:       ${cronTz}

`)

// generates a random rgb color, based on a seed
function getRandomColor(seed) {
    let color = [];
    for (let i = 0; i < 3; i++) {
        var myrng = seedrandom(seed + i);
        color.push(myrng.quick());
    }
    // console.log(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
    return `hsl(${color[0]*360}deg, ${color[1]*30+70}%, ${color[2]*30+40}%)`;
}

// this functions grabs the torrent names and upload totals from Flood
async function getTorrentData() {

    console.log(':: Getting Torrent data from Flood');

    var timestamp = Date.now();

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


// Runs the Express web app
web.use(express.static('public'));

web.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

web.get('/api/torrent/absolute', (req, res) => {

    console.log("Requesting data from local API");
    db.serialize(function () {

        // const sample = require('./other/our-api-sample.json');

        db.all("SELECT name.hash, name.name, data.timestamp, data.upTotal FROM name LEFT JOIN data ON data.hash=name.hash ORDER BY name.hash, data.timestamp ASC", function (err, rows) {

            // Now we begin the conversion process from our database to something charts.js can understand.
            // NOTE: I'm sure there's a more efficient way of doing this

            // groups by hash
            group = rows.reduce(function (prev, cur, index) {
                // console.log(cur.hash);
                prev[cur.hash] = prev[cur.hash] || [];
                prev[cur.hash].push(cur);
                return prev;
            }, Object.create(null));

            // console.log(group);

            var result = [];

            // for each of the keys inside the newly created group
            for (const [key, value] of Object.entries(group)) {

                // generates random color:
                var color = getRandomColor(group[key][0].name);

                // creates a temporary object with the correct label (label is used by chartjs to refer to the name)
                var temp = {
                    "label": group[key][0].name,
                    "data": [],
                    "borderColor": color,
                    "backgroundColor": color,
                    "borderWidth": 2
                };

                // now we loop through each of the values inside the key
                for (let index = 0; index < value.length; index++) {
                    // console.log(value[index].timestamp);

                    temp.data[index] = { "x": value[index].timestamp, "y": value[index].upTotal / 1074000000 };

                }

                // add them to the final result array
                result.push(temp);

            }

            res.send(result);
        });
    });


});

web.get('/api/torrent/relative', (req, res) => {

    console.log("Requesting data from local API");
    db.serialize(function () {

        // const sample = require('./other/our-api-sample.json');

        db.all("SELECT name.hash, name.name, data.timestamp, data.upTotal FROM name LEFT JOIN data ON data.hash=name.hash ORDER BY name.hash, data.timestamp ASC", function (err, rows) {

            // Now we begin the conversion process from our database to something charts.js can understand.
            // NOTE: I'm sure there's a more efficient way of doing this

            // groups by hash
            group = rows.reduce(function (prev, cur, index) {
                // console.log(cur.hash);
                prev[cur.hash] = prev[cur.hash] || [];
                prev[cur.hash].push(cur);
                return prev;
            }, Object.create(null));

            // console.log(group);

            var result = [];

            // for each of the keys inside the newly created group
            for (const [key, value] of Object.entries(group)) {

                // generates random color:
                var color = getRandomColor(group[key][0].name);

                // creates a temporary object with the correct label (label is used by chartjs to refer to the name)
                var temp = {
                    "label": group[key][0].name,
                    "data": [],
                    "borderColor": color,
                    "backgroundColor": color,
                    "borderWidth": 2
                };

                // now we loop through each of the values inside the key
                for (let index = 0; index < value.length; index++) {
                    // console.log(value[index].timestamp);

                    let previous = index > 0 ? value[index-1].upTotal : 0; // account for first day, which index -1 doesn't exist.

                    // the Y value here is calculated by subtracting the previous upTotal from the current one, to get the difference.
                    temp.data[index] = {
                        "x": value[index].timestamp,
                        "y": Math.round((value[index].upTotal - previous) / 1049000)
                    };

                }

                // add them to the final result array
                result.push(temp);

            }

            res.send(result);
        });
    });


});

web.get('/dist/js/chart.min.js', (req, res) => {
    res.sendFile(__dirname + '/node_modules/chart.js/dist/chart.min.js');
});

web.get('/dist/js/moment.js', (req, res) => {
    res.sendFile(__dirname + '/node_modules/moment/dist/moment.js');
});

web.get('/dist/js/chartjs-adapter-moment.min.js', (req, res) => {
    res.sendFile(__dirname + '/node_modules/chartjs-adapter-moment/dist/chartjs-adapter-moment.min.js');
});

web.get('/dist/js/chartjs-plugin-zoom.min.js', (req, res) => {
    res.sendFile(__dirname + '/node_modules/chartjs-plugin-zoom/dist/chartjs-plugin-zoom.min.js');
});

web.get('/sample.json', (req, res) => {
    res.sendFile(__dirname + '/other/chartjs-sample.json');
});

web.listen(port, () => {
    console.log(`:: Express listening on port ${port}`)
});

// cron that gets the data from Flood
var job = new CronJob(`0 ${cronSched}`, function () {
    console.log(":: Running cron");
    getTorrentData();
}, null, true, cronTz);
job.start();
