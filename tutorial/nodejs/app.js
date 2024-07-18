// var greet = require('./greet.js');
// greet(); //import greet from greet.js

// var a = 1;
// var b = 2;
// var c = a + b;

// console.log(c);


//-----------------------------------------------------
// var person = {
//     firstname: 'John',
//     lastname: 'Doe',
//     greet: function() {
//         console.log('Hello, ' + this.firstname + ' ' + this.lastname);
//     }
// }

// person.greet(); //call a object function
// console.log(person['firstname']); //call a object value

//-----------------------------------------------------
//prototype chain (similar to object and class)
// function Person(firstname, lastname){
//     this.firstname = firstname;
//     this.lastname = lastname;
// }

// Person.prototype.greet = function () {
//     console.log('Hello , ' + this.firstname + ' ' + this.lastname);
// }

// Person.prototype.fullname = function () {
//     console.log(this.firstname + ' ' + this.lastname);
// }

// var john = new Person ('Jone', 'Doe');
// var jane = new Person('Jane', 'Tee');
// john.greet();

// console.log(john.__proto__);
// console.log(jane.__proto__);

//-----------------------------------------------------
// //required more (greet folder)
// var greete = require('./greet2');

// greete.spanish();
// greete.english();
// greete.english2();

//-----------------------------------------------------
//use of emitter in system
//(instead of if else to run the functions (> 1) required)
//use of config to prevent human error (typo)

// var Emitter2 = require('events');
// var eventConfig = require('./config').events;

// var emtr = new Emitter2();

// emtr.on(eventConfig.GREET, function() {
//     console.log('Somewhere, someone said hello. ');
// });

// emtr.on(eventConfig.GREET, function() {
//     console.log('A greeting occured!');
// });

// console.log('Hello');
// emtr.emit(eventConfig.GREET);

//-----------------------------------------------------
// //use of prototype
// var person = {
//     firstname: '',
//     lastname: '',
//     greet: function(){
//         return 'Hello ' + this.firstname + ' ' + this.lastname + '!';
//     }
// }

// var john = Object.create(person);
// john.firstname = 'John';
// john.lastname = 'Doe';
// john.firstname = 'Jane';
// john.extra = 'Testing';

// console.log(john.greet());
// console.log(john.extra);
// console.log(person.greet());


//-----------------------------------------------------
// //use of event emitter and util from system and prototype

// var Emitter3 = require('events');
// var util = require('util');

// function Greeter(){
//     Emitter3.call(this); //make sure that all this.___ is inherit not only the prototype
//     this.greeting = 'Hello World!';
// }

// util.inherits(Greeter, Emitter3); 
// //Greeter inherited the Emitter so that it can run the function using emit
// //thus Greeter will have the emit and on function under Emitter

// Greeter.prototype.greet = function() {
//     console.log(this.greeting); //this is the 'Hello World!'
//     this.emit('greet'); //in the emitter those function added under greet will be run
// }

// var greeter1 = new Greeter();

// greeter1.on('greet', function(){
//     console.log('Someone greeted!');
// });

// greeter1.on('greet', function(){
//     console.log('testing!');
// });

// greeter1.greet(); 
// //1. it will run the greet function (prototype) under Greeter
// //2. it will print this.greeting
// //3. it will run function under emit that has key = 'greet'
//     //3.1 it will run 'someone greeted...' function
//     //3.2 it will run 'testing...' function

//-----------------------------------------------------
// //use of event emitter and util from system and prototype
// //with parameter

// var Emitter3 = require('events');
// var util = require('util');

// function Greeter(){
//     this.greeting = 'Hello World!';
// }

// util.inherits(Greeter, Emitter3); 
// //Greeter inherited the Emitter so that it can run the function using emit
// //thus Greeter will have the emit and on function under Emitter

// Greeter.prototype.greet = function(data) {
//     console.log(this.greeting + data); //this is the 'Hello World!'
//     this.emit('greet', data); //in the emitter those function added under greet will be run
// }

// var greeter1 = new Greeter();

// greeter1.on('greet', function(data){
//     console.log('Someone greeted!' + data);
// });

// greeter1.on('greet', function(data){
//     console.log('testing!' + data);
// });

// greeter1.greet('Hellow'); 
// //1. it will run the greet function (prototype) under Greeter
// //2. it will print this.greeting
// //3. it will run function under emit that has key = 'greet'
//     //3.1 it will run 'someone greeted...' function
//     //3.2 it will run 'testing...' function

//-----------------------------------------------------
// //ES6
// var name3 = 'John';

