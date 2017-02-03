module.exports.parseLinesToUsersByAge = function(lines) {
    var usersByAge = {};
    lines.forEach(function(line){
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