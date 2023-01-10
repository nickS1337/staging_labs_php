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

    //We will want to construct a string to execute
    $mysql_string = "DELETE FROM staging_labs WHERE idstaging_labs IN (" ;

    //The documents we're going to remove
    $row_data = $_POST["remove"];

    //This will be the second part of $mysql_string, it will contain the primary keys
    //of the rows to be deleted.
    $row_ids = "";

    for ($i = 0; $i < count($row_data); $i++){

        $comma = "";

        if ($i !== count($row_data)-1)  {
            $comma = ", ";
        }

        $row_ids = $row_ids . $row_data[$i] . $comma;
    }

    //Complete the mysql string:
    $mysql_string = $mysql_string . $row_ids . ")";

    //Run the query:
    mysqli_query($connection, $mysql_string);

    echo $mysql_string;

?>