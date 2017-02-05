var validator = require('validator');


var columnIndex = {
	userID: 0,
	userAge: 1
};


// Parses the specified array of strings into an object map containing number of users for each distinct age.
// Each string should have two fields: user ID and user age, delimited by a comma.
// User ID should come before user age.
//
// Returns an object in the form of { error: string, data: usersByAge }
// If there is an error, the error key will have a non-null value.
module.exports.parseLinesToUsersByAge = function(lines) {
    var usersByAge = {};

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // Split line by comma delimeter
        var fields = line.split(',');

        // Validate fields
        var validationResult = validateLineFields(fields);
        if (validationResult.error) {
        	return validationResult;
        }

        // Read fields
	    var userID = fields[columnIndex.userID];
	    var userAge = fields[columnIndex.userAge];

        // Increment usersByAge for the current userAge.
        if (!(userAge in usersByAge)) {
            usersByAge[userAge] = 1;
        } else {
            usersByAge[userAge]++;
        }

        
    }

    return { error: null, data: usersByAge };
};


// Validates whether the fields on a line match the data format requirements.
// Returns an object matching the format of parseLinesToUsersByAge's return value. Will contain an error key if there is a validation error.
function validateLineFields(fields) {
	if (fields.length != 2) {
        return { error: 'At least one line has an invalid number of fields.', data: null };
    }

    var userID = fields[columnIndex.userID];
    if (!validator.isInt(userID)) {
        return { error: 'At least one user ID is not an integer.', data: null };
    }

    var userAge = fields[columnIndex.userAge];
    if (!validator.isInt(userAge)) {
        return { error: 'At least one user age is not an integer.', data: null };
    }

    // No field validation errors found.
    return {};
}