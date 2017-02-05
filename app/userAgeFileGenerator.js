// Generates a test string for a file in the format read by userAgeParser.
module.exports.generate = function(minAge, maxAge, userCount) {
    var output = '';
    
    var userIDs = [];
    for (var i = 1; i <= userCount; i++) {
        userIDs.push(i);
    }

    shuffle(userIDs);

    for (var i = 0; i < userCount; i++) {
        var age = getRandomInt(minAge, maxAge);
        var userID = userIDs.pop();
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


/**
 * Sourced from http://stackoverflow.com/a/6274381
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

