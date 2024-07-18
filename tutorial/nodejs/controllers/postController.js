module.exports = function(app) {
    //----------------------------------------
    //POST
    //----------------------------------------
    //npm install body-parser --save
    var bodyParser = require('body-parser');

    //plain test response
    var urlencodedParser = bodyParser.urlencoded({ extended: false });

    app.post('/newpersonttxt', urlencodedParser, function(req,res) {
        res.send('Thank you very much!' + req.body.firstname + ' ' + req.body.lastname);
        console.log(req.body);
        console.log(req.body.firstname);
        console.log(req.body.lastname);
    })

    //receive json
    var jsonParser = bodyParser.json();

    app.post('/newpersonjson', jsonParser, function(req, res) {
        res.send('Thank you for the JSON data!');
        console.log(req.body.firstname);
        console.log(req.body.lastname);
    });

}