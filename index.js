var fs = require('fs');
var cluster = require('cluster');
var chunkifier = require('./app/chunkifier.js');
var os = require('os');
var userAgeParser = require('./app/userAgeParser.js');


if (cluster.isMaster) {
    // Begin timing application.
    console.time('app');

    // First program parameter should be a path to the file that will be processed.
    if (process.argv.length < 3) {
        return console.log("Please include a filename as the first parameter.");
    }
    var filename = process.argv[2];

    // An optional second parameter of 'singlecore' will allow the app to run in single core mode.
    // This can be used to compare performance between multi-core and single-core mode.
    var multicore = true;
    if (process.argv.length >= 4) {
        if (process.argv[3] == 'singlecore') {
            multicore = false;
        }
    }

    // Read the file.
    fs.readFile(filename, 'utf8', function(err, fileData) {
        if (err) {
            return console.log(err);
        }

        // Split the file data into lines for processing.
        var lines = splitIntoLines(fileData);

        if (multicore) {
            // In multicore mode, coordinate workers to work in line chunks.
            coordinateWorkers(lines, function onCompletion(subResults) {

                // After all workers are finished, merge their results together.
                var usersByAge = mergeObjectsAddValues(subResults);

                // Log the results.
                logUsersByAge(usersByAge);

                // Time app completion.
                console.timeEnd('app');
                
                // Exit the application.
                process.exit();
            });
        } else {
            // In single-core mode, just parse all the lines and log the results.
            var usersByAge = userAgeParser.parseLinesToUsersByAge(lines);
            logUsersByAge(usersByAge);

            // Time app completion.
            console.timeEnd('app');

            // Exit the application.
            process.exit();
        }
    });

} else if (cluster.isWorker) {
    // A worker process will receive lines from the master process.
    process.on('message', function(lines) {
        // Lines are parsed into a users by age map, then sent back to the master.
        var usersByAge = userAgeParser.parseLinesToUsersByAge(lines);
        process.send(usersByAge);
    });
}


// Splits text into an array of lines.
function splitIntoLines(text) {
    return text.match(/[^\r\n]+/g);
}


// Coordinates workers to to work on chunked elements of the lines array.
// Calls onCompletion function when all workers are finished.
function coordinateWorkers(lines, onCompletion) {
    var cpuCount = os.cpus().length;
    var subResults = [];
    var completedWorkerCount = 0;

    // Split the lines into chunks that can be processed by each worker.
    var chunkedLines = chunkifier.chunkify(lines, cpuCount);

    for (var i = 0; i < cpuCount; i++) {

        // For each core/CPU, create a new process in worker mode.
        var worker = cluster.fork();

        // Send the lines to be processed to the new worker.
        worker.send(chunkedLines[i]);

        worker.on('message', function workerFinished(subResult) {
            // When a worker sends a message to the master, that worker has finished.
            worker.kill();
            completedWorkerCount++;
            subResults.push(subResult);

            // If all the workers are finished, run the completion function.
            if (completedWorkerCount == cpuCount) {
                onCompletion(subResults);
            }
        });
    }
}


// Merges together multiple objects with numeric values.
// If the objects have the same keys, adds their values together in the result object.
function mergeObjectsAddValues(objs) {
    var result = {};

    objs.forEach(function(obj) {
        Object.keys(obj).forEach(function(key) {
            if (!(key in result)) {
                result[key] = 0;
            }

            result[key] += obj[key];
        });
    });

    return result;
}


// Outputs a list of tuples of distinct age and count of users with that age.
function logUsersByAge(usersByAge) {
    Object.keys(usersByAge).forEach(function(age) {
        var userCount = usersByAge[age];
        console.log([age, userCount]);
    });
}