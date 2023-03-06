<?php

#populate_header.php

function retrieveTableHeader($table_name){

    /*
    retrieveTableHeader()
    :description: This function will retrieve the name of the headers/keys
                  of a given table.
    :params arg1: $table_name => string => name of the table we want to 
                  retrieve information from.
    */

    //First connect to MySQL:
    #MySQL connection settings
    $host     = "mysql";
    $user     = "root";
    $password = "mygene";
    $database = "dnaiq_dallas";
    $port = "3306";

    $connection;

    //List of strings to be populated once we have processed the data from the server.
    $html_th = "<tr class='th-row'><th></th>";
    $html_td = "";

    //A try-catch block was used because some error kept coming up. This prevents that
    try {

        //Establish a connection to the MySQL server:
        $connection = mysqli_connect($host, $user, $password, $database, $port);

    } catch (Exception $e) {
        echo "MySQLi connection failed: " . $e->getMessage();
    }

    //Now we're connected to the server. We will populate the HTML element
    //we're in (#datatables) with the information from the database.
    //First we will populate the table header section then the actual table cells
    //themselves.

    //Get the list of columns in $table_name
    $describe_string = "DESCRIBE " . $table_name;
    $describe_query  = mysqli_query($connection, $describe_string);
    //We'll also want to a keep a copy of $describe_query as an array
    $describe_array  = array();

    //Get the contents of staging_labs
    $contents_string = "SELECT * FROM " . $table_name;
    $contents_query  = mysqli_query($connection, $contents_string);

    //Iterate over $describe_query
    while ($col = $describe_query->fetch_array()){

        //The purpose of this loop is to populate $html_th with the corresponding columns
        //in the database. This will only occur if mysqli_num_rows(describe_query)

        //Name of the column in the database
        $col_name = $col[0];

        //Add the current $col (column) into the $html_th string:
        $html_th = $html_th . "<th>" . $col_name . "</th>";

        //Add to $describe_array so we can remember in the future what the columns are
        $describe_array[] = $col_name;

    }


    //Close off $html_th in the proper way
    $html_th = $html_th . "</tr>";

    //Print the table header before we continue with the body section of the table
    echo $html_th;

}

?>