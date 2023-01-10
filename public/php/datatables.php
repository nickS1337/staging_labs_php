<?php

include("./lib/DataTables.php");

use
    DataTables\Editor,
    DataTables\Editor\Field,
    DataTables\Editor\Format,
    DataTables\Editor\Mjoin,
    DataTables\Editor\Options,
    DataTables\Editor\Upload,
    DataTables\Editor\Validate;

$editor = Editor::inst( $db, "datatable", "staging_labs" )
    ->debug(true)
    ->process( $_POST )
    ->json();

?>