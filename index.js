var fs = require('fs');
var userAgeParser = require('./app/userAgeParser.js');

if (process.argv.length < 3) {
    return console.log("Please include a filename parameter.");
}

var filename = process.argv[2];

fs.readFile(filename, 'utf8', function(err, data) {
    if (err) {
        return console.log(err);
    }
    var usersByAge = userAgeParser.parseTextToUsersByAge(data);

    Object.keys(usersByAge).forEach(function(age) {
        var userCount = usersByAge[age];
        console.log(age + ',' + userCount);
    });
});