// //doesn't apply to all browser
// // + apply to all 
// var greeting = `Hello ${ name3 }`; 

// console.log(greeting); //it will print Hello John

//-----------------------------------------------------
//class (simplify way of writting above objects)
// 'use strict'; //to make class available

// class Person {
//     constructor(firstname, lastname) {
//         this.firstname = firstname;
//         this.lastname = lastname;
//     }

//     greet() {
//         console.log('Hello, ' + this.firstname + ' ' + this.lastname);
//     }
// }

// var john = new Person('John', 'Doe');
// john.greet();

//-----------------------------------------------------
//use class to simplify the way how it is writing with
//prototype, emitter and util
//just function, emitter and extend

// var Greeter = require('./greet3');
// var greeter1 = new Greeter();

// greeter1.on('greet', function(data){
//     console.log('Someone greeted!' + data);
// });

// greeter1.on('greet', function(data){
//     console.log('testing!' + data);
// });

// greeter1.greet('Hellow'); 

//-----------------------------------------------------
//ways to create server and api 
// var http = require('http');
// var fs = require('fs');

// http.createServer(function(req, res) {

//     //routing 
//     if(req.url === '/'){
//         fs.createReadStream(__dirname + '/index.html').pipe(res);
//     }
//     else if(req.url === '/api'){
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         var obj = {
//             firstname: 'John',
//             lastname: 'Doe'
//         };
//         res.end(JSON.stringify(obj));
//     }
//     else{
//         res.writeHead(404); //response code
//         res.end();
//     }
// }).listen(1337, '127.0.0.1');

//localhost:1337

//-----------------------------------------------------
//express all in one page

// var express = require('express');
// var app = express();

// var port = process.env.PORT || 3000; //It will be set to process.env.PORT else default 3000;

// //----------------------------------------
// //template (temp frontend)
// //----------------------------------------
// app.set('view engine', 'ejs'); 
// app.get('/', function(req,res){
//     res.render('index');
// });

// //----------------------------------------
// //GET
// //----------------------------------------
// //html plain response
// app.get('/', function(req, res) {
//     res.send('<html><head></head><body><h1>Hello!!!</h1></body></html>')
// });

// //json response
// app.get('/api', function(req, res) {
//     res.json({  
//                 firstname: 'John', 
//                 lastname: 'Doe'
//             });
// });


// //json response
// //sample url: http://localhost:3000/person/1
// app.get('/person/:id', function(req, res) {
//     res.json({  
//                 firstname: 'John', 
//                 lastname: 'Doe',
//                 id: req.params.id,
//                 querystring_val: req.query.id2 
//             }); //query string - is the param in url
// });


// //----------------------------------------
// //POST
// //----------------------------------------
// //npm install body-parser --save
// var bodyParser = require('body-parser');

// //plain test response
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

// app.post('/newpersonttxt', urlencodedParser, function(req,res) {
//     res.send('Thank you very much!' + req.body.firstname + ' ' + req.body.lastname);
//     console.log(req.body);
//     console.log(req.body.firstname);
//     console.log(req.body.lastname);
// })

// //receive json
// var jsonParser = bodyParser.json();

// app.post('/newpersonjson', jsonParser, function(req, res) {
//     res.send('Thank you for the JSON data!');
//     console.log(req.body.firstname);
//     console.log(req.body.lastname);
// });


// app.listen(port);
// //----------------------------------------
// //----------------------------------------


//-----------------------------------------------------
//express seperated into controller and route

// var express = require('express');
// var app = express();
// var mysql = require('mysql');

// var getController = require('./controllers/getController');
// var postController = require('./controllers/postController');


// var port = process.env.PORT || 3000; //It will be set to process.env.PORT else default 3000;

// //----------------------------------------
// //template (temp frontend)
// //----------------------------------------
// app.set('view engine', 'ejs'); 
// app.get('/', function(req,res){
//     res.render('index');
// });
// //----------------------------------------

// //----------------------------------------
// //middleware
// //----------------------------------------
// //json response
// app.get('/people', function(req, res) {
//     var con = mysql.createConnection({
//         host:"localhost",
//         user: "root",
//         password: "password",
//         database: "tutorial"
//     });

//     con.query(
//         'select * from people',
//         function(err, rows) {
//             if (err) throw err;
//             res.json(rows);
//         }
//     )
// });

// //----------------------------------------

// getController(app);
// postController(app);

// app.listen(port);
//----------------------------------------
//----------------------------------------

//-----------------------------------------------------
//for loop sample

for(let i=0; i<10; i++){
    console.log(i);
}