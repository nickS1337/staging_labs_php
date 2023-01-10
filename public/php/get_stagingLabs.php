<?php

header('Content-Type: application/json');

#get_stagingLabs.php
//This file will retrieve all the records in the table staging_labs

//MySQL connection settings
$host     = "mysql";
$user     = "root";
$password = "mygene";
$database = "dnaiq_dallas";
$port = "3306";

$connection;

//Results from the query (in JSON format). This will be a string at first and we will
//encode it into JSON later
$json_results = array(
    "data"=>array()
);

//A try-catch block was used because some error kept coming up. This prevents that
try {

    //Establish a connection to the MySQL server:
    $connection = mysqli_connect($host, $user, $password, $database, $port);

} catch (Exception $e) {
    echo "MySQLi connection failed: " . $e->getMessage();
}

//Query the server for everything (*)
$contents_string = "SELECT * FROM staging_labs";
$contents_query  = mysqli_query($connection, $contents_string);

//Iterate over $describe_query
while ($row = $contents_query->fetch_array()){

    //Populate $json_results
    $json_results["data"][] = $row;

}

echo json_encode($json_results, JSON_PRETTY_PRINT);

mysqli_close($connection);

?>