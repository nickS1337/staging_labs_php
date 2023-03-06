var socket = io.connect("http://127.0.0.1:27015/", {
    transports: ['websocket']
});

//List of keys associated with every datapoint (this is also the headers of the table)
var global_data_keys = [];

//List of selected rows -- WITH THE JSON DATA OF THE ROW
var rows = [];

//List of table data --
var table_data = [];

//JSON Object of the selected rows. The HTML ID of the row identifies the data
var selected_rows_ids = {};

//List of inputs (in order) currently present in #table-update
var update_inputs = [];

//List of inputs (in order) in the table #table_create
var create_inputs = [];

//Are we in login or registration mode?
var login_mode = true;

//Stuff to run when the document is ready:
$(document).ready(() => {

    var load_time = new Date();

    console.log("Document loaded at " + load_time.getTime());

    //Open #create-container when #create is clicked
    document.getElementById("create").onclick = () => {
        $("#create-container").hide().css({
            "display": "table"
        });
    }

    //Open #update-container when #update is clicked
    document.getElementById("update").onclick = () => {

        //Because we can only update one row at a time
        if (rows_selected.length == 1) {

            $("#update-container").css({
                "display": "table"
            });

            var data = rows_selected[0];
            var data_keys = Object.keys(data);

            //Reset the table:
            $("#table-update").html(`
            <tr class="action-table-th">
                <th>COLUMN</th>
                <th>ROW</th>
                <th>Type</th>    
            </tr>`);

            //Also reset the list of inputs we have connected to #table-update
            update_inputs = [];

            //This variable will switch ones we've iterated through the junk in
            //rows_selected
            let junk_passed = false;

            //No we need to populate #table-update with the data the user selected.
            for (var i = 0; i < data_keys.length; i++) {

                tr_html = "<tr>";

                if (data_keys[i] == "idstaging_labs") junk_passed = true;
                if (!junk_passed) continue;

                var isOdd = (i % 2 == 0) ? "" : " class='odd'";

                //If we need to convert this to a textarea:
                var input_type = (data[data_keys[i]] == null || data[data_keys[i]].toString().length > 10) ? "textarea" : "input type='text'"

                //We also need to come up with an id for the input:
                var input_id = randomStr(12);

                //The value of the input:
                var input_val = (data[data_keys[i]] == null) ? "NULL" : data[data_keys[i]];

                //While we're at it, also populate #table_create
                $("#table-update").append(`
                    <tr` + isOdd + `>
                        <td>` + data_keys[i] + `</td>
                        <td><` + input_type + ` class="action-table-input" id="` + input_id + `" placeholder="Enter ` + typeof data[data_keys[i]] + `" value="` + input_val + `" id="` + input_id + `">` + ((input_type == "textarea") ? input_val + "</textarea>" : "") + `
                        </td>
                        <td>` + typeof data[data_keys[i]] + `</td>
                    </tr>
                `);

                //Keep a note of the inputs we've made
                update_inputs.push(input_id);

            }

        }

    }

    //Open #delete-container when #delete is clicked
    document.getElementById("delete").onclick = () => {

        if (rows_selected.length >= 1){
            $("#delete-container").css({
                "display": "table"
            });
        }

    }

    //Exit #create-container when #exit-create is clicked
    document.getElementById("exit-create").onclick = () => {
        $("#create-container").css({
            "display": "none"
        });
    }

    //Exit #update-container when #update is clicked
    document.getElementById("exit-update").onclick = () => {
        $("#update-container").css({
            "display": "none"
        });
    }

    //Exit #delete-container when #delete is clicked
    document.getElementById("exit-delete").onclick = () => {
        $("#delete-container").css({
            "display": "none"
        })
    }

    //Send a DELETE request when #confirm-delete is clicked
    document.getElementById("confirm-delete").onclick = () => {

        //We will send the contents of selected_row_ids, exluding the html row id:
        var deleting = [];

        for (var i = 0; i < rows_selected.length; i++){
            
            //Primary key (in the database) of the row:
            let row_pk = rows_selected[i].idstaging_labs;
            deleting.push(row_pk);

        }

        console.log(JSON.stringify(deleting));

        sendMessage("Sent deletion request for " + deleting.length + " records. Please wait.")
        $.post(
            "php/delete.php",
            { "remove": deleting },
            (res)=>{
                console.log("Response from $.post : " + JSON.stringify(res));
            }
        );

        $("#delete-container").css({
            "display": "none"
        });

        //Reset selected_rows_ids
        selected_rows_ids = {};

        //Delete the row(s) from the datatable:
        table.rows(".selected").remove().draw(false);;

    };

    //Send an UPDATE request when #confirm-update is clicked
    document.getElementById("confirm-update").onclick = () => {

        let original_row = stripIntKeys(rows_selected[0]);
        let keys_original_row = Object.keys(original_row);
        let junk_passed = false;

        //The updated row we want:
        var updated_row = {};

        //We will iterate through original_row and insert the required keys
        //and the use update_inputs[] as the values
        for (var i = 0; i < keys_original_row.length; i++) {

            var newVal = (document.getElementById(update_inputs[i]).value == "NULL") ? null : document.getElementById(update_inputs[i]).value;
            console.log("Updating " + keys_original_row[i] + " = " + newVal);
            updated_row[keys_original_row[i]] = newVal;

        }

        //Next, remove the container and notify the user of the ongoing process
        $("#update-container").css({
            "display": "none"
        });

        sendMessage("Sent UPDATE request for 1 record. Please wait a moment");
        $.post(
            "php/update.php",
            updated_row,
            (res)=>{
                sendMessage("Response from $.post : " + JSON.stringify(res));
            }
        );

        //Update the row in the table as well. This can be done by accessing it through 
        //the id, which is the same as idstaging_labs in the row.
        console.log("Updating row " + rows_selected[0].idstaging_labs);
        table.row((parseInt(rows_selected[0].idstaging_labs)-1).toString()).data(updated_row).invalidate().draw();
        
    }

    //Send a CREATE request when the user clicks on #confirm-create
    document.getElementById("confirm-create").onclick = () => {

        //There are no limitations to how many elements we need to have selected
        //before we can create the item.

        //Next, we will iterate over global_data_keys[] and will construct a new object
        //to send to the server.
        var new_object = {};

        for (var i = 0; i < global_data_keys.length; i++) {
            new_object[global_data_keys[i]] = document.getElementById(create_inputs[i]).value;
        }

        //Now ask the server to create the row:
        $.post(
            "php/create.php",
            new_object,
            (res)=>{
                console.log("Response from $.post : " + JSON.stringify(res));
            }
        );

        sendMessage("Sent CREATE request for 1 record. Please wait a moment");

        //Create an id for the new row:
        var row_id = randomStr(12);

        $("#create-container").css({
            "display": "none"
        });

        //Add the new row to the table
        table.rows.add(new_object).draw();

    }


    //Show the registration page when the user clicks on #no-account:
    document.getElementById("no-account").onclick = () => {

        $("#login-title").html("Create your account")
        $("#confirm-password").css({
            "display": "block"
        });

        $("#login-button").html("Register");

        //We are now in registration mode
        login_mode = false;

    };

    //Either login or register the user when #login-button is clicked
    document.getElementById("login-button").onclick = () => {

        var email = $("#email").val();
        var opass = $("#password").val();
        var cpass = $("#confirm-password").val();

        if (login_mode) {

            //Otherwise we are in login mode.
            socket.emit("login-user", email, opass);

        } else {

            //We are in registration mode. Verify that the user's passwords are the same
            //then send the data off to the server.

            if (cpass !== opass) {
                $("#no-account").html("Your passwords do not match");
                $("#no-account").css({
                    "color": "red"
                });
            }

            socket.emit("create-account", email, opass);

        }

    }

});

