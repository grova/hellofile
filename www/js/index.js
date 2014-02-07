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


var loadingStatus = 
{
	m_percent: 0,

	setPercentage: function (x)
	{
		this.m_percent = x;
	},
	increment: function()
	{
		if (this.m_percent<1)
		{
			this.m_percent += .01;
		}
	},
	log: function()
	{
		console.log(this.m_percent);
	}
}

 
var app = 
{
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
    	console.log("add event listener")
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
        app.initLocalDb();					// carica il db dal localstorage
        app.mainIntegrityCheck(	// ne controlla l'itegrita' e inizializza il path della root del filesystem
        	function()			// e quando ha finito inizializza l'interfaccia
        	{
        			
        	}
        );
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {				
		$("body").pagecontainer("change", "#homepage");
        console.log('Received Event: ' + id);
    },
	
	//exit app code
	exitapp: function(){
		console.log('Exit request! Quit');
		navigator.app.exitApp();
		},
    
       
    currentList: null,	// ci salvo il db locale in json

    toDownloadList: null,  

    localGroupList: null,	// db locale, lista dei gruppi
    localdb: null,	// db locale (object)

    isLocalStorageSupported: function()
    {
    	if (typeof(localStorage) == "undefined" )
    	{
    		return false;
    	}
    	return true;
    },

    // inizializzo il db, lo carico da localstorage
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
			
			// grouplist
			this.currentGroupList = localStorage.getItem("prevGroupList");
			if (this.currentGroupList != null)
			{
				console.log(this.currentGroupList);
				try
				{
					this.localGroupList = $.parseJSON(this.currentGroupList);
				}
				catch(err)
				{
					console.log("error parsing grouplist");
					this.localGroupList = null;
				}
			}

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

    // salvo il db corrente su localstorage
    saveLocalDb: function()
    {
    	if (this.isLocalStorageSupported())
    	{
    		localStorage.setItem("prevDocList",JSON.stringify(this.localdb));
    		localStorage.setItem("prevGroupList",JSON.stringify(this.localGroupList));

			
			console.log(JSON.stringify(this.localdb));
			console.log(JSON.stringify(this.localGroupList));
    	}
    },
    
    // carico i file json dal server (cablato)
    // e crea la lista dei file da scaricare, quelli non aggiornati
    loadJson: function()
    {
		this.toDownloadList = new Array();	// qui ci metto quelli da scaricare


		// indirizzo del file json
		//var url = "http://www.storci.com/dbfwver.txt";
		//var url = "https://dl.dropboxusercontent.com/u/48127483/storci/filelist.txt";
		var url = "http://www.storci.com/filesync/files.asp?k=nc8hbaYGS7896GBH67VSGC";

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

			console.log("file(s) to download: " + app.toDownloadList.length);
			y3.syncresult();

			// nella lista toDownloadList ho aggiungo i campi localPtah e localIndex per aggiornare il db locale 
			// nel momento in cui il file remoto viene downloadato con successo

			// carico anche la lista dei gruppi
			// che sostituisce sempre la precedente
			//var url = "https://dl.dropboxusercontent.com/u/48127483/storci/grouplist.txt";
			var url = "http://www.storci.com/filesync/groups.asp?k=nc8hbaYGS7896GBH67VSGC";
			console.log("loading "+url);
			var jqxhr2 = $.getJSON(url , null, 
				function(data)
				{
					app.localGroupList = data;
					localStorage.setItem("prevGroupList",JSON.stringify(app.localGroupList));
				});
			jqxhr2.error(function(){console.log("error loading group")});	 
			
		});
		jqxhr.error(function(){console.log("error loading list")});
	},

	// carica il file i-esimo, usa il filesystemroot riempito da integritycheck
	openFile: function(i,location,useIBooks)
	{
		if (this.localdb != null)
		{
			if (this.localdb.length>i)
			{
				var filepath = this.fileSystemRoot + "/" + this.localdb[i].localPath;

				if (useIBooks)
				{
					filepath = "itms-books:/"+filepath;
				}
				console.log("provo ad aprire:" + filepath);
				var ref;
				if (location == true)
				{
					ref = window.open(filepath,'_blank','location=yes');
				}
				else
				{
					ref = window.open(filepath,'_blank','location=no');
				}
				
				ref.addEventListener('loaderror',
					function(event)
					{
						console.log("error loading:" + filepath + ": "+event.message);
					}

					);
				ref.addEventListener('loadstart',
					function(event)
					{
						console.log("start:"+event.url)
					}

					);

			}
		}
	},
	

	getFileExtension: function(path)
	{
		var ext = path.substring(path.lastIndexOf('.')+1);
		return ext;
	},


	fileSystemRoot: null,

	// helper per la integrityCheck
	fileExistsRecurs: function(_i,_fileSystem,_done)
	{
		console.log("fileExistsRecurs");
		if (this.localdb == null)
		{
			console.log("fine");
			_done();
		}
		else
		if (_i == this.localdb.length)
		{
			// fine ricorsione
			console.log("fine");
			_done();
		}
		else
		{
			var filename = this.localdb[_i].localPath;
			// tolgo il path se c'era
			filename = filename.substring(filename.lastIndexOf('/')+1);
			console.log("fileexists check: "+filename);
			this.localdb[_i].localPath = filename;
			

			/*
			_fileSystem.root.getFile(
				filename, {create: false}, 
				function gotFileEntry(fileEntry) 
				{
					// c'e' tutto ok
					console.log(fileentry.fullPath + " found");
					// e gia' che ci sono mi salvo il localpath
					app.localdb[_i].localPath = fileEntry.fullPath;
					app.fileExistsRecurs(_i+1,_fileSystem,_done);
				},
				function error(error)
				{
					console.log(filename+" NOT found ("+error.code+")");
					// non valido lo tolgo
					app.localdb.splice(_i,1);
					app.fileExistsRecurs(_i,_fileSystem,_done);
				}
			);
			*/

				
			_fileSystem.root.getFile(
				filename, {create: true, exclusive: true}, 
				function gotFileEntry(fileEntry) 
				{
					// lo riesco a creare in esclusiva, non c'era
					// lo tolgo
					fileEntry.remove();

					console.log(fileEntry.fullPath + " NOT found");
					app.localdb.splice(_i,1);
					app.fileExistsRecurs(_i,_fileSystem,_done);
					
				},
				function error(error)
				{
					console.log(filename+" found ("+error.code+")");
					app.fileExistsRecurs(_i+1,_fileSystem,_done);
					
				}
			);

			/*
			$.ajax({
				url:'file///sdcard/myfile.txt',
				type:'HEAD',
				error: function()
				{
				    //file not exists
				alert('file does not exist');
				},
				success: function()
				{
				    //file exists
				alert('the file is here');
				}
				});
			*/



		}
	},

	useChrome: false,	// per debuggare il filesystem su chrome

	// controllo che i file indirizzati dal db siano presenti (in locale)
	// e ne aggiorno il path locale
	integrityCheck: function(done)
	{
		console.log("integritycheck");

		if (this.useChrome)
		{
			console.log("using chome");

			window.webkitRequestFileSystem(window.PERSISTENT, 0, 
				function onFileSystemSuccess(fileSystem) 
				{
					app.fileSystemRoot = fileSystem.root.fullPath;
					console.log("fs ok per integrityCheck");
					var i = 0;
					console.log("this vale:"+this);
					app.fileExistsRecurs(i,fileSystem,done);
				}
				,
				function onFIleSystemError(error)
				{
					console.log("filesystem error");
				}
			);
			return;
		}
		


		// mi serve il filesystem
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, 
			function onFileSystemSuccess(fileSystem) 
			{
				app.fileSystemRoot = fileSystem.root.fullPath;
				console.log("fs ok per integrityCheck");
				var i = 0;
				console.log("this vale:"+this);
				app.fileExistsRecurs(i,fileSystem,done);
			},
			function onFileSystemError(error)
			{
				console.log("filesystem error");
			}
		);
		
	},

	mainIntegrityCheck: function()
	{
		console.log("integrityCheck...");
		this.integrityCheck(
			function()
			{
				console.log("integrityCheck done");
				console.log("itegrity returned");
        		y3.initialize('homecontent');		// inizializza la pagina dell'interfaccia
        		console.log("y3init done");
        		app.receivedEvent('deviceready');	
			}
			);

	},


	m_fileTransfer: null,	// tiro fuori l'oggetto per poter chiamare abort
	m_requestAbort: false,

	// scarica il file i-esimo dalla lista todownload
	// aggiorna la lista todownload e localdb
	// in caso di successo
	downloadFile: function(i,_success,_fail)
	{
		var remoteRef = this.toDownloadList[i];
		var remoteFilePath = remoteRef.filePath;
		// nome file senza path
		var filename = remoteFilePath.substring(remoteFilePath.lastIndexOf('/')+1);
		var localPath = this.fileSystemRoot + "/" + filename;
		var uri = encodeURI(remoteFilePath);
	    console.log("start download of " + remoteFilePath);
	    console.log("to " + localPath);	
	    m_fileTransfer = new FileTransfer();
		
		//andiamo alla pagina di download....
		$.mobile.navigate("#downloading");
		//creiamo la barra di download
		y3.createprogressbar('progressbarcontainer');


	    loadingStatus.m_percent = 0;
	    m_fileTransfer.onprogress = function(progressEvent) 
	    {
		    if (progressEvent.lengthComputable) 
		    {
		      loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
		    } 
		    else 
		    {
		      loadingStatus.increment();
		    }
		    loadingStatus.log();
  			y3.progressbar.setValue(loadingStatus.m_percent);

		};

	    m_fileTransfer.download(
			uri,
			localPath,
			function(theFile) 
			{
			    console.log("download complete: " + theFile.fullPath);
			    // download completato devo aggiornare il db locale
			    var onlyname = localPath.substring(localPath.lastIndexOf('/')+1);
			    remoteRef.localPath = onlyname;
		
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
			    console.log("splice:"+i);
			    app.toDownloadList.splice(i,1);

				//distrggo la progressbar
				y3.destroyprogressbar();
				_success();
			},
			function(error) 
			{
			    console.log("download error source " + error.source);
			    console.log("download error target " + error.target);
			    console.log("upload error code: " + error.code);
			    _fail();
			}
		);
	},

	// pubblica
	requestAbort: function()
	{
		this.m_requestAbort = true;
		if (this.m_fileTransfer != null)
		{
			this.m_fileTransfer.abort();
		}
	},

	// privata
	downloadAllFiles: function()
	{
		console.log("download iteration");
		// prima guardo se ho da scaricare
		if (this.toDownloadList==null)
		{
			console.log("niente da scaricare (null)");
			return;
		}
		if (this.toDownloadList.length==0)
		{
			console.log("niente da scaricare (0)");
			return;
		}
		
		this.downloadFile(0,
				function()
				{
					if (app.m_requestAbort)
					{
						// fine
						app.m_requestAbort = false;
					}
					else
					{
						console.log("download success. left:"+app.toDownloadList.length);
						y3.initialize('homecontent');
						y3.syncresult();
						console.log("view updated");
						// continuo
						app.downloadAllFiles();
					}
				},
				function()
				{
					// c'e' stato un errore o un abort
					app.m_requestAbort = false;
				}
		);

	},

	// pubblica
	mainDownloadAllFiles: function()
	{
		this.m_requestAbort = false;
		this.downloadAllFiles();
	}
}






