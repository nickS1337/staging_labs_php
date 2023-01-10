<?php

error_reporting(E_ALL &~ E_DEPRECATED);
error_reporting(E_ALL &~ E_NOTICE &~ E_DEPRECATED);

include("lib/DataTables.php");

print $_POST;

?>