socket.on("removeLoading", ()=>{ $("#loading-screen").fadeOut(); });
socket.on("removeLogin", ()=>{ $("#login").fadeOut(); });

//We will receive 'table-data' as soon as we connect to the server:
socket.on("table-data", (data) => {

    console.log("Received table data from node.js")

    //Globally keep track of the data we've received:
    table_data = data;

    //Grab a sample so we can know what the table headers will be:
    var data_keys = Object.keys(data[0]);
    var th_html = "<tr class='th-row'><th></th>";

    //Remember globally what keys we're working with. This won't change until the page refreshes
    global_data_keys = data_keys;

    //Populate the #table_create
    for (var i = 0; i < data_keys.length; i++) {

        let isOdd = (i % 2 == 0) ? " class='odd'" : "";

        //Generate a new input id:
        var input_id = randomStr(12);

        //Keep track of the id we just made:
        create_inputs.push(input_id);

        //While we're at it, also populate #table_create and #table_create
        $("#table_create").append(`
            <tr` + isOdd + `>
                <td>` + data_keys[i] + `</td>
                <td><input id="` + input_id + `" type="text" class="action-table-input" placeholder="Enter ` + typeof data[0][data_keys[i]] + `" /></td>
                <td>` + typeof data[0][data_keys[i]] + `</td>
            </tr>
        `);

    }/*
    
    //Populate the actual table itself
    for (var i = 0; i < data.length; i++) {

        //Generate an id for the current row:
        var row_id = randomStr(9);

        var isOdd = (i % 2 == 0) ? "" : " class='odd'";
        var td_html = "<tr id='" + row_id + "'" + isOdd + "><td><input type='checkbox' id='checkbox-" + row_id + "' /></td>"

        for (var j = 0; j < data_keys.length; j++) {
            td_html += "<td" + isOdd + ">" + data[i][data_keys[j]] + "</td>";
        }
        td_html += "</tr>";

        //Insert the HTML string into the actual HTML itself. So we can add event listeners
        //to it.
        $("#table").append(td_html);

        //Ensure we can make selections on the row
        addCheckboxEvent(row_id, data[i]);

    }*/

});


