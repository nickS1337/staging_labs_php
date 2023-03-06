<!DOCTYPE HTML>
<html lang="en">

<head>
    
    <!-- <script src="jquery.min.js"></script>
    <script src="jquery-ui.js"></script>
    <script src="jquery-ui.min.js"></script> -->
    <script src="http://127.0.0.1:27015/socket.io/socket.io.js"></script>

    <!-- Datatables Scripts -->
    <script src="https://code.jquery.com/jquery-3.5.1.js"></script>
    <script src="https://cdn.datatables.net/1.13.1/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.3.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/select/1.5.0/js/dataTables.select.min.js"></script>
    <script src="https://cdn.datatables.net/datetime/1.2.0/js/dataTables.dateTime.min.js"></script>
    <script src="js/dataTables.editor.min.js"></script>
    <!-- <script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.13.1/js/jquery.dataTables.js"></script> -->

    <!-- Datatables Stylesheets -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.1/css/jquery.dataTables.min.css"/>
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.3.2/css/buttons.dataTables.min.css"/>
    <link rel="stylesheet" href="https://cdn.datatables.net/select/1.5.0/css/select.dataTables.min.css"/>
    <link rel="stylesheet" href="https://cdn.datatables.net/datetime/1.2.0/css/dataTables.dateTime.min.css"/>
    <link rel="stylesheet" href="css/editor.dataTables.min.css"/>

    <link rel="stylesheet" href="stylesheet.css">
    <link rel="stylesheet" href="table.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https//fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&family=Roboto+Mono:wght@200;300;400&family=Roboto:wght@300;400&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="loading-animation.css" />

    <?php
    
    #Include the table header populating function
    include("./php/populate_header.php");

    ?>
    
</head>

