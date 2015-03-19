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


// localdb[i].localPath

// scelgo come ordinare le estensioni
var extSort = 
[
	"mov",
	"mp4",
	"mpg",
	"gif",
	"jpg",
	"pdf",
	"xls",
	"xslx"
];

function compareFunc(a,b)
{
	try
	{
		var path1 = a.localPath;
		var path2 = b.localPath;
		var ext1 = app.getFileExtension(path1).toLowerCase();
		var ext2 = app.getFileExtension(path2).toLowerCase();

		// prima per estensione
		var ext1val = extSort.indexOf(ext1);
		var ext2val = extSort.indexOf(ext2);
		if (ext1val==-1)
		{
			ext1val = extSort.length;
		}
		if (ext2val==-1)
		{
			ext2val = extSort.length;
		}

		if (ext1val>ext2val)
		{
			return 1;
		}
		if (ext2val>ext1val)
		{
			return -1;
		}

		return path1 > path2;
	}
	catch(err)
	{
		//alert("sort error:" + err);
		return 0;
	}
}

 



var loadingStatus =
        {
	        m_percent: 0,

            setPercentage: function (x)
                {
                    x = Math.floor(x*100);
                    this.m_percent = x;
                },
            increment: function()
                {
                    if (this.m_percent<100)
                    {
                        this.m_percent += 1;
                    }
                },
            log: function()
                {
                    console.log(this.m_percent);
                }
        }

 
var app = 
{
    m_appData:
    {
        version: "1.0.1",
        name: "BSyncPush"
    },
    
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
        //app.myAlert("ondeviceready");
        app.initLocalDb();					// check local storage e carica il db dal localstorage
        app.initVersion();  // serve il local storage 
        app.mainIntegrityCheck();	// ne controlla l'itegrita' e inizializza il path della root del filesystem
    },
    
    newInstall : false,
    
    // guardo se e' la prima installazione
    // e creo la cartella per il filesystem, se sono in android
    initVersion: function()
    {
        if (this.isLocalStorageSupported)
        {
            var appDatas = localStorage.getItem("appdata");
            if (appDatas == null)
            {
                // era la prima volta
                console.log("prima installazione");
                this.newInstall = true;
            }
            else
            {
                // era un aggiornamento
                var prevAppData = $.parseJSON(appDatas);
                if (prevAppData.version != this.m_appData.version)
                {
                    console.log("aggiornamento app");
                }
            }
            appData = JSON.stringify(this.m_appData);
            
            localStorage.setItem("appdata",appData);
            
        }
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

    isLocalStorageSupported: false, // valore di default

    // inizializzo il db, lo carico da localstorage
    initLocalDb: function () 
    {
        if (typeof(localStorage) == "undefined" )
		{
			console.log("Your browser does not support HTML5 localStorage. Try upgrading.");
		}
		else
		{
			console.log("localstorage OK");
			this.isLocalStorageSupported = true;
			
			// grouplist
			this.currentGroupList = localStorage.getItem("prevGroupList");
			if (this.currentGroupList != null)
			{
				//console.log(this.currentGroupList);
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
				//console.log(this.currentList);
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
			
			//alert(localStorage.getItem("wifiOnly"));
		}
    },

    // faccio il sort del db locale
    sortLocalDb: function()
    {
    	if (this.localdb!=null)
    	{
    		this.localdb.sort(compareFunc);
    	}
    },

    // salvo il db corrente su localstorage
    saveLocalDb: function()
    {
    	if (this.isLocalStorageSupported)
    	{
    		localStorage.setItem("prevDocList",JSON.stringify(this.localdb));
    		localStorage.setItem("prevGroupList",JSON.stringify(this.localGroupList));

			
			//console.log(JSON.stringify(this.localdb));
			//console.log(JSON.stringify(this.localGroupList));
    	}
    },

    myAlert: function(msg)
    {
    	if (navigator.notification != undefined)
    	{
    		navigator.notification.alert(msg,null,"error");
    	}
    	else
    	{
    		alert(msg);
    	}

    },

    
	setWifiOnly: function(_wifi)
	{
		localStorage.setItem("wifiOnly",JSON.stringify(_wifi));
	},
	
	getWifiOnly: function()
	{
		var wifiOnly;
		var temp = localStorage.getItem("wifiOnly");
		if (temp == null)
		{
			wifiOnly = true;
		}
		else
		if (temp == undefined)
		{
			wifiOnly = true;
		}
		else
		{
			try
			{
				wifiOnly = $.parseJSON(temp);
			}
			catch(err)
			{
				wifiOnly = true;
			}
		}
		//alert(wifiOnly);
		return wifiOnly;
	},
	    
    // carico i file json dal server (cablato)
    // e crea la lista dei file da scaricare, quelli non aggiornati
    loadJson: function()
    {
        if (navigator.connection != undefined)
        {
        
            var networkState = navigator.connection.type;

            if (this.getWifiOnly() && (networkState != Connection.WIFI))
            {
              var states = {};
              states[Connection.UNKNOWN]  = 'Unknown connection';
              states[Connection.ETHERNET] = 'Ethernet connection';
              states[Connection.WIFI]     = 'WiFi connection';
              states[Connection.CELL_2G]  = 'Cell 2G connection';
              states[Connection.CELL_3G]  = 'Cell 3G connection';
              states[Connection.CELL_4G]  = 'Cell 4G connection';
              states[Connection.CELL]     = 'Cell generic connection';
              states[Connection.NONE]     = 'No network connection';

              alert("connessione WIFI non attiva ("+states[networkState]+")");
              return;
            }
        }

	
    y3.showloading(); //mostro loading in progress...
        
		this.toDownloadList = new Array();	// qui ci metto quelli da scaricare

		// scarico prima i gruppi
		var url = "http://www.storci.com/filesync/groups.asp";
		console.log("loading "+url);

    if (this.useChrome)
    {
        var deviceid = "5617AA9A-6292-4580-AA11-EF708E287BB3";
        
        makeCorsRequest(url, { deviceID: deviceid , lang: "IT" });
        return;
        
    }
    else
    {
		  var deviceid = device.uuid;
    }
		//var deviceid = "59C7EC4D-F096-4CC6-AF9B-76B619BF3E02";
		
		

		var jqxhr2 = $.post(url , { deviceID: deviceid , lang: "IT" } ).done
		( 
			function(data1)
			{
				var response;
			    try
			    {
			        response = $.parseJSON(data1);
			    }
			    catch(err)
			    {
			        console.log("error parsing list");
					y3.hideloading();// nascondo loading in progress..
					alert("errore di parse della lista dei gruppi");
			        response.code = -1;
			    }

			    console.log("response code"+response.responseCode);

			    // controllo se la risposta e' corretta
			    if (response.responseCode >= 100 && response.responseCode < 200)
			    {
			    	// OK
				    var data = response.list;

					app.localGroupList = data;
					localStorage.setItem("prevGroupList",JSON.stringify(app.localGroupList));
					y3.initialize('homecontent');	

					// ora scarico i file
					//var url = "http://www.storci.com/filesync/files.asp?k=nc8hbaYGS7896GBH67VSGC";
					var url = "http://www.storci.com/filesync/files.asp";
					

					var deviceid = device.uuid;
					//var deviceid = "59C7EC4D-F096-4CC6-AF9B-76B619BF3E02";

					// se ci fossero problemi di crossdomain
					//$.getJSON(url + "?callback=?", null, function(tweets) {
					console.log("loading "+url);
					var jqxhr = $.post(url , { deviceID: deviceid , lang: "IT" } ).done(function(data1) 
					{
						var response;
					    try
					    {
					        response = $.parseJSON(data1);
					    }
					    catch(err)
					    {
					        console.log("error parsing list");
							alert("errore di parse lista file");
					        response.list = [];
					    }
						// ho scaricato la lista remota, ora devo fare i confronti per vedere quali scaricare
						// la lista remota e' <data>
						var data = response.list;
                        
                        for (var i1 = 0; i1 < app.localdb.length; i1++)
                        {
                            app.localdb[i1].isOnServer = false;
                        }
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
                                        app.localdb[i1].isOnServer = true;
										found = true;
                                        // aggiorno i tag in ogni caso
                                        app.localdb[i1].filetags = data[i].filetags;
										// e anche la descrizione
										app.localdb[i1].desc = data[i].desc;
										
                                        
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
                        
                        // ora controllo se ho dei file io, che in remoto non ci sono
                        app.deleteUnusedFiles(0,
                            function()
                              {
                                  var msg = "file(s) to download: " + app.toDownloadList.length;
                                  console.log(msg);
                                                                    
                                  y3.initialize('homecontent');
                                  
                                  y3.hideloading();// nascondo loading in progress..
                                  
						          y3.syncresult();
                              }
                                             ); 
						// nella lista toDownloadList ho aggiungo i campi localPtah e localIndex per aggiornare il db locale 
						// nel momento in cui il file remoto viene downloadato con successo
					});
					jqxhr.fail(function(jqXHR,textStatus,errorThrown)
					{
						y3.hideloading();
						console.log("error loading filelist");
						alert("error loading file list");
						y3.showDownloadResult(3);
					}
					);
				}
				else
                {
                    y3.hideloading();
                    switch (response.responseCode)
                    {
                            case 202:
                                // non sono autorizzato a scaricare la lista dei gruppi
                                console.log("non sono autorizzato:"+response.responseDesc);
                                // vado in registrazione
                                $.mobile.changePage("#registration", { transition: 'slide', reverse: false });
                            break;
                            default:
                                alert(response.responseDesc);
                            break;
                    }           
                
                }
			}
		);
		
		jqxhr2.fail(function(jqXHR,textStatus,errorThrown)
		{
			y3.hideloading();
			console.log("error loading group");
			y3.showDownloadResult(3);
		});	
	},
    
    getMIME: function(name)
    {
        var ext = this.getFileExtension(name).toLowerCase();
        
        if (ext == "gif")
        {
            return "image/gif";
        }
        if (ext == "jpg")
        {
            return "image/jpeg";
        }
        if (ext == "pdf")
        {
            return "application/pdf";
        }
        if (ext == "xls")
        {
            return "application/excel";
        }
        if (ext == "mov")
        {
            return "video/quicktime";
        }
        if (ext == "mpa")
        {
            return "audio/mpeg";
        }
        if (ext == "mp4")
        {
            return "video/mpeg";
        }
        if (ext == "mpg")
        {
            return "video/mpeg";
        }
        if (ext == "xlsx")
        {
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        }
        return "";
    },
    
	// carica il file i-esimo, usa il filesystemroot riempito da integritycheck
	openFile: function(i,location,useIBooks)
	{
		if (this.localdb != null)
		{
			if (this.localdb.length>i)
			{
				var filepath = this.fileSystemRoot + "/" + this.localdb[i].localPath;

				// devo togliere il file:// anche da ios
				//alert("full:"+filepath);
				var full = filepath;
        		filepath = filepath.substring(7);
					
				if ( device.platform == 'android' || device.platform == 'Android' )
				{
                    // e poi mi serve il mime
          			var mime = this.getMIME(filepath);
					
					//filepath = filepath.substring(4);
					
					console.log("startactivity on:" + filepath);
          			console.log("MIME:" + mime);
					
					// alert("start on1:"+filepath+":"+mime);
					
	        		cordova.plugins.fileOpener.open(filepath,mime);
                    /*
					window.plugins.webintent.startActivity(
						{
							action: window.plugins.webintent.ACTION_VIEW,
							url: filepath
						},
						function()
						{
							console.log("activity ok");
						},
						function() 
						{
							// body...
							alert('Failed to open URL via Android Intent');
						}
						);
                    */
				}
				else
				{

					if ((window.plugins != undefined) && (window.plugins.documentInteraction != undefined))
					{
						
                    	// e poi mi serve il mime
                    	var mime = this.getMIME(filepath);
                    	console.log("documentInteraction on:" + filepath);
                    	console.log("MIME:" + mime);
						//window.plugins.documentInteraction.previewDocument(filepath,mime);
						window.plugins.documentInteraction.previewDocument(filepath);	
					}
					else
					{
						var uri = encodeURI(full);
						if (useIBooks)
						{
							filepath = "itms-books:/"+filepath;
						}
						console.log("provo ad aprire:" + filepath);
						var ref;
						if (location == true)
						{
							ref = window.open(uri,'_blank','location=yes,EnableViewPortScale=yes');
						}
						else
						{
							ref = window.open(uri,'_blank','location=no,EnableViewPortScale=yes');
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
			}
		}
	},
		

	getFileExtension: function(path)
	{
		var ext = path.substring(path.lastIndexOf('.')+1);
		return ext;
	},

	getFileName: function(path)
	{
		var filename = path;
			// tolgo il path se c'era
		filename = filename.substring(filename.lastIndexOf('/')+1);
		return filename;
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
		if (this.localdb[_i]!=null)
		{
			var filename = this.localdb[_i].localPath;
			// tolgo il path se c'era
			filename = filename.substring(filename.lastIndexOf('/')+1);
			console.log("fileexists check: "+filename);
			this.localdb[_i].localPath = filename;

			_fileSystem.root.getFile(
				"bsyncpush/"+filename, {create: true, exclusive: true}, 
				function gotFileEntry(fileEntry) 
				{
					console.log("not found");
					// lo riesco a creare in esclusiva, non c'era
					// lo tolgo
					fileEntry.remove();

					console.log(fileEntry.name + " NOT found");
					app.localdb.splice(_i,1);
					app.fileExistsRecurs(_i,_fileSystem,_done);
					
				},
				function error(error)
				{
					console.log(filename+" found ("+error.code+")");
					app.fileExistsRecurs(_i+1,_fileSystem,_done);
					
				}
			);
		}
		else
		{
			// il record e' null
			this.localdb.splice(_i,1);
			app.fileExistsRecurs(_i,_fileSystem,_done);

		}

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
		
	},

	useChrome: false,	// per debuggare il filesystem su chrome
	m_fileSystem: null,

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
				console.log("fsok");
				app.m_fileSystem = fileSystem;
				console.log("fs name:"+fileSystem.name);
				console.log("fs root:"+fileSystem.root.toURL());
                
                // creo la cartella per me
                fileSystem.root.getDirectory("bsyncpush",{create: true, exclusive: false},
                        function(dirEntry)
                        {
                            app.fileSystemRoot = dirEntry.nativeURL;
				            console.log("fs ok per integrityCheck");
				            var i = 0;
				            console.log("name: "+dirEntry.name);
				            console.log("path: "+dirEntry.toURL());
							console.log("native:"+dirEntry.nativeURL);
				            app.fileExistsRecurs(i,fileSystem,done);
                        },
                        function()
                        {
                            console.log("getdir error");
                        }
                                       );
                
            },
			function onFileSystemError(error)
			{
				console.log("filesystem error");
				alert("filesystem error, please restart the app");
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
                app.sortLocalDb();
 
            	y3.initialize('homecontent');		// inizializza la pagina dell'interfaccia
        		console.log("y3init done");
        		//app.receivedEvent('deviceready');	
                app.registerToPush();
                y3.setWiFiCheckboxState();
			}
			);

	},


	m_fileTransfer: null,	// tiro fuori l'oggetto per poter chiamare abort
	m_requestAbort: false,
    m_requestSkip: false,
	m_currentDownloadingSourceFile: null,
    m_nextDownloadFileIndex: 0, // indice del prossimo da scaricare, aumenta con lo skip, si resetta all'inizio del download

	// scarica il file i-esimo dalla lista todownload
	// aggiorna la lista todownload e localdb
	// in caso di successo
	downloadFile: function(i,_success,_fail)
	{
		var remoteRef = this.toDownloadList[i];
		var remoteFilePath = remoteRef.filePath;
		// nome file senza path
		var filename = remoteFilePath.substring(remoteFilePath.lastIndexOf('/')+1);
		var localPath = this.fileSystemRoot +"/"+ filename;
		localPath = localPath.substring(7);
		localPath = localPath.replace(/ /g,"_");
		//localPath = encodeURI(localPath);
		var uri = encodeURI(remoteFilePath);
		
		
	    
	    this.m_fileTransfer = new FileTransfer();
		
		//andiamo alla pagina di download....
		$.mobile.navigate("#downloading");
		//creiamo la barra di download
		y3.createprogressbar('progressbarcontainer');
		this.m_currentDownloadingSourceFile = uri;
		y3.showRemainingFiles();


	    loadingStatus.m_percent = 0;
	    this.m_fileTransfer.onprogress = function(progressEvent) 
	    {
		    if (progressEvent.lengthComputable) 
		    {
		      loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
		    } 
		    else 
		    {
		      loadingStatus.increment();
		    }
		    //loadingStatus.log();
  			y3.progressbar.setValue(loadingStatus.m_percent);

		};

		//var dwComment = "start download of " + uri + " to " + localPath;
	    //console.log(dwComment);
		//alert(dwComment);
		
		
	    this.m_fileTransfer.download(
			uri,
			localPath,
			function(theFile) 
			{
			    console.log("download complete: " + theFile.name);
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
				var states = {};
				states[FileTransferError.FILE_NOT_FOUND_ERR]  = 'file non trovato';
				states[FileTransferError.INVALID_URL_ERR] = 'url non valido';
				states[FileTransferError.CONNECTION_ERR]     = 'errore di connessione';
				states[FileTransferError.ABORT_ERR]  = 'download interrotto';
				
				var err = "error: download source ("+error.source+"), target ("+error.target+"), ("+states[error.code]+")";
				alert(err);
			  console.log(err);
			    //_fail();
                
				// c'e' stato un problema (o un abort)
				// ti chiedo se vuoi skippare il file e continuare o bloccare tutto
				if (navigator.notification != undefined)
				{
						var msg = "problema con il file corrente, lo ignori e prosegui?";
						navigator.notification.confirm(msg,
									function(response)
									 {
											 switch(response)
											 {
															 case 1:
																	// skip
																	app.m_nextDownloadFileIndex++;
																	y3.destroyprogressbar();
																	// cear eventuale abort, cosi' posso andare al prossimo
																	app.m_requestAbort = false;

																	_success();
																	break;
															 default:
																	// abort
                                                                    alert("abort download");
                                                                    app.abortedDownload();
																	//_fail();
																	break;
											 }
									 },
									 "download",
									 ["continua con il prossimo","interrompi"]
									);
				}

			}
		);
	},

	// pubblica
	requestAbort: function()
	{
		console.log("abort req");
		this.m_requestAbort = true;
		if (this.m_fileTransfer != null)
		{
			alert("blocco un download in corso");
			console.log("blocco un download in corso");
			this.m_fileTransfer.abort();
		}
	},
    
    
	getRemainingFilesCount: function()
    {
        return this.toDownloadList.length;
    },
	

	// privata
	// 0 ok, 1 abort. 2 errore
	downloadAllFiles: function()
	{
		console.log("download iteration");
		// prima guardo se ho da scaricare
		if (this.toDownloadList==null)
		{
			//window.plugins.powerManagement.release();
			//alert("sleep1");
			window.plugins.insomnia.allowSleepAgain();
			
			console.log("niente da scaricare (null)");
			this.sortLocalDb();
			y3.showDownloadResult(0);
			y3.initialize('homecontent');
			return;
		}
		if (this.toDownloadList.length==0)
		{
			//window.plugins.powerManagement.release();
			//alert("sleep2");
			window.plugins.insomnia.allowSleepAgain()
			console.log("niente da scaricare (0)");
			this.sortLocalDb();
			y3.showDownloadResult(0);
			y3.initialize('homecontent');
			return;
		}
		
		this.downloadFile(this.m_nextDownloadFileIndex,
				function()
				{
					alert("download success. left:"+app.toDownloadList.length);
					
					console.log("view updated");
					y3.showRemainingFiles();

					if (app.m_requestAbort)
					{
						// fine
						//window.plugins.powerManagement.release();
						//alert("sleep3");
						window.plugins.insomnia.allowSleepAgain()
						console.log("abort: fine iterazione download");
						app.m_requestAbort = false;
						this.sortLocalDb();
						y3.showDownloadResult(1);
						y3.initialize('homecontent');
					}
					else
					{
						// continuo
						app.downloadAllFiles();
					}
				},
				function()
				{
					// c'e' stato un errore o un abort
                    //window.plugins.powerManagement.release();
                                        //alert("sleep4");
                /*
                    alert("error on load");
                    window.plugins.insomnia.allowSleepAgain();
                    console.log("download error or abort");
                    var abort = app.m_requestAbort;
                    app.m_requestAbort = false;
                    if (abort)
                    {
                        alert("sort localdb");
                    	this.sortLocalDb();
                        alert("showdownloadres");
                        y3.showDownloadResult(1);
                        alert("initialize");
                        y3.initialize('homecontent');
                    }
                    else
                    {
                    	this.sortLocalDb();
                        y3.showDownloadResult(2);
                        y3.initialize('homecontent');
                    }
				}
                */
		);

	},
    
    // sposto qui del codice per fare test
    abortedDownload: function() {
        // c'e' stato un errore o un abort
        alert("error on load");
        window.plugins.insomnia.allowSleepAgain();
        console.log("download error or abort");
        var abort = app.m_requestAbort;
        app.m_requestAbort = false;
        if (abort)
        {
            alert("sort localdb");
            app.sortLocalDb();
            alert("showdownloadres");
            y3.showDownloadResult(1);
            alert("initialize");
            y3.initialize('homecontent');
        }
        else
        {
            app.sortLocalDb();
            y3.showDownloadResult(2);
            y3.initialize('homecontent');
        }
    },


	// pubblica
	mainDownloadAllFiles: function()
	{
		this.m_requestAbort = false;
		//window.plugins.powerManagement.acquire();
		//alert("awake");
		window.plugins.insomnia.keepAwake();
        this.m_nextDownloadFileIndex = 0;
		this.downloadAllFiles();
	},
    
    alertDismissed: function()
    {
        
    },
    
    alertTest: function()
    {
        navigator.notification.alert("ceeeeo",this.alertDismissed,"alert","Done");
    },

    fileIdToIndex: function(fileid)
    {
    	for (var i=0;i<this.localdb.length;i++)
    	{
    		if (this.localdb[i].fileid == fileid)
    		{
    			return i;
    		}	
    	}
    	return i;
    },

    deleteFile: function(_fileid,_i)
    {
    	navigator.notification.confirm("sei sicuro?", 
             function(buttonIndex)
             {
             	console.log("confirm"+buttonIndex);
             	if (buttonIndex == 1)
             	{
	             	y3.showloading(); //mostro loading in progress...

	             	// cerco l'indice dato il fileid
	             	var index = app.fileIdToIndex(_fileid);

	             	
			    	if (index<app.localdb.length)
			    	{
			    		var name = "bsyncpush/"+app.localdb[index].localPath;
			    		console.log("prepare del:"+name);
			    		app.m_fileSystem.root.getFile(name,{create: false, exclusive: false},
			                    function(entry)
			                    {
			                        console.log(name + " about to be deleted");
			                        entry.remove(
			                            function(file)
			                            {
			                                console.log("deleted file:"+file);
			                                app.localdb.splice(index,1);
			                                $("#fileElement"+_i).remove();
			                                y3.initialize("homecontent");
			                                y3.hideloading();
			                            },
			                            function(error)
			                            {
			                            	y3.hideloading();
			                                consolo.log("error deleting file:"+error.code);
			                                alert("error deleting file");

			                            }
			                            );
			                    },
			                    function(error)
			                    {
			                    	y3.hideloading();
			                        console.log("error getting file to delete:"+error.code);
			                        alert("error getting file to delete");
			                    });

			    	}
			    	else
			    	{
			    		alert("file not found");
			    	}
			    }
             }
             ,'cancella file', ['ok','annulla']);	
    },

    deleteUnusedFiles: function(_i,_done)
    {
        if (_i<this.localdb.length)
        {
            if (!this.localdb[_i].isOnServer)
            {
                // da cancellare
                var name = "bsyncpush/"+this.localdb[_i].localPath;
                this.m_fileSystem.root.getFile(name,{create: false, exclusive: false},
                    function(entry)
                    {
                        console.log(name + " about to be deleted");
                        entry.remove(
                            function(file)
                            {
                                console.log("deleted file:"+file);
                                app.localdb.splice(_i,1);
                                _i--;
                                app.deleteUnusedFiles(_i,_done);
                            },
                            function(error)
                            {
                                consolo.log("error deleting file:"+error.code);
                                app.deleteUnusedFiles(_i+1,_done);
                            }
                            );
                    },
                    function(error)
                    {
                        console.log("error getting file to delete:"+error.code);
                        app.deleteUnusedFiles(_i+1,_done);
                    });
            }
            else
            {
                app.deleteUnusedFiles(_i+1,_done);
            }
    	}
        else
        {
            console.log("fine ricorsione deleteunused");
            _done();
        }
    },

    isFileInDb: function(name)
    {
    	var i;
    	for (i=0;i<this.localdb.length;i++)
    	{
    		if (this.localdb[i].localPath == name)
            {
                return true;
            }
    	}
        return false;
    },

    // cancello i file che non ho piu' nella lista
    deleteUnsynchedFiles: function()
    {
    	if (this.m_fileSystem != null)
    	{
    		var win = function()
    		{
    			console.log("delete ok");
    		}
    		var loose = function()
    		{
    			console.log("delete fail");
    		}
    		//this.m_fileSystem.root.createReader().readEntries(
            this.m_fileSystem.root.getDirectory("bsyncpush",{create: true, exclusive: false},
                function(dirEntry)
                {
                    dirEntry.createReader().readEntries(
                        function(entry)
                        {
                            var i;
                            var last = entry.length-1;
                            for (i=last;i>=0;i--)
                            {
                                // guardo se questo file c'e' nel mio db locale
                                var filename = entry[i].name;	// nome senza path
                                if (!app.isFileInDb(filename))
                                {
                                    console.log(name + " about to be deleted ("+entry[i].name+")");
                                    entry[i].remove(win,loose);
                                }
                            }
                        },
                        function(error)
                        {
                            console.log("readEntries fail" + error.code);
                        });
                },
                function()
                {
                    console.log("getdir error");
                });
    	}
    },

    logFiles: function()
    {
    	this.m_fileSystem.root.getDirectory("bsyncpush",{create: true, exclusive: false},
                function(dirEntry)
                {
                	console.log("getdir ok");
					console.log(dirEntry);
					var reader = dirEntry.createReader();
					console.log("reader:"+reader);
                    reader.readEntries(
                        function(entry)
                        {
						    console.log("ok, files:"+entry.length);
							console.log(entry);
                            var i;
                            var last = entry.length-1;
                            for (i=last;i>=0;i--)
                            {
								console.log("qui:"+i);
								console.log(entry[i].name);
	                        }
                        },
                        function(error)
                        {
                            console.log("readEntries fail" + error.code);
                        });
                },
                function()
                {
                    console.log("getdir error");
                });

    },

    playVideoTest: function(i)
    {
    	if (this.localdb != null)
		{
			if (this.localdb.length>i)
			{
				var filePath = this.fileSystemRoot + "/" + this.localdb[i].localPath;
				$("#videotest").attr("src",filePath);
			}
		}
    },

    m_pushToken: null,

    registerToPush: function()
    {
    	var pushNotification = window.plugins.pushNotification;
    	if (pushNotification == undefined)
    	{
    		this.myAlert("pushnotification not available");
    		return;
    	}
    	if ( device.platform == 'android' || device.platform == 'Android' )
		{
			// per ora no
		    pushNotification.register(
		        successHandler,
		        errorHandler, {
		            "senderID":"641296272279",
		            "ecb":"onNotificationGCM"
		        });
		}
		else
		{
			console.log("about to register");
		    pushNotification.register(
		        function(token)
		        {
		        	console.log("reg ok");
		        	//app.myAlert("device token = " + token);
		        	app.m_pushToken = token;
		        	// devo mandare il token al server
                    // e distinguere il caso ios android
		        	// lo faro'
		        	
		        	var req = $.post("http://www.storci.com/filesync/tokenUpdate.asp",{ deviceID: device.uuid , token: token, deviceName: device.model});
		        	
		        	req.done(function(data)
		        	{
						var response;
						try
						{
							response = $.parseJSON(data);
							console.log("tokenupdate");
							console.log(response);
                            
                            switch (response.responseCode)
                            {
                                    case 202:
                                        // non sono autorizzato a scaricare la lista dei gruppi
                                        console.log("non sono autorizzato:"+response.responseDesc);
                                        // vado in registrazione
                                        $.mobile.changePage("#registration", { transition: 'slide', reverse: false });
                                    break;
                            }    
                            
                            
						}
						catch(ex)
						{
							console.log("parsejson error in registertopush");
						}
					});
		 				
					req.fail(function(jqXHR,textStatus)
		        	{
		        		console.log("req failed: " + textStatus);
		        	});
		
		        },
		        function(error)
		        {
		        	console.log("push reg error");
		        	app.myAlert("push reg error = " + error);
		        },
		        {
		            "badge":"true",
		            "sound":"true",
		            "alert":"true",
		            "ecb":"onNotificationAPN"
		        });

		    console.log("reg done");
		}
    },

    unregisterToPush: function()
    {
    	var pushNotification = window.plugins.pushNotification;
    	if (pushNotification == undefined)
    	{
    		this.myAlert("pushnotification not available");
    		return;
    	}
    	pushNotification.unregister(successHandler, errorHandler);
    },
    
    // mi registro al sito
    postRegistration: function()
    {
        
        var objToPost = 
        {
            nomeCognome: $('#nomeCognome').val(),
            email: $('#email').val(),
            tel: $('#tel').val(),
            deviceID: device.uuid,
            deviceName: device.model,
            deviceType: device.platform,
            token: this.m_pushToken
        };
        
        $.post("http://www.storci.com/filesync/registration.asp",objToPost).done(
            function(data)
            {
                console.log("post response:"+data);
                var response;
                try
                {
                    response = $.parseJSON(data);
                    
                    navigator.notification.alert(response.responseDesc, 
                                                 function()
                                                 {
                                                     // torno alla home
                                                     $.mobile.changePage("#homepage", { transition: 'slide', reverse: true });
                                                 }
                                                 ,'Registrazione', 'Chiudi');	
                }
                catch(ex)
                {
                    alert("parsejson fail");
                }
            }).fail(
            function()
            {
                alert("reg fail");
            });


    }
}

 //per uscire dalla loading page nel browser, premere ESC
$(document).keydown(function (e) {
	if (e.keyCode === 27) {
	   app.receivedEvent('deviceready');
	   return false;
	}
});

// iOS
function onNotificationAPN (event) 
{
    if ( event.alert )
    {
        navigator.notification.alert(event.alert);
    }

    if ( event.sound )
    {
        var snd = new Media(event.sound);
        snd.play();
    }

    if ( event.badge )
    {
        pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
    }
}

// Android
function onNotificationGCM(e) 
{
    console.log("gcm event:"+e.event);

    switch( e.event )
    {
    case 'registered':
        if ( e.regid.length > 0 )
        {
            // Your GCM push server needs to know the regID before it can push to this device
            // here is where you might want to send it the regID for later use.
            console.log("regID = " + e.regid);
			
			var req = $.post("http://www.storci.com/filesync/tokenUpdate.asp",{ deviceID: device.uuid , token: e.regid, deviceName: device.model});
			
			req.done(function(data)
			{
				
				var response;
                try
                {
                    response = $.parseJSON(data);
                    console.log("tokenupdate");
                    console.log(response);

                    switch (response.responseCode)
                    {
                            case 202:
                                // non sono autorizzato a scaricare la lista dei gruppi
                                console.log("non sono autorizzato:"+response.responseDesc);
                                // vado in registrazione
                                $.mobile.changePage("#registration", { transition: 'slide', reverse: false });
                            break;
                    }    


                }
				catch(ex)
				{
					console.log("parsejson error in registertopush");
				}
			});
				
			req.fail(function(jqXHR,textStatus)
			{
				console.log("req failed: " + textStatus);
			});

			
			
			
			
        }
    break;

    case 'message':
        // if this flag is set, this notification happened while we were in the foreground.
        // you might want to play a sound to get the user's attention, throw up a dialog, etc.
        if ( e.foreground )
        {
            console.log("inline notification");
            // if the notification contains a soundname, play it.
            try
            {
                var my_media = new Media("/android_asset/www/"+e.soundname);
                my_media.play();
            }
            catch(ex)
            {
                console.log("cannot play media:"+ex.message);   
            }
        }
        else
        {  // otherwise we were launched because the user touched a notification in the notification tray.
            if ( e.coldstart )
            {
                console.log("coldstart");
            }
            else
            {
                console.log("background");
            }
        }
         
        if (navigator.notification != undefined)
        {
            navigator.notification.alert(e.payload.message,null);
        }
        else
        {
            alert(e.payload.message);
        }
        
        console.log("msg:"+e.payload.message);
        console.log("msgcnt:"+ e.payload.msgcnt);
        
    break;

    case 'error':
        console.log("ERROR -> MSG:" + e.msg);
    break;

    default:
        console.log("EVENT -> Unknown, an event was received and we do not know what it is");
    break;
  }
}

function successHandler (result) {
    console.log('result = ' + result);
    //alert("pushreg ok");
}

function errorHandler (error) {
    alert('error = ' + error);
}

function resolveTest(file)
{
	window.resolveLocalFileSystemURL(file,
		function(entry)
		{
			console.log(entry.name);
			console.log(entry);
		},
		function(error)
		{
			console.log(error.code);
		});

	window.resolveLocalFileSystemURI(file,
		function(entry)
		{
			console.log("ok: "+entry.name);
		},
		function(error)
		{
			console.log("fail: "+error.code);
		});
}

function debugOnChrome()
{
    app.useChrome = true;
    app.loadJson();
}


function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

//var jqxhr2 = $.post(url , { deviceID: deviceid , lang: "IT" } ).done
// Make the actual CORS request.
function makeCorsRequest(url, data) {
  // All HTML5 Rocks properties support CORS.

  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;
    
    alert('Response from CORS request to ' + url + ': ' + text);
  };

  xhr.onerror = function() {
    alert('Woops, there was an error making the request.');
  };

  xhr.send(data);
}

