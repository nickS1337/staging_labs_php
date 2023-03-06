//===========================================//
// neoscript.js
// Contains the updated Javascript for the revised CRUD version
//===========================================//


//TEMPORARY === 
$("#login, #loading-screen").fadeOut();


//Because we haven't renewed the trial version of datatatables as of 23/01/2022,
//we will disable the alert function so we don't get the annoying alert from
//datatables. We'll keep the original alert function in case we need to do
//alerts though.
let Oalert = alert;
alert = ()=>{};

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
            {
                data: null,
                defaultContent: '',
                className: 'select-checkbox',
                orderable: false
            },
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
        rowId: [0],
        language: {
            search: "Database Search",
            searchPlaceholder: "Start typing to search"
        },
        initComplete: (settings, json)=>{

            //This function will execute once datatables has finished running.
            $("#datatable_filter").prepend(`
            <div class="filter inline-middle" id="order-container">
                <div class="filter-txt">PAGE SIZE</div>
                <select class="action-table-input" id="order">
                    <option value="-1">ALL RECORDS</option>
                    <option value="5">5 ROWS</option>
                    <option value="10" selected >10 ROWS</option>
                    <option value="20">20 ROWS</option>
                    <option value="25">25 ROWS</option>
                    <option value="50">50 ROWS</option>
                    </select>
            </div>
            `);

            //Show the menu so we can see which database we're working with.
            $("#datatable_filter").append(`
            <div class="filter inline-middle" id="order-container">
                <div class="filter-txt">TABLE</div>
                <select class="action-table-input" id="toggle_table">
                    <option value="staging_labs">STAGING_LABS</option>
                    <option value="staging_labs">USERS</option>
                </select>
            </div>
            `);

            $("#datatable_filter").prepend(`<div id="filters-txt">Tools</div>`);

            let order = document.getElementById("order");

            order.addEventListener("change", ()=>{
                table.page.len(parseInt(order.value)).draw();
            });

        }
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