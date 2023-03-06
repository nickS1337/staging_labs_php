//=========================================================//
//
// CRUD: Create, Update, and Delete Application
// By Nicholas Smith
// December 2022
//
//=========================================================//

import { createRequire } from "module";
const require = createRequire(import.meta.url);

//Server start time information
var server_start = new Date();

//Get the jshashes module - this is used for our encryption methods:
var jshashes = require("jshashes");

//Also AES256 (two-way encryption function)
var aes256 = require("aes256");
var aesKey = "mygene"; 

//Get the encryption methods from jshashes:
var md5 = new jshashes.MD5;
var sha256 = new jshashes.SHA256;
var sha512 = new jshashes.SHA512;

//Since this application isn't actually going to be used we won't worry to much about
//salting the user information before sending it to the frontend.
var cookie_salt = sha512.b64(server_start.getTime().toString());

//MySQL
var mysql = require("mysql2");

//Firebase setup
//var Firebase = require("firebase");
const serviceAccount = require("./firebase_service_account.json");
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

//Wait X ms before doing anything. This is so the MySQL server can properly setup first.
var mysql_connection_delay = 500;

//Startup firebase
let firebaseApp = initializeApp(serviceAccount);
let auth        = getAuth(firebaseApp);

//use express as the webserver
var app  = require("express")();
var http = require("http").Server(app);
var io   = require("socket.io")(http);

//Cookie module -- we'll need this to automatically authenticate the user
var cookie = require("cookie");

//Server settings
var port = 27015 || process.env.PORT;

//GLOBAL container for the results of the query to staging_labs
var staging_labs = [];

//This will switch to true when we are connected to the server
var mysql_connected = false;

//This will contain the MySQL connection line
var line;

function ConnectMySQL(){

    //ConnectMySQL()
    //This function will connect this script to the MySQL server.
    //It will resolve the promise if a valid connection was made or else
    //it will reject it.

    //This function works by returning a promise, which is resolved or rejected
    //after we have tried to connect to the MySQL server.

    if (mysql_connected){
        console.log("MySQL already connected. Will not reattempt new connection");
        return;
    }

    return new Promise((resolve, reject)=>{

        console.log("Waiting " + mysql_connection_delay + "ms before proceeding with MySQL connection");
        setTimeout(()=>{

            console.log("Attempting connection to MySQL server at " + new Date());

            let connection = mysql.createConnection({
                "host": "127.0.0.1",
                "user": "root",
                "password": "mygene",
                "database": "dnaiq_dallas"
            });

            //When we connect to the mysql database:
            connection.connect((err)=>{

                //Print on error
                if (err){
                    console.log("MySQL connection unsuccessful: " + err);
                    reject(err);
                    return;
                }

                //Otherwise, the connection is succsssful.
                console.log("MySQL connection successful at " + new Date());

                mysql_connected = true;

                //Allow the MySQL connection to be accessed globally
                line = connection;

                resolve(true);

            });

        }, mysql_connection_delay);

    });

}


//Initialise the MySQL connection
ConnectMySQL();

//Start the http webserver for socket.io connections
http.listen(port, ()=>{
    console.log("NODE.JS HTTP server running on port " + port);
});

