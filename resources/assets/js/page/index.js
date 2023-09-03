$.noConflict();
jQuery(document)
    .ready(function() {
    	
    	//fix for safari browser back button behaviour
    	jQuery(window).bind("pageshow", function(event) {
    	    if (event.originalEvent.persisted) {
    	        window.location.reload() 
    	    }
    	});
    	
    	var documentLoad = Date.now();
        var tracker = new Tracker();
        var selectedPrinterModel = "";
        var printerModel = "";
        var localePath = document.getElementById('localePath').value;
        var openCLC = window.location.search.replace(/.*openCLC=/, '');
        var printerImageUrl = document.getElementById('printers-image').src;
        
        if(navigator.userAgent.toLowerCase().indexOf("trident") != -1) {
        	jQuery("#printer-searchlist").val("");
        }
        
        var redirectPage = function(url) {
        	selectedPrinterModel = "";
            window.location.href = url;
        }
        
        var invokePrinterUrl = function() {
            var url = localePath + "/devices/" + selectedPrinterModel.toLowerCase();
            /*trackMetrics( 'beginSetup', { search: { sitesearch: { keyword: selectedPrinterModel, type: '123hpcom_beginbutton.click' } } } );*/
            tracker.send({
	        	link: "click_begin_button_" + selectedPrinterModel.toLowerCase(),
	        	page: "click_begin_button_" + selectedPrinterModel.toLowerCase(),
	        	events: ["beginButton.click"]
	        });
            
  		  	ga('send', 'event', 'click_begin_button_' + selectedPrinterModel.toLowerCase(), 'beginButton.click', 'click_begin_button_' + selectedPrinterModel.toLowerCase());
  		  
  		  	setTimeout(redirectPage(url), 500);
        }
        
        var otherPrinterDownloadingSW = function() {
            var url = localePath + "/devices/" + selectedPrinterModel.toLowerCase() + "/downloading";
            /*trackMetrics( 'beginSetup', { search: { sitesearch: { keyword: selectedPrinterModel, type: '123hpcom_beginbutton.click' } } } );*/
            tracker.send({
	        	link: "click_begin_button_" + selectedPrinterModel.toLowerCase(),
	        	page: "click_begin_button_" + selectedPrinterModel.toLowerCase(),
	        	events: ["beginButton.click"]
	        });
            ga('send', 'event', 'click_begin_button_' + selectedPrinterModel.toLowerCase(), 'beginButton.click', 'click_begin_button_' + selectedPrinterModel.toLowerCase());
            
            setTimeout(redirectPage(url), 500);
        }
        
        jQuery("#btn-begin-link").on("click", function() {
        	var timeSinceLoad = Date.now();
        	if(typeof(performance) !== 'undefined' && typeof(performance.now) !== 'undefined'){
        		 timeSinceLoad = Math.ceil(performance.now());
        	} else {
        		timeSinceLoad -= documentLoad; 
        	}
        	ga('send','timing','Search Page','search button interaction', timeSinceLoad);
        	if(selectedPrinterModel.toLowerCase().indexOf("other") != -1) {
        		otherPrinterDownloadingSW();
        	}
        	else if (selectedPrinterModel != "") {
        		invokePrinterUrl();
        	}
        });
        
	    function matchFound(item, query) {
	    	  
	      	var inputTokens = query.split(" ");
	
	        for (i = 0; i < inputTokens.length; i++) {
	        	if (item.toLowerCase().indexOf(inputTokens[i].toLowerCase()) == -1) {
	        		return false;
	        	}
	        }
	        return true;
	    }
	    
	    var deviceNamesList = deviceNamesJson['data'];
	    var series = [];
	    var derivatives = [];
	    
        for (i = 0; i < deviceNamesList.length; i++) {
        	if (deviceNamesList[i].toLowerCase().indexOf("series") > -1) {
        		series.push(deviceNamesList[i]);
        	} else {
        		derivatives.push(deviceNamesList[i]);
        	}
        }
          
        jQuery.typeahead({
            input: "#printer-searchlist",
            searchOnFocus: true,
            debug: false,
            maxItem: 10,
            highlight: true,
            order: "asc",
            groupOrder: [ "series", "derivatives" ],
            source: {
                series: { 
                	data: function () { 
                		return series;
                    }
                },
                derivatives: { 
                	data: function () { 
                        return derivatives;
                	}
                }
            },
            filter: function (item, displayKey) {
                return matchFound(displayKey, this.query);
            },
        	callback: {
	            onSubmit: function(node, form, item, event) {
	            	if(selectedPrinterModel.toLowerCase().indexOf("other") != -1) {
	            		otherPrinterDownloadingSW();
	            	}
	            	else if (selectedPrinterModel != "") {
		        		invokePrinterUrl();
	            	}
	            	else {
	            		var searchField = jQuery('#printer-searchlist');
	            		searchField.focus();
	            		searchField.trigger('input.typeahead');
	            	}
	            },
	            onClick: function(node, a, item, event){
	            	var deviceIndex = -1;
	            	printerModel = item.display;
	            	var deviceNamesList = deviceNamesJson['data'];
	            	 for (var i = 0; i < deviceNamesList.length; i++) {
	                     if (printerModel == deviceNamesList[i]) {
	                         deviceIndex = i;
	                         break;
	                     }
	                 }
	
	                 if (printerModel.indexOf('*') >= 0) {
	                     printerModel = printerModel.substring(0, printerModel.indexOf('*'));
	                 }
	                 jQuery('#btn-begin').prop('disabled', false);
	                 jQuery(".printer-model").html(printerModel);
	                 selectedPrinterModel = deviceIds[deviceIndex];
	                 
	                 
	                 jQuery.ajax({
	                     type: "GET",
	                     url: "/dev/api/v1/devices/" + selectedPrinterModel,
	                     data: {
	                         "rURL": window.location.href
	                     },
	                     dataType: "json"
	                 }).done(function(data) {
	                     jQuery("#btn-begin").addClass("active-btn");
	                     jQuery('.welcome-selected-printer').attr('src', data.imageUrl);
	                     if (selectedPrinterModel == "HP LaserJet Printers" ||
	                     	selectedPrinterModel.toLowerCase().indexOf("pagewide") != -1 ||
	                     	selectedPrinterModel.toLowerCase().indexOf("other") != -1) {
	                         jQuery('#ljAlertMessage').html("*" + data.deviceText);
	                     } else {
	                         jQuery('#ljAlertMessage').html("&nbsp;");
	                     }
	                 }).fail(function() {
	                     // Error handling
	                 });
	            },
	            onResult: function(node, query, result, resultCount) {
	                if (resultCount == 1) {
	                    printerModel = result[0].display;
	                    var deviceIndex = -1
	                    var deviceNamesList = deviceNamesJson['data'];
	
	                    for (var i = 0; i < deviceNamesList.length; i++) {
	                        if (printerModel == deviceNamesList[i]) {
	                            deviceIndex = i;
	                            break;
	                        }
	                    }
	
	                    if (printerModel.indexOf('*') >= 0) {
	                        printerModel = printerModel.substring(0, printerModel.indexOf('*'));
	                    }
	                    jQuery('#btn-begin').prop('disabled', false);
	                    jQuery(".printer-model").html(printerModel);
	                    selectedPrinterModel = deviceIds[deviceIndex];
	                    
	                    
	                    jQuery.ajax({
	                        type: "GET",
	                        url: "/dev/api/v1/devices/" + selectedPrinterModel,
	                        data: {
	                            "rURL": window.location.href
	                        },
	                        dataType: "json"
	                    }).done(function(data) {
	                        jQuery("#btn-begin").addClass("active-btn");
	                        jQuery('.welcome-selected-printer').attr('src', data.imageUrl);
	                        if (selectedPrinterModel == "HP LaserJet Printers" ||
	                        	selectedPrinterModel.toLowerCase().indexOf("pagewide") != -1 ||
	                        	selectedPrinterModel.toLowerCase().indexOf("other") != -1) {
	                            jQuery('#ljAlertMessage').html("*" + data.deviceText);
	                        } else {
	                            jQuery('#ljAlertMessage').html("&nbsp;");
	                        }
	                    }).fail(function() {
	                        // Error handling
	                    });
	                }
	                else {
	                	jQuery('#btn-begin').prop('disabled', true);
	                    jQuery("#btn-begin").removeClass("active-btn");
	                    jQuery('#ljAlertMessage').html("&nbsp;");
	                    selectedPrinterModel = "";

	                    jQuery('.welcome-selected-printer').attr('src', printerImageUrl);
	                }
	            }
        	}
        });

        jQuery("#device-not-listed").on("click", "a", function() {
            tracker.send({
            	link: "click_other-printers",
            	page: "click_other-printers",
            	events: ["deviceNotListed.click"]
            });
            ga('send', 'event', 'click_other-printers', 'deviceNotListed.click', 'click_other-printers');
        });
        
        jQuery("#printerlist-container2").on("click", "a", function() {
            tracker.send({
            	link: "click_download_button_laserjet-pagewide",
            	page: "click_download_button_laserjet-pagewide",
            	events: ["downloadButton.click"]
            });
            ga('send', 'event', 'click_download_button_laserjet-pagewide', 'downloadButton.click', 'click_download_button_laserjet-pagewide');
            /*trackMetrics( 'beginSetup', { search: { sitesearch: { keyword: "nodevice_selected", type: '123hpcom_mainpage_gethelp.click' } } } );*/
        });
    });

jQuery(window).load(function() {
	checkCLC();
});