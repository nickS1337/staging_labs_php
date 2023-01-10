//===========================================//
// TEST FILE
// This file is used for testing purposes only.
// Specifically with SQL-related scripts.
//===========================================//

var mysql = require("mysql2");

let connectionSettings = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "mygene",
    "database": "dnaiq_dallas"
};

//Attempt a connection to the database
let line = mysql.createConnection(connectionSettings);
console.log("Connecting to MySQL server on " +  connectionSettings.host + ":" + connectionSettings.port + " with credentials " + connectionSettings.user + ":" + connectionSettings.password + " on " + connectionSettings.database);

//When we connect to the mysql database:
line.connect((err)=>{

    //Print on error
    if (err){
        console.log("MySQL connection unsuccessful: " + err);
        reject(err);
        return;
    }

    //Otherwise, the connection is succsssful.
    console.log("MySQL connection successful at " + new Date());

});

console.log("Performing Query");
line.query("DESCRIBE staging_labs;", (err, results)=>{

    if (err){
        console.log("Error performing query: " + err);
        return;
    }

    console.log(results);

});