io.on("connection", (socket)=>{

    //Check to see if there is a valid MySQL connection at the moment.
    //This is essential because the app can't run without it:
    if (!mysql_connected){
        
        console.log("Client " + socket.id + " connected there is no valid MySQL connection at the moment.");
        console.log("Sending RELOAD signal to " + socket.id);
        
        //Send the RELOAD signal
        socket.emit("reload");

        //Disconnect them if the RELOAD signal did nothing:
        socket.disconnect();

        return;

    }

    console.log("Client connected " + socket.id);
    console.log("Checking authentication for " + socket.id);

    //Grab the cookies the user has:
    var cookie_raw = socket.handshake.headers.cookie, cookies;

    //Check if cookie_raw is empty. If it isn't, then the user is most likely
    //logged in already through cookies
    if (cookie_raw !== "" && cookie_raw !== undefined){
        
        console.log("Cookies detected. Attempting authentication for " + socket.id);

        //Parse cookie_raw if there's something in there.
        cookies    = cookie.parse(cookie_raw);

        //These are the two cookies needed for authentication
        let ident = cookies.ident;
        let login = cookies.login;

        //Quickly verify login based on ident:
        var ident_decrypted = aes256.decrypt(aesKey, ident);

        //Create a variable to compare login to:
        var login_compare = sha512.b64(cookie_salt + ident_decrypted + cookie_salt);

        // console.log(ident_decrypted);
        // console.log(login);
        // console.log(login_compare);

        if (login_compare == login){
            socket.emit("removeLogin");
            socket.emit("removeLoading");
            console.log("User " + ident + " successfully signedin using cookies");
        } else {
            console.log("User " + ident + " authentication failed using cookies");
            socket.emit("removeLoading");
        }

    } else {
        console.log("No cookies detected for " + socket.id);
        socket.emit("removeLoading");
    }

    //When a client connects, perform a query to the database to get them
    //the latest data:
    line.query(
        "SELECT * FROM staging_labs;",
        (err, results, fields)=>{

            if (err){
                console.log("Error performing query: " + err);
                return;
            }

            staging_labs = results;

            socket.emit("table-data", results);

        }
    )

    socket.on("disconnect", ()=>{

        console.log("Client disconnected " + socket.id);

    });

    //When we receive a delete request:
    socket.on("delete-request", (rows)=>{

        console.log("Received DELETE request");
        
        //rows => array[] which contains an array of JSON objects

        //We will want to construct a string to execute
        var mysql_string = "DELETE FROM staging_labs WHERE idstaging_labs IN (" ;

        //Construct the rest of mysql_string
        for (var i = 0; i < rows.length; i++){
            (i !== rows.length-1) ? mysql_string += rows[i].idstaging_labs + "," : mysql_string += rows[i].idstaging_labs + ");";
        }

        //Now that we have the deletion string, we can query it.
        line.query(mysql_string, (err, results, fields)=>{

            if (err){
                errString = "Error performing DELETE operation: " + err;
                socket.emit("message", errString, "red");
                console.log(errString);
            }

            socket.emit("message", "DELETE Operation successfully performed. Removed " + rows.length + " record(s)", "green");

        });

        console.log(mysql_string);

    });



    //When we receive an UPDATE request:
    socket.on("update-request", (original_row, updated_row)=>{

        //original_row => Object, contains the orignal data from the row
        //updated_row => Object, contains the updated data for the row

        console.log("Received UPDATE request");

        //Keys of the original row:
        var original_row_keys = Object.keys(original_row);

        //Construct the string to execute on the database. The syntax for an update
        //operation is: UPDATE table_name SET field=value WHERE x=value
        var set_part   = " SET "
        var where_part = " WHERE "

        //Add the 'SET' and 'WHERE' part
        for (var i = 0; i < original_row_keys.length; i++){

            //Should we use a comma in the string for the current iteration?
            var comma = (i !== original_row_keys.length-1) ? ",\n" : "";
            
            //Updated contents of the current key
            var updated_contents_raw = updated_row[original_row_keys[i]];
            var updated_contents     = updated_contents_raw;

            //Figure out if the data should be null, or enclosed in quotation marks (if it's a string)
            if (updated_contents_raw == "NULL" || updated_contents_raw == null){
                updated_contents = 'NULL';
            } else if (typeof updated_contents_raw == "string"){
                updated_contents = "'" + updated_contents_raw + "'";
            }
            
            set_part   += original_row_keys[i] + " = " + updated_contents + comma;
            
        }

        //Construct the MySQL Update string
        var mysql_string = "UPDATE staging_labs"+ set_part + " WHERE idstaging_labs="+original_row["idstaging_labs"];
        
        console.log("Constructed MySQL UPDATE string: " + mysql_string);

        //Now that we've created it, perform the query:
        line.query(mysql_string, (err, results, fields)=>{

            if (err){
                errString = "Error performing UPDATE operation: " + err;
                socket.emit("message", errString, "red");
                console.log(errString);
                return;
            }

            socket.emit("message", "UPDATE Operation successfully performed. Successfully updated 1 record. MYSQL: " + results.info);
            //socket.emit("reload");

        });
        
    });


    //When we receive a CREATE request:
    socket.on("create-row", (new_row)=>{

        console.log("Received CREATE Request");

        //Keys of the new row:
        var keys = Object.keys(new_row);

        //We will need to yet again construct another MySQL string.
        var fields = "(";
        var values = "";

        for (var i = 0; i < keys.length; i++){
        
            var comma = (i !== keys.length-1) ? ", " : "";

            var value = new_row[keys[i]];
                value = (typeof value == "string") ? "'" + value + "'" : value;

            fields += keys[i] + comma;
            values += value + comma;
        
        } fields += ")";

        var mysql_string = "INSERT INTO staging_labs " + fields + " VALUES (" + values + ")";
        
        //Now that we've created it, perform the query:
        line.query(mysql_string, (err, results, fields)=>{

            if (err){
                var errString = "Error performing CREATE operation: " + err;
                socket.emit("message", errString, "red");
                console.log(errString);
                return;
            }

            socket.emit("message", "CREATE Operation successfully performed. Successfully created 1 new record. MYSQL: " + results.info);

        });
        
    });


    //Create a new user account when needed:
    //SEE https://firebase.google.com/docs/auth/web/password-auth FOR REFERENCE
    socket.on("create-account", (email, password)=>{

        console.log("Received request to create new account: " + email);

        createUserWithEmailAndPassword(auth, email, password).then((userCredentials)=>{
            socket.emit("logged-in");
        }).catch((err)=>{
            socket.emit("login-error", "Failed to create new account: " + err.message);
            console.log("Failed to create new account: " + err.message);
        });

    });

    //Login a user when needed:
    //SEE https://firebase.google.com/docs/auth/web/password-auth FOR REFERENCE
    socket.on("login-user", (email, password)=>{

        console.log("User " + email + " logging in");

        signInWithEmailAndPassword(auth, email, password).then(()=>{

            console.log("User " + email + " logged in");

            //We'll construct some cookies so the user doesn't have to login everytime
            //they come back (for 1 day only though)
            let cookieVals = {
                "login": sha512.b64(cookie_salt + email + cookie_salt),
                "ident": aes256.encrypt(aesKey, email)
            }

            console.log("Generated cookieVals: " + JSON.stringify(cookieVals));
            socket.emit("logged-in", cookieVals);
            
        }).catch((err)=>{
            socket.emit("login-error", "Login failed: " + err.message);
            console.log("Login failed: " + err.message);
        });

    });


});
