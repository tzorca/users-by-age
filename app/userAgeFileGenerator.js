module.exports.generate = function(minAge, maxAge, userCount) {
    var output = '';
    for (var i = 0; i < userCount; i++) {
        var age = getRandomInt(minAge, maxAge);
        var userID = getRandomInt(1, 1000000);
        output += userID + ',' + age + '\r\n';
    }

    return output;
};

/**
 * Sourced from http://stackoverflow.com/a/1527820
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}