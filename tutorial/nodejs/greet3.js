//use class to simplify the way how it is writing with
//prototype, emitter and util
'use strict';

var Emitter3 = require('events');

module.exports = class Greeter extends Emitter3 {
    constructor(){
        super();
        this.greeting = 'Hello World!';
    }

    greet(data) {
        console.log(this.greeting + data); //this is the 'Hello World!'
        this.emit('greet', data); //in the emitter those function added under greet will be run
    }
}


