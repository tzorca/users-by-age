var fs = require('fs');
var cluster = require('cluster');
var chunkifier = require('./app/chunkifier.js');
var os = require('os');
var userAgeParser = require('./app/userAgeParser.js');


if (cluster.isMaster) {
    console.time('app');
    if (process.argv.length < 3) {
        return console.log("Please include a filename parameter.");
    }

    var filename = process.argv[2];

    var multicore = true;
    if (process.argv.length >= 4) {
        if (process.argv[3] == 'singlecore') {
            multicore = false;
        }
    }

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            return console.log(err);
        }

        var lines = splitIntoLines(data);

        if (multicore) {
           coordinateWorkers(lines);
        } else {
            var usersByAge = userAgeParser.parseLinesToUsersByAge(lines);
            logUsersByAge(usersByAge);
        }

    });
} else if (cluster.isWorker) {
    process.on('message', function(lines) {
        var usersByAge = userAgeParser.parseLinesToUsersByAge(lines);
        process.send(usersByAge);
    });
}


function splitIntoLines(text) {
    return text.match(/[^\r\n]+/g);
}


function coordinateWorkers(lines) {
    var cpuCount = os.cpus().length;
    var subResults = [];

    var chunkedLines = chunkifier.chunkify(lines, cpuCount);

    var completedWorkerCount = 0;
    for (var i = 0; i < cpuCount; i++) {
        var worker = cluster.fork();
        worker.send(chunkedLines[i]);

        worker.on('message', function workerFinished(subResult) {
            // This worker is done
            worker.kill();
            completedWorkerCount++;

            subResults.push(subResult);

            if (completedWorkerCount == cpuCount) {
                var usersByAge = mergeObjectsAddValues(subResults);
                logUsersByAge(usersByAge);
            }
        });
    }
}


function mergeObjectsAddValues(objs) {
    var result = {};

    objs.forEach(function(obj) {
        Object.keys(obj).forEach(function(key) {
            result[key] = 0;
        });
    });

    objs.forEach(function(obj) {
        Object.keys(obj).forEach(function(key) {
            result[key] += obj[key];
        });
    });

    return result;
}


function logUsersByAge(usersByAge) {
    Object.keys(usersByAge).forEach(function(age) {
        var userCount = usersByAge[age];
        console.log([age, userCount]);
    });

    console.timeEnd('app');
}