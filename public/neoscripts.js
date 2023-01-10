//===========================================//
// neoscript.js
// Contains the updated Javascript for the revised CRUD version
//===========================================//

//Globally keep track of the Datatable editor and table
var editor, table, rows_selected = 0;

//The file we'll use to ajax information back and forth to the server
let ajax_file = "php/get_stagingLabs.php";

$(document).ready(()=>{

    //Initialise a new DataTable editor
    editor = new $.fn.dataTable.Editor({
        table: "#datatable",
        idSrc: "idstaging_labs",
        ajax: {
            url: ajax_file,
            type: "POST"
       },
        fields: [
            { label: "idstaging_labs", name: "idstaging_labs" },
            { label: "meta_cat", name: "meta_cat" },
            { label: "category", name: "category" },
            { label: "collection_type", name: "collection_type" },
            { label: "specimen", name: "specimen" },
            { label: "sex", name: "sex" },
            { label: "age_range", name: "age_range" },
            { label: "other", name: "other" },
            { label: "test_name", name: "test_name" },
            { label: "test_abbr", name: "test_abbr" },
            { label: "analyte", name: "analyte" },
            { label: "units", name: "units" },
            { label: "normal_low", name: "normal_low" },
            { label: "normal_high", name: "normal_high" },
            { label: "ref_coefficient", name: "ref_coefficient" }
        ]
    });

    table = $("#datatable").DataTable({
        select: true,
        idSrc: "idstaging_labs",
        ajax: {
            url: ajax_file,
            type: "POST"
        },
        dom: "Bfrtip",
        columns: [
            { data: "idstaging_labs" },
            { data: "meta_cat" },
            { data: "category" },
            { data: "collection_type" },
            { data: "specimen" },
            { data: "sex" },
            { data: "age_range" },
            { data: "other" },
            { data: "test_name" },
            { data: "test_abbr" },
            { data: "analyte" },
            { data: "units" },
            { data: "normal_low" },
            { data: "normal_high" },
            { data: "ref_coefficient" },
        ],
        rowId: [0]
    });

    //Inline-editing
    // $('#datatable').on( 'click', 'tbody td', function (e) {
    //     editor.inline( this );
    // } );

    //Event when a row is clicked
    $("#datatable").on("click", "tr", ()=>{
        $(this).toggleClass(".selected");
    });

    //Anytime the user clicks on the screen, we'll display how many rows are selected:
    $(window).on("click", ()=>{

        //Number of rows currently selected
        var num_rows = table.rows('.selected').data().length;

        //Update the #row_selected text
        $("#row_selected").html("<a style='font-weight: bold'>" + num_rows + "</a> RECORD(S) SELECTED");
        $("#no_selected").html(num_rows);

        //Globally update what row is currently selected:
        rows_selected = table.rows( { selected: true } ).data();

        //For DELETE (styling)
        if (num_rows > 0) {
            $("#delete").css({
                "color": "#fff"
            })
        } else {
            $("#delete").css({
                "color": "#bcbcbc"
            });
        }

        //For UPDATE (styling)
        if (num_rows == 1) {
            $("#update").css({
                "color": "#fff"
            });
        } else {
            $("#update").css({
                "color": "#bcbcbc"
            });
        }

    });

});