function clearSelections(){

    //clearSelections()
    //Clear all selections made by the user
    $("#row_selected").html("<a style='font-weight: bold'>" + (Object.keys(selected_rows_ids).length) + "</a> RECORD(S) SELECTED");
    $("#no_selected").html(Object.keys(selected_rows_ids).length);

    selected_rows_ids = {};

}

function randomStr(x) {

    //Generate a random string.
    //x => integer

    var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    var str = "";

    for (var i = 0; i < x; i++) {

        var isUppercase = Math.floor((Math.random() * 2) + 1);
        var y = alphabet[Math.floor(Math.random() * alphabet.length)];

        (isUppercase == 2) ? str += y.toUpperCase(): str += y;

    }

    return str;

}

function addCheckboxEvent(row_id, data) {

    //Select and unselect a row in the table when clicked.
    //Add event listenrs to the tables, so we can select them.
    document.getElementById(row_id).addEventListener("click", () => {

        //The checkbox associated with this row
        var checkbox = document.getElementById("checkbox-" + row_id);

        //checkbox.checked = !checkbox.checked;

        //Check if this row has already been selected:
        if (Object.keys(selected_rows_ids).includes(row_id)) {

            //If it has, then we want to remove it. Because we've already selected
            //this row, so the user wants to undo it.

            //Undo the checkbox:
            checkbox.checked = false;

            //Remove .row-selected from the row:
            $("#" + row_id).removeClass("row-selected");

            //Remove the row and its data from selected_rows_ids
            delete selected_rows_ids[row_id]

        } else {

            //Otherwise, the user wants to select it. So we should add it to selected_rows_ids first.
            selected_rows_ids[row_id] = data;

            //Then, check the checkbox:
            checkbox.checked = true;

            //Add .row-selected to the row:
            $("#" + row_id).addClass("row-selected");

        }

        $("#row_selected").html("<a style='font-weight: bold'>" + (Object.keys(selected_rows_ids).length) + "</a> RECORD(S) SELECTED");
        $("#no_selected").html(Object.keys(selected_rows_ids).length);


        //Also apply the different colour rules:

        //For DELETE
        if (Object.keys(selected_rows_ids).length > 0) {
            $("#delete").css({
                "color": "#fff"
            })
        } else {
            $("#delete").css({
                "color": "#bcbcbc"
            });
        }

        //For UPDATE
        if (Object.keys(selected_rows_ids).length == 1) {
            $("#update").css({
                "color": "#fff"
            });
        } else {
            $("#update").css({
                "color": "#bcbcbc"
            });
        }

    });

}

socket.on("reload", () => {
    window.location.reload()
});
socket.on("message", (msg, colour = "green") => {
    sendMessage(msg, colour);
});
socket.on("login-error", (msg) => {
    $("#no-account").html(msg);
    $("#no-account").css({
        "color": "red"
    });
});

socket.on("logged-in", (cookieVals) => {
    
    $("#login").fadeOut();

    $("#popups").append(`
    <div class="information" id="welcome-tab">
        <div class="information-icon cover"></div>
        <div class="information-title">Information</div>
        <div class="information-txt">Welcome to Staging Labs. Here you can Create, Read, Update, and Delete records from the database.<br>
        <br>Please note you can only perform an UPDATE operation on one record at a time. Though you can delete multiple records at once 
        </div>
    </div>`);

    setTimeout(()=>{ $("#welcome-tab").fadeOut(); }, 20000);

    setCookie("login", cookieVals.login, 1);
    setCookie("ident", cookieVals.ident, 1);

});

