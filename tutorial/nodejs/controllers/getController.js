module.exports = function(app) {
    
    //----------------------------------------
    //GET
    //----------------------------------------
    //html plain response
    app.get('/', function(req, res) {
        res.send('<html><head></head><body><h1>Hello!!!</h1></body></html>')
    });

    //json response
    app.get('/api', function(req, res) {
        res.json({  
                    firstname: 'John', 
                    lastname: 'Doe'
                });
    });


    //json response
    //sample url: http://localhost:3000/person/1
    app.get('/person/:id', function(req, res) {
        res.json({  
                    firstname: 'John', 
                    lastname: 'Doe',
                    id: req.params.id,
                    querystring_val: req.query.id2 
                }); //query string - is the param in url
    });
}