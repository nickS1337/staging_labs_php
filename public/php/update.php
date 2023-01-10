<?php

    #MySQL connection settings
    $host     = "mysql";
    $user     = "root";
    $password = "mygene";
    $database = "dnaiq_dallas";
    $port = "3306";

    $connection;

    //A try-catch block was used because some error kept coming up. This prevents that
    try {

        //Establish a connection to the MySQL server:
        $connection = mysqli_connect($host, $user, $password, $database, $port);

    } catch (Exception $e) {
        echo "MySQLi connection failed: " . $e->getMessage();
    }

    //The parameters for creating a document are passed here by POST.
    //Can be accessed through $_POST

    //Get the keys, the name of each item in $_POST
    $post_keys = array_keys($_POST);

    //We will construct a mysql string. We will combine these two variables at the
    //end once we have populated them.
    $set_part = "";
    $where_part = "";

    for ($i = 0; $i < count($post_keys); $i++){
        
        $comma = "";
        $value = $_POST[$post_keys[$i]];

        if ($i !== count($post_keys)-1)  {
            $comma = ", ";
        }

        if (gettype($value) == "string"){
            $value = "'" . $value . "'";
        }

        $set_part = $set_part . $post_keys[$i] . " = " . $value . $comma;
    
    } 

    //Construct the MySQL string
    $mysql_string = "UPDATE staging_labs SET " . $set_part . " WHERE idstaging_labs = " . $_POST["idstaging_labs"];

    //Run the query
    mysqli_query($connection, $mysql_string);

    echo $mysql_string;

?>