function sendMessage(msg, colour = "green") {

    //sendMessage()
    //Send a nice little message to the user. This is usually done when the server has something
    //it wants to say to the user.

    let time = new Date();
    let time_txt = time.getHours() + ":" + leadingZero(time.getMinutes()) + ":" + leadingZero(time.getSeconds());
    let popup_id = randomStr(12);

    //Check if we should paint the message red:
    var redClass = (colour == "red") ? " popup-red" : "";

    let popup_html = `
    <div class="popup` + redClass + `" id="` + popup_id + `">
        <div class="inline-middle">
            <div class="popup-time">` + time_txt + `</div>
            <div class="popup-title inline-middle">Response</div>                        
        </div>
        <!-- <div class="popup-icon cover inline-middle"></div> -->
        <div class="popup-contents">` + msg + `</div>
    </div>`;

    $("#popups").append(popup_html).hide().fadeIn();

    //Delay times (ms) to fade out and remove the pop up
    let fadeTime = 8000;
    let removeTime = 12000;

    if (colour == "red") {
        fadeTime == 15000;
        removeTime = 17000;
    }

    setTimeout(() => {
        $("#" + popup_id).fadeOut()
    }, fadeTime);

    setTimeout(() => {
        document.getElementById(popup_id).remove();
    }, removeTime);


}

function leadingZero(x) {

    //Add a leading zero to a number, if its < 10.
    //x => string

    if (x < 10) {
        return "0" + x;
    } else {
        return x;
    }

}

function modifyRow(type, row_id, row_data) {

    //modifyRow()
    //Modify a row in the table.
    //row_id => id of the element to be modified
    //row_data => JSON, data to be displayed in the table row

    var new_tr = "<td><input class='checkbox' type='checkbox' id='checkbox-" + row_id + "' checked/> </td>"
    var row_keys = Object.keys(row_data);

    console.log(row_data);

    for (var i = 0; i < row_keys.length; i++) {
        new_tr += "<td>" + row_data[row_keys[i]] + "</td>"
    }

    console.log(new_tr);

    if (type == "edit") {
        $("#" + row_id).html(new_tr);
    } else if (type == "prepend") {
        $("#table tr:first-child").after("<tr id='" + row_id + "'>" + new_tr + "</tr>");
    }

}

function stripIntKeys(data){

    //stripIntKeys()
    //data => json object
    //This function will strip all json entries in data that are integers/numbers
    
    var new_object  = {};
    var junk_passed = false;

    var data_keys = Object.keys(data);

    for (var i = 0; i < data_keys.length; i++){
        if (data_keys[i] == "idstaging_labs") junk_passed = true;
        if (!junk_passed) continue;
        new_object[data_keys[i]] = data[data_keys[i]];
    }

    return new_object;

}

function populateMainTable(data){
    
    //populateMainTable(data)
    //Populate the main table, #table

    $("#table").html("");
    clearSelections();

    //Grab a sample so we can know what the table headers will be:
    var data_keys = Object.keys(data[0]);
    var th_html = "<tr class='th-row'><th></th>";

    //Populate the header row
    for (var i = 0; i < data_keys.length; i++) {

        th_html += "<th>" + data_keys[i] + "</th>";
        var isOdd = (i % 2 == 0) ? "" : " class='odd'";

        //Give the input for #table_create an id and keep track of it in create_inputs[]
        var input_id = randomStr(12);
        create_inputs.push(input_id);

    }
    th_html += "</tr>";

    $("#table").append(th_html);

    //Populate the actual table itself
    for (var i = 0; i < data.length; i++) {

        //Generate an id for the current row:
        var row_id = randomStr(9);

        var isOdd = (i % 2 == 0) ? "" : " class='odd'";
        var td_html = "<tr id='" + row_id + "'" + isOdd + "><td><input type='checkbox' id='checkbox-" + row_id + "' /></td>"

        for (var j = 0; j < data_keys.length; j++) {
            td_html += "<td" + isOdd + ">" + data[i][data_keys[j]] + "</td>";
        }
        td_html += "</tr>";

        //Insert the HTML string into the actual HTML itself. So we can add event listeners
        //to it.
        $("#table").append(td_html);

        //Ensure we can make selections on the row
        addCheckboxEvent(row_id, data[i]);

    }

}

document.getElementById("signout").onclick = ()=>{
    
    $("#loading-screen").fadeIn();

    removeAllCookies();

    setTimeout(()=>{
        window.location.reload();
    }, 3000);

}

let removeAllCookies = ()=>{
    document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}