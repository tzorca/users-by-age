// Parse an array of lines into an object map containing number of users for each distinct age.
// Each line should contain userID and userAge delimited by a comma.
module.exports.parseLinesToUsersByAge = function(lines) {
    var usersByAge = {};
    lines.forEach(function(line) {
        var fields = line.split(/,/);
        if (fields.length != 2) {
            console.log('Invalid number of fields on line');
            return;
        }

        var userID = fields[0];
        var userAge = fields[1];
        if (!(userAge in usersByAge)) {
            usersByAge[userAge] = 1;
        } else {
            usersByAge[userAge]++;
        }
    });

    return usersByAge;
};