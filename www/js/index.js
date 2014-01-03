/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


function fail(error)
{
   console.log(error.code);
} 
 
function downloadFile()
{
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
		function onFileSystemSuccess(fileSystem) 
		{
			console.log("GOT fs");
			fileSystem.root.getFile(
			"dummy.html", {create: true, exclusive: false}, 
			function gotFileEntry(fileEntry) {
			    var sPath = fileEntry.fullPath.replace("dummy.html","");
			    var fileTransfer = new FileTransfer();
			    fileEntry.remove();
			    var uri = encodeURI("http://www.storci.com/pdf/products/vsfTVmix.pdf");
			    console.log("start download");	
			    fileTransfer.download(
				uri,
				sPath + "theFile.pdf",
				function(theFile) {
				    console.log("download complete: " + theFile.fullPath);
				},
				function(error) {
				    console.log("download error source " + error.source);
				    console.log("download error target " + error.target);
				    console.log("upload error code: " + error.code);
				}
			);
			}, fail);
		}, fail);
}

function pgDownload()
{
	var filePath = "file:///mnt/sdcard/theFile.pdf";
	var fileTransfer = new FileTransfer();
	console.log("filetransfer "+fileTransfer);
	var uri = encodeURI("http://www.storci.com/pdf/products/vsfTVmix.pdf");

	fileTransfer.download(
	    uri,
	    filePath,
	    function(entry) {
		console.log("download complete: " + entry.fullPath);
	    },
	    function(error) {
		console.log("download error source " + error.source);
		console.log("download error target " + error.target);
		console.log("upload error code" + error.code);
	    },
	    true
	);
} 

 
 
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
	
	this.test();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    
    // metto qui le cose da testare
    test: function()
    {
	console.log("loadjson");
	//pgDownload();
	this.loadJson();
    },
    
    test1: function()
    {
	console.log("test");
	downloadFile();
    },
    
    
    
    currentList:"",	// ci salvo il json
    
    
    loadJson: function()
    {
	var supported = false;
	
	
	if (typeof(localStorage) == "undefined" )
	{
		console.log("Your browser does not support HTML5 localStorage. Try upgrading.");
	}
	else
	{
		console.log("localstorage OK");
		this.currentList = localStorage.getItem("prevDocList");
		console.log(currentList);
		supported = true;
	}
	
		
	// indirizzo del file json
	var url = "https://www.storci.com/dbfwver.txt";

	// se ci fossero problemi di crossdomain
	//$.getJSON(url + "?callback=?", null, function(tweets) {
	console.log("loading "+url);
	var jqxhr = $.getJSON(url , null, function(data) {
		if (supported)
		{
			localStorage.setItem("prevDocList",JSON.stringify(data));
		}
		console.log(data);
		console.log("stringificato");
		console.log(JSON.stringify(data));
		
		
	    });
	jqxhr.error(function(){concole.log("error")});
    }
    
}