<body>

    <div id="loading-screen">
        <div id="loading-screen-inner">
            <div class="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <div id="loading-title">STAGING LABS</div>
            <div id="loading-subtitle">Loading, please wait.</div>
        </div>
    </div>

    <div id="login">

        <div id="login-inner">

            <div id="login-title">Welcome!</div>
        
            <input id="email" placeholder="Email Address" type="text" class="login-input action-table-input" />
            <input id="password" placeholder="Password    " type="password" class="login-input action-table-input" />
            <input id="confirm-password" placeholder="Confirm Password" type="password" class="login-input action-table-input middle" />
        
            <div id="login-button">Login</div>
        
            <div id="no-account" class="middle">I don't have an account</div>

        </div>

    </div>

    <div id="popups">
        <!-- <div class="popup">
            <div class="inline-middle">
                <div class="popup-time">9:05 PM</div>
                <div class="popup-title inline-middle">Response</div>                        
            </div>
            <div class="popup-contents"></div>
        </div> -->
        <!-- <div class="popup-icon cover inline-middle"></div> -->
    </div>

    <div class="wallpaper cover">
        <div class="wallpaper-inner"></div>
    </div>

    <!-- <div class="information inline-middle" id="todo-list">
        <div class="information-icon cover"></div>
        <div class="information-title">Todo List</div>
        <div class="information-txt">
            - Additional protection against incoming data on backend<br>
            - Sort rows<br>
            - Persistent database changes<br>
            - Nice pattern in background (if we got time)<br>
            - Custom scrollbar<br>
        </div>
    </div> -->

    <div id="navbar">
 
        <div id="navbar-left">
            <div id="db-icon" class="inline-middle cover"></div>
            <div id="app-name" class="inline-middle">
                <div id="app-title">MyGene CRUD</div>
                <div id="app-author">by Nicholas Smith</div>
            </div>
        </div>
        <div id="navbar-right">

            <div class="inline-middle" style="text-align: right;">

                <div id="list-actions">
                    <div class="action inline-middle" id="create">CREATE</div>
                    <div class="action inline-middle" id="update">UPDATE</div>
                    <div class="action inline-middle" id="delete">DELETE</div>
                </div>

                <div id="row_selected">NO RECORD(S) SELECTED</div>

            </div>

            <div id="signout" class="inline-middle">
                <div id="signout-text" class="inline-middle">SIGNOUT</div>
                <div id="signout-icon" class="inline-middle cover"></div>
            </div>

        </div>

    </div>

    <div id="crud-container">

        <div id="crud-title">STAGING LABS</div>
        <div id="no-records">Version 2</div>

        <!-- <div id="filters" class="information">
            <div id="filters-txt">Filters</div>
            <div>
                <div class="filter inline-middle">
                    <div class="filter-txt">SORT BY</div>
                    <select class="action-table-input login-input" id="sort_by">
                    </select>
                </div>
                <div class="filter inline-middle">
                    <div class="filter-txt">ORDER</div>
                    <select class="action-table-input login-input" id="order">
                        <option value="descending">Descending</option>
                        <option value="ascending">Ascending</option>
                    </select>
                </div>
            </div>
        </div> -->

        <table id="table"></table>
        <table id="users_table">

        </table>
        <table id="datatable">
            <thead>
               <?php retrieveTableHeader("staging_labs"); ?> 
            </thead>
            <tbody></tbody>    
        </table>
        
    </div>

    <div class="action-fullscreen" id="create-container">

        <div class="action-fullscreen-outer" ></div>
        <div class="action-fullscreen-contents">

            <div class="action-fullscreen-title">CREATE</div>

            <div class="action-fullscreen-table-container">
                <table class="action-fullscreen-table" id="table_create">
                    <tr class="action-table-th">
                        <th>COLUMN</th>
                        <th>ROW</th>
                        <th>Type</th>    
                    </tr>
                    <!-- <tr>
                        <td>IDSTAGING_LABS</td>
                        <td><input type="text" class="action-table-input" value="Test" /></td>
                        <td>TEST</td>
                    </tr> -->
                </table>
            </div>

            <br>

            <div>
                <div class="button inline-middle" style="background-color: rgb(26 181 18);" id="confirm-create">
                    <div class="button-icon inline-middle cover" style="background-image: url('pics/save.png')"></div>
                    <div class="button-text inline-middle">Create new record</div>
                </div>
                <div class="button inline-middle" style="margin-right: 0px; background-color: rgb(165 2 2)" id="exit-create">
                    <div class="button-icon inline-middle cover" style="background-image: url('pics/x.png')"></div>
                    <div class="button-text inline-middle">Exit without changes</div>
                </div>
            </div>
            <!-- <div class="action-fullscreen-description" style="color: #ccc; font-size: 16px; cursor: pointer;" id="exit-create">Exit without changes</div> -->

        </div>

    </div>

    <div class="action-fullscreen" id="update-container">

        <div class="action-fullscreen-outer" ></div>
        <div class="action-fullscreen-contents">

            <div class="action-fullscreen-title">UPDATE</div>

            <div class="action-fullscreen-table-container">
                <table class="action-fullscreen-table" id="table-update">
                    <tr class="action-table-th">
                        <th>COLUMN</th>
                        <th>ROW</th>
                        <th>Type</th>    
                    </tr>
                    <!-- <tr>
                        <td>IDSTAGING_LABS</td>
                        <td><input type="text" class="action-table-input" value="Test" /></td>
                        <td>TEST</td>
                    </tr> -->
                </table>
            </div>

            <br>

            <div>
                <div class="button inline-middle" style="background-color: rgb(26 181 18);" id="confirm-update">
                    <div class="button-icon inline-middle cover" style="background-image: url('pics/save.png')"></div>
                    <div class="button-text inline-middle">Save changes</div>
                </div>
                <div class="button inline-middle" style="margin-right: 0px; background-color: rgb(165 2 2)" id="exit-update">
                    <div class="button-icon inline-middle cover" style="background-image: url('pics/x.png')"></div>
                    <div class="button-text inline-middle">Exit without changes</div>
                </div>
            </div>
            <!-- <div class="action-fullscreen-description" style="color: #ccc; font-size: 16px; cursor: pointer;" id="exit-create">Exit without changes</div> -->

        </div>

    </div>

    <div class="action-fullscreen" id="delete-container">

        <div class="action-fullscreen-outer" ></div>
        <div class="action-fullscreen-contents">

            <div class="action-fullscreen-title">DELETE</div>

            <div class="action-fullscreen-description" id="no_delete">You have selected <a style="font-weight: bold" id="no_selected">X</a> record(s)</div>
            <div class="action-fullscreen-description" style="font-weight: bold;">Are you sure you wish to permanently delete them?</div>

            <div style="margin-top: 45px;">
                <div class="button inline-middle" style="background-color: rgb(26 181 18);" id="confirm-delete">
                    <div class="button-icon inline-middle cover" style="background-image: url('pics/tick.png')"></div>
                    <div class="button-text inline-middle">Confirm deletion</div>
                </div>
                <div class="button inline-middle" style="margin-right: 0px; background-color: rgb(165 2 2)" id="exit-delete">
                    <div class="button-icon inline-middle cover" style="background-image: url('pics/x.png')"></div>
                    <div class="button-text inline-middle">Exit without changes</div>
                </div>
            </div>

        </div>

    </div>

</body>

<script src="neoscripts.js"></script>
<script src="scripts.js"></script>

</html>