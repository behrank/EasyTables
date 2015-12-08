/*
 * File:        jquery.easyTables.js
 * Version:     1.0.0
 * Author:      Behran Kankul 
 * Info:        www.behrankankul.com
 * 
 * Copyright 2015 Behran Kankul, all rights reserved.
 */

(function (easyTables) {

	//Private language properties. 
	var datatableLengthMenuString = "Show: &nbsp; _MENU_ &nbsp;";
	var datatableZeroRecordString = "No record found";
	var datatableInfoString = " Total: _TOTAL_ | of: _START_ - _END_  ";
	var datatableInfoFilteredString = "(Total _MAX_  )";
	var datayablesearchString = "Search:";

    /*Private Definitions*/
    
    var oTable; //This is our table object

    //Only needed to generate different column names for table
	var alphabet = ["a", "b", "c", "d", "e", "f", "g","h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r","s","t","u","v","w","x","y","z"];
	var asInitVals = new Array();
    
    /*Private Methods*/
    //Generates column names for table
    function createColmArray(countOfArray) {
        var colmArray = [];

    	for (var i = 0; i < countOfArray; i++) {
	        var indx = Math.floor((Math.random() * alphabet.length) + 1);
            var colmName = alphabet[indx] + Math.floor((Math.random() * 1000) + 1);
            var obj = { sName: colmName };
	        colmArray.push(obj);
	    }
    	console.log("EasyTables: Column names initialized with " + colmArray.length + " items"); //just to make sure its happened : )
        return colmArray;
    }

    //Generates ajax data url for given url and parameters
    function generateSourceUrl(source, params) {

    	if (params.length > 0) {

    		var indx = 0;

	        for (var i = 0; i < params.length; i++) {
	        	if (i === 0) {
	        		source = source + "?";
	        	}
	        	var p = params[i];

	        	for (var key in p) {
	                if (p.hasOwnProperty(key)) {
	                    if (Object.prototype.hasOwnProperty.call(p, key)) {
	                        source = source + key + "=" + p[key];
	                    }
	                }
	            }
	            indx++;
	        	if (indx < params.length) {
	        		source = source + "&";
	        	}
	        }
        }
    	console.log("EasyTables: Source url prepared");
    	return source;
    }

    //Initializer for table by given properties
    function initWith(id, source, count, params, extensions) {

    	
        var elementId = "#" + id; // for element selection

        oTable = jQuery(elementId).dataTable({
			"sPaginationType": "full_numbers",
			"bSort": true,
			"bProcessing": true,
			"bSearchable": false,
			"aaSortingFixed": [[0, 'asc']],
			"bServerSide": true,
			"sAjaxSource": generateSourceUrl(source, params),
			"oLanguage": {
				"sProcessing": "",
				"sLengthMenu": datatableLengthMenuString,
				"sZeroRecords": datatableZeroRecordString,
				"sInfo": datatableInfoString,
				"sInfoEmpty": datatableZeroRecordString,
				"sInfoFiltered": datatableInfoFilteredString,
				"sInfoPostFix": "",
				"sSearch": datayablesearchString,
				"sUrl": "",
				"oPaginate": {
					"sFirst": "<<",
					"sPrevious": "<",
					"sNext": ">",
					"sLast": ">>"
				}
			},
			"aoColumns": createColmArray(count), // generates colmArray,
			"fnDrawCallback": extensions // Add your custom stuff before display data.
        });

        jQuery(".sptl input").keyup(function () {
            /* Filter on the column (the index) of this element */
            oTable.fnFilter(this.value, jQuery(".sptl input").index(this));
        });

        /*
         * Support functions to provide a little bit of 'user friendlyness' to the textboxes in
         * the footer
         */
        jQuery(".sptl input").each(function (i) {
            asInitVals[i] = this.value;

        });


        jQuery(".sptl input").focus(function () {
            if (this.className == "form-control input-sm") {
                this.className = "form-control input-sm";
                this.value = "";
            }
        });

        jQuery(".sptl input").blur(function (i) {
            if (this.value == "") {
                this.className = "form-control input-sm ";
                this.value = asInitVals[jQuery(".sptl input").index(this)];
            }
        });
        
        jQuery("#dyntable_filter").hide();
    }
	
    /* Public methods */

    //Creates a datatable with parameters
    easyTables.create = function (args) {
    	return initWith(args.elementId, args.Source, args.colmCount, args.params,args.extensions);
    }

    //Reloads datatable with current filter and page number
    easyTables.reload = function() {
        return oTable.fnFilterClear();
    }

    //Search on data
    easyTables.filter = function(key) {
        return oTable.fnFilter(key);
    }

    /*
        This module redraws current page with filters.
    */
    jQuery.fn.dataTableExt.oApi.fnStandingRedraw = function (oSettings) {
        //redraw to account for filtering and sorting
        // concept here is that (for client side) there is a row got inserted at the end (for an add)
        // or when a record was modified it could be in the middle of the table
        // that is probably not supposed to be there - due to filtering / sorting
        // so we need to re process filtering and sorting
        // BUT - if it is server side - then this should be handled by the server - so skip this step
        if (oSettings.oFeatures.bServerSide === false) {
            var before = oSettings._iDisplayStart;
            oSettings.oApi._fnReDraw(oSettings);
            //iDisplayStart has been reset to zero - so lets change it back
            oSettings._iDisplayStart = before;
            oSettings.oApi._fnCalculateEnd(oSettings);
        }

        //draw the 'current' page
        oSettings.oApi._fnDraw(oSettings);
    };

    jQuery.fn.dataTableExt.oApi.fnFilterClear = function (oSettings) {
        var i, iLen;

        /* Remove global filter */
        oSettings.oPreviousSearch.sSearch = "";

        /* Remove the text of the global filter in the input boxes */
        if (typeof oSettings.aanFeatures.f != 'undefined') {
            var n = oSettings.aanFeatures.f;
            for (i = 0, iLen = n.length ; i < iLen ; i++) {
                jQuery('input', n[i]).val('');
            }
        }

        /* Remove the search text for the column filters - NOTE - if you have input boxes for these
         * filters, these will need to be reset
         */
        for (i = 0, iLen = oSettings.aoPreSearchCols.length ; i < iLen ; i++) {
            oSettings.aoPreSearchCols[i].sSearch = "";
        }

        /* Redraw */
        oSettings.oApi._fnReDraw(oSettings);
    };

}(window.easyTables = window.easyTables || {}, jQuery));
