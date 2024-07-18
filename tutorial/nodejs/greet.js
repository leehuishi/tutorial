//export and required 1
var greet = function() {
    console.log('Hello');
};

greet();

//export function outside
module.exports = greet; //export and use in app.js

// -----------------------------------------------------