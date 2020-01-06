/*
    Architecture of API

    // RESOURCES FOR THIS API
    *   /products
    *   /products/{id}
    *   /orders
    *   /orders/{id}
    
    // ROUTES
    *   GET     ->  /products       ->  It will fetch all products
    *   POST    ->  /products       ->  It will add a product

    *   GET     ->  /products/{id}  ->  It will fetch a specific product
    *   PATCH   ->  /products/{id}  ->  It will modify/edit a product
    *   DELETE  ->  /products/{id}  ->  It will delete a product

    *   GET     ->  /orders         ->  It will fetch all orders
    *   POST    ->  /orders         ->  It will add an order

    *   GET     ->  /orders/{id}    ->  It will fetch a specific order
    *   DELETE  ->  /orders/{id}    ->  It will delete(cancel) an order
*/

// importing modules
const http = require('http');
const app = require('./app');

// Setting port for the server
const port = 3000;

// creating server
const server = http.createServer(app);

// Listening to request on above specified port
server.listen(port,function(){
    console.log("Node server is up and running..")
});
