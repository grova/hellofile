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


function simulateFS(remoteRef)
{
	var remoteFilePath = remoteRef.filePath;
	// nome file senza path
	var filename = remoteFilePath.substring(remoteFilePath.lastIndexOf('/')+1);

	var localPath = remoteRef.localPath;
	console.log("simulate fs");

	if (localPath == null)
	{
		console.log("nuovo file mi devo cercare il path da solo")
		// nuovo file mi devo cercare il path da solo
		localPath = "fake://";
	}

    var uri = encodeURI(remoteFilePath);
    console.log("start download of " + remoteFilePath);
    console.log("to " + localPath + filename);	

    //console.log("download complete: " + theFile.fullPath);
    remoteRef.localPath = localPath + filename;
    // download completato devo aggiornare il db locale

    if (remoteRef.localIndex == -1)
    {
    	// nuovo record
    	if (app.localdb == null)
    	{
    		app.localdb = new Array();
    	}
    	app.localdb.push(remoteRef);

    }
    else
    {
    	app.localdb[remoteRef.localIndex] = remoteRef;
    }
    app.saveLocalDb();
}


function downloadFileChrome(remoteRef)
{
	var remoteFilePath = remoteRef.filePath;
	// nome file senza path
	var filename = remoteFilePath.substring(remoteFilePath.lastIndexOf('/')+1);

	window.webkitRequestFileSystem(window.PERSISTENT, 0, 
		function onFileSystemSuccess(fileSystem) 
		{
			var localPath = remoteRef.localPath;
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
				localPath + filename,
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
		simulateFS(remoteRef)
		);
} 


function fileSystemTest()
{
	window.resolveLocalFileSystemURI("file:///example.txt",
		function onSuccess(fileEntry)
		{
			console.log(fileEntry.name);
		},
		function fail(error)
		{
			console.log(error.code);
		});
}


function getGlobalPath(relativePath,_success,_fail)
{
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
		function onFileSystemSuccess(fileSystem) 
		{
			console.log("GOT fs");
			console.log("relativepath:" + relativePath);
			console.log("chiedo il path a FS");
				// nuovo file mi devo cercare il path da solo
			fileSystem.root.getFile(
				"dummy.html", {create: true, exclusive: false}, 
				function gotFileEntry(fileEntry) 
				{
					console.log("fileentry: " + fileEntry.fullPath);
			    	var localPath = fileEntry.fullPath.replace("dummy.html","");
					fileEntry.remove();
					var retvalue = localPath + relativePath;
					console.log("globalpath:"+retvalue);
					_success(retvalue);
				},
				function fail(error)
				{
					console.log("getglobalpath fail:"+error.code);
					_fail(error);
				});
		},
		function fail(error)
		{
			console.log("requestfilesystem fail"+error.code);
			_fail(error);
		}
		);
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
			var localPath = remoteRef.localPath;
			console.log("GOT fs");
			console.log("localpath:" + localPath);

			if (localPath == null)
			{
				console.log("chiedo il path a FS");
				// nuovo file mi devo cercare il path da solo
				fileSystem.root.getFile(
					"dummy.html", {create: true, exclusive: false}, 
					function gotFileEntry(fileEntry) 
					{
						console.log("fileentry: " + fileEntry.fullPath);
			    		localPath = fileEntry.fullPath.replace("dummy.html","");
			    		fileEntry.remove();


						var uri = encodeURI(remoteFilePath);
					    console.log("start download of " + remoteFilePath);
					    console.log("to " + localPath + filename);	
					    var fileTransfer = new FileTransfer();
					    fileTransfer.download(
							uri,
							localPath + filename,
							function(theFile) {
							    console.log("download complete: " + theFile.fullPath);
							    // download completato devo aggiornare il db locale
							    remoteRef.localPath = localPath + filename; 

							    if (remoteRef.localIndex == -1)
							    {
							    	// nuovo record
							    	if (app.localdb == null)
							    	{
							    		app.localdb = new Array();
							    	}
							    	app.localdb.push(remoteRef);

							    }
							    else
							    {
							    	app.localdb[remoteRef.localIndex] = remoteRef;
							    }
							    app.saveLocalDb();
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
		
		//se premo back button nella homepage dell'app, la quitto, invece di andare back in history (default)
		document.addEventListener("backbutton", function(e){
			if($.mobile.activePage.is('#homepage')){
				e.preventDefault();
				navigator.app.exitApp();
			}
			else {
				navigator.app.backHistory()
			}
		}, false);

    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');	
        this.initLocalDb();	
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {				
		$("body").pagecontainer("change", "#homepage");
        console.log('Received Event: ' + id);
    },
    
       
    currentList: null,	// ci salvo il db locale in json

    toDownloadList: null,  

    localdb: null,	// db locale (object)

    isLocalStorageSupported: function()
    {
    	if (typeof(localStorage) == "undefined" )
    	{
    		return false;
    	}
    	return true;
    },

    initLocalDb: function () 
    {
    	if (!this.isLocalStorageSupported())
		{
			console.log("Your browser does not support HTML5 localStorage. Try upgrading.");
		}
		else
		{
			console.log("localstorage OK");
			isLocalStorageSupported = true;
			this.currentList = localStorage.getItem("prevDocList");
			if (this.currentList != null)
			{
				console.log(this.currentList);
				try
				{
					this.localdb = $.parseJSON(this.currentList);
				}
				catch(err)
				{
					console.log("error parsing local json");
					this.localdb = null;
				}
			}
		}
    },


    saveLocalDb: function()
    {
    	if (this.isLocalStorageSupported())
    	{
    		localStorage.setItem("prevDocList",JSON.stringify(this.localdb));
			
			console.log("stringificato");
			console.log(JSON.stringify(this.localdb));
    	}
    },
    
    
    loadJson: function()
    {
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
				if (app.localdb != null)
				{
					for (var i1 = 0; i1 < app.localdb.length; i1++)
					{
						if (data[i].fileid == app.localdb[i1].fileid)
						{
							found = true;
							// trovato
							// guardo se e' aggiornato
							if (data[i].revision > app.localdb[i1].revision)
							{
								// lo devo scaricare
								data[i].localPath = app.localdb[i1].localPath;	// cosi' lo sostituisco
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

			console.log("file(s) to download: " + app.toDownloadList.length)

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
		jqxhr.error(function(){console.log("error")});
	},

	loadFirstFile : function(location)
	{
		if (this.localdb != null)
		{
			if (this.localdb.length>0)
			{
				var filenametot = this.localdb[0].localPath;
				var filename = filenametot.substring(filenametot.lastIndexOf('/')+1);
				getGlobalPath(filename,
					function success(global)
					{
						console.log("provo ad aprire:" + global);
						var ref;
						if (location == true)
						{
							ref = window.open(global,'_blank','location=yes');
						}
						else
						{
							ref = window.open(global,'_blank','location=no');
						}
						
						ref.addEventListener('loaderror',
							function()
							{
								console.log("error loading:" + global);
							}

							);

					},
					function fail(error)
					{

					}
					);
			}
		}
	}
    
}




