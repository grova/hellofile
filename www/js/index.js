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
   console.log(error.message);
}


function downloadFileChrome(remoteRef)
{
	var remoteFilePath = remoteRef.filePath;
	// nome file senza path
	var filename = remoteFilePath.substring(remoteFilePath.lastIndexOf('/')+1);

	window.webkitRequestFileSystem(window.PERSISTENT, 0, 
		function onFileSystemSuccess(fileSystem) 
		{
			var localPath = remoteRef.localPth;
			console.log("GOT fs");

			

			if (localPath == null)
			{
				// nuovo file mi devo cercare il path da solo
				fileSystem.root.getFile(
					"dummy.html", {create: true, exclusive: false}, 
					function gotFileEntry(fileEntry) 
					{
			    		localPath = fileEntry.fullPath.replace("dummy.html","");
			    		fileEntry.remove();
					},
					fail);
			}

		    //var uri = encodeURI("http://www.storci.com/pdf/products/vsfTVmix.pdf");
		    var uri = encodeURI(remoteFilePath);
		    console.log("start download");	
		    var fileTransfer = new FileTransfer();
		    fileTransfer.download(
				uri,
				sPath + filename,
				function(theFile) {
				    console.log("download complete: " + theFile.fullPath);
				    // download completato devo aggiornare il db locale



				},
				function(error) {
				    console.log("download error source " + error.source);
				    console.log("download error target " + error.target);
				    console.log("upload error code: " + error.code);
					}
			);
		}, 
		fail);
} 
 
// mi serve il riferimento dal server, quando ho scaricato il file aggiorno il riferimento locale 
function downloadFile(remoteRef)
{
	var remoteFilePath = remoteRef.filePath;
	// nome file senza path
	var filename = remoteFilePath.substring(remoteFilePath.lastIndexOf('/')+1);

	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
		function onFileSystemSuccess(fileSystem) 
		{
			var localPath = remoteRef.localPth;
			console.log("GOT fs");

			

			if (localPath == null)
			{
				// nuovo file mi devo cercare il path da solo
				fileSystem.root.getFile(
					"dummy.html", {create: true, exclusive: false}, 
					function gotFileEntry(fileEntry) 
					{
			    		localPath = fileEntry.fullPath.replace("dummy.html","");
			    		fileEntry.remove();
					},
					fail);
			}

		    //var uri = encodeURI("http://www.storci.com/pdf/products/vsfTVmix.pdf");
		    var uri = encodeURI(remoteFilePath);
		    console.log("start download");	
		    var fileTransfer = new FileTransfer();
		    fileTransfer.download(
				uri,
				sPath + filename,
				function(theFile) {
				    console.log("download complete: " + theFile.fullPath);
				    // download completato devo aggiornare il db locale



				},
				function(error) {
				    console.log("download error source " + error.source);
				    console.log("download error target " + error.target);
				    console.log("upload error code: " + error.code);
					}
			);
		}, 
		fail);
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

 
 //per uscire dalla loading page nel browser, premere ESC
$(document).keydown(function(e){
	if (e.keyCode == 27) { 
	   app.receivedEvent('deviceready');
	   return false;
	}
});

 
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
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {				
		$("body").pagecontainer("change", "#homepage");
        console.log('Received Event: ' + id);
    },
    
       
    
    
    
    currentList: null,	// ci salvo il json locale

    toDownloadList: null,
    
    
    loadJson: function()
    {
		var supported = false;

		var localdb = null;
		
		
		if (typeof(localStorage) == "undefined" )
		{
			console.log("Your browser does not support HTML5 localStorage. Try upgrading.");
		}
		else
		{
			console.log("localstorage OK");
			//this.currentList = localStorage.getItem("prevDocList");
			if (this.currentList != null)
			{
				console.log(this.currentList);
				try
				{
					localdb = $.parseJSON(this.currentList);
				}
				catch(err)
				{
					console.log("error parsing local json");
					localdb = null;
				}
			}
			supported = true;
		}
		
		this.toDownloadList = new Array();	// qui ci metto quelli da scaricare


		// indirizzo del file json
		//var url = "http://www.storci.com/dbfwver.txt";
		var url = "https://dl.dropboxusercontent.com/u/48127483/dbfwver.txt";

		// se ci fossero problemi di crossdomain
		//$.getJSON(url + "?callback=?", null, function(tweets) {
		console.log("loading "+url);
		var jqxhr = $.getJSON(url , null, function(data) 
		{
			// ho scaricato la lista remota, ora devo fare i confronti per vedere quali scaricare
			// la lista remota e' <data>

			// scorro la lista remota
			for (var i=0; i<data.length;i++)
			{
				// guardo se ce l'ho
				// se e' lento si sortera'
				var found = false;
				if (localdb != null)
				{
					for (var i1=0;i1<localdb.length;i1++)
					{
						if (data[i].fileid == localdb[i1].fileid)
						{
							found = true;
							// trovato
							// guardo se e' aggiornato
							if (data[i].revision > localdb[i1].revision)
							{
								// lo devo scaricare
								data[i].localPath = localdb[i1].localPath;	// cosi' lo sostituisco
								data[i].localIndex = i1;	// cosi' lo sostituisco
								// this non e' visibile qui dentro devo usare app
								app.toDownloadList.push(data[i]);
								break;	// prossimo
							}
						}	
					}
				}
				if (!found)
				{
					// non ce l'ho
					// da scaricare
					data[i].localPath = null;	// cosi' lo creo
					data[i].localIndex = -1;	// cosi' lo creo
					app.toDownloadList.push(data[i]);
				}
			}

			

			// nella lista toDownloadList ho aggiungo i campi localPtah e localIndex per aggiornare il db locale 
			// nel momento in cui il file remoto viene downloadato con successo

			/*
			if (supported)
			{
				localStorage.setItem("prevDocList",JSON.stringify(data));
			}
			console.log(data);
			console.log("stringificato");
			console.log(JSON.stringify(data));
			*/
			
			
		});
		jqxhr.error(function(){concole.log("error")});
	}
    
}




