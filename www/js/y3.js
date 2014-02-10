// JavaScript Document

var y3 = {
    // Application Constructor
    initialize: function(containerid) {
        //this.getlists(); non lo chiamo perche' lo chiamo a mano dal debugger, cosi' posso cambiare
		this.populatecontainer(containerid);
    },
	
	//grouplist: null, //lista files
	//filelist: null, //lista files
	
	taglist: '', //contiene la stringa di tags necessaria a cercare i files quando si clicca su una voce in homepage
	
	progressbar: null, //oggetto progressbar da riempire, manipolare e distruggere quando serve
	listheader: '', //contiene la descrizione da passare alla pagina con la lista dei file (da scrivere nell'header)
	
	
		
    getlists: function() {
		
        this.grouplist = [
		// =============================== IMPORTANT ===========================
		// dal lato server questi gruppi devono arrivare ordinati per grouptitle
		// =====================================================================
			{
				"groupid":0, //id, per identificare univocamente gli oggetti HTML e manipolarli
				"grouptags":"#cataloghi", // tutti i documenti con almeno uno di questi tag, vengono inclusi in questo gruppo
				"grouptitle":"Tipi di documenti", //titolo del collapsible, visibile all'utente
				"desc":"Cataloghi e Schede tecniche", //titolo della categoria (cliccabile)
				"notes":"Cataloghi prodotti e linee in pdf." // descrizione aggiuntiva della categoria, compare sotto al titolo
			},
			{
				"groupid":1,
				"grouptags":"#manuali",
				"grouptitle":"Tipi di documenti",
				"desc":"Manuali",
				"notes":"Manuali operativi e di manutenzione"
			},
			{
				"groupid":2,
				"grouptags":"#immagini",
				"grouptitle":"Tipi di documenti",
				"desc":"Immagini",
				"notes":"Tutte le immagini."
			},
			{
				"groupid":3,
				"grouptags":"#presse",
				"grouptitle":"Linee e macchinari",
				"desc":"Presse",
				"notes":"Tutti i documenti relativi alle presse."
			},
			{
				"groupid":4,
				"grouptags":"#linee,#pasta secca",
				"grouptitle":"Linee e macchinari",
				"desc":"Linee per pasta secca",
				"notes":"Tutti i documenti relativi alle linee per pasta secca."
			},
			{
				"groupid":5,
				"grouptags":"#documenti tecnici",
				"grouptitle":"Linee e macchinari",
				"desc":"Manuali operativi",
				"notes":"Tutti i manuali operativi."
			}
		];
		
		
		
		this.filelist = [
			{
				"fileid":0,
				"revision":11,
				"desc":"Catalogo generale Linee pasta secca", //compare sotto al nome del file
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#cataloghi,#linee,#pasta secca"
			},
			{
				"fileid":1,
				"revision":12,
				"desc":"Catalogo generale Linee pasta fresca",
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#cataloghi,#presse"
			},
			{
				"fileid":2,
				"revision":12,
				"desc":"Manuale operartivo Pressa 130.1.",
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#manuali,#linee,#pasta secca"
			},
			{
				"fileid":3,
				"revision":11,
				"desc":"Manuale operativo Linea Omnia",
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#manuali,#presse"
			},
			{
				"fileid":4,
				"revision":11,
				"desc":"Documento tecnico Linea Easy Omnia",
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#documenti tecnici,#pasta secca,#linee,#easy omnia"
			},
			{
				"fileid":5,
				"revision":1,
				"desc":"Immagine Pressa 101",
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#immagini,#presse"
			}

		];
		console.log('Ho popolato una lista di gruppi ed una di files...');
    },
    
	
	populatecontainer: function(containerid){
		
		var listCreated = false;
		var tags = '';
		var files, tot_files, groupid = 0;
		var oldgrouptitle = '';
		var datacollapsed = "false";

		var grouplist = app.localGroupList;
		if (grouplist == null)
		{
			grouplist = [];
		}

		if (grouplist.length == 0) {console.log('ERRORE: grouplist è vuoto!');}

		$("#"+containerid).empty(); // distruggo il contenuto del containerid
		
		//collapsible
		for (i=0;i<grouplist.length;i++)
		{//collapsible: grouplist
			
			
			if (grouplist[i].grouptitle != oldgrouptitle) //aggiungo nuovo collapsible
			{// è necessario che nel db i gruppi siano ordinati per groutitle
				groupid = grouplist[i].groupid; //id del collapsible, viene usato per inserirvi i <li>
				oldgrouptitle = grouplist[i].grouptitle; // riferimento per sapere quando cambia il tipo di raggruppamento (per fare un nuovo collapsible)
				if (i>0) datacollapsed = 'true'//il primo collapsible è sempre aperto di default
				$("#"+containerid).append("<div data-role='collapsible' data-theme='c' data-collapsed='"+datacollapsed+"' id='collapsible"+groupid+"' class='collapsible_refreshme'>");
				console.log('ho aggiunto un collabsible');
				files = y3.countfiles(grouplist[i].grouptags);//contiene i files che presentano TUTTI i tag richiesti da questo gruppo
				$("#collapsible"+groupid).append("<h2>"+grouplist[i].grouptitle+"</h2>");//titolo del collapsible
				$("#"+grouplist[i].groupid+"_filecount").append(tot_files);
				$("#collapsible"+groupid).append("<ul data-role='listview' id='collapsible"+grouplist[i].groupid+"_list'>");//ul
				$("#collapsible"+groupid+"_list").append("<li><a href='#' tags='"+grouplist[i].grouptags+"' listheader='"+grouplist[i].desc+"' class='filelistlink'><h2>"+grouplist[i].desc+"</h2><p>"+grouplist[i].notes+"</p><p class='ui-li-aside'><strong>"+files+"</strong> files</p></a></li>");
				//alert($("#li_"+groupid+"_"+i).attr("tags")); //debug
				console.log('ho aggiunto il primo <li>');
			}
			else // aggiungo categorie al collapsible esistente
			{
				files = y3.countfiles(grouplist[i].grouptags);//contiene i files che presentano TUTTI i tag richiesti da questo gruppo
				$("#collapsible"+groupid+"_list").append("<li><a href='#' tags='"+grouplist[i].grouptags+"' listheader='"+grouplist[i].desc+"' class='filelistlink'><h2>"+grouplist[i].desc+"</h2><p>"+grouplist[i].notes+"</p><p class='ui-li-aside'><strong>"+files+"</strong> files</p></a></li>");
				console.log('ho aggiunto un altro <li>');				
			}
		
		};//collapsible: grouplist
		
		$("#"+oldgrouptitle+"_filecount").append(tot_files);//se ho un gruppo solo, devo scrivere il totale dei suoi file qui, perchè non faccio un altro giro.
		$(".collapsible_refreshme").collapsible().trigger('create'); // creo il collapsible (altrimenti non sarebbe impaginato)

		},


	populatefilelist: function(containerid,tags)
	{
		y3.showloading();
        
        if (y3.listheader != null)	$("#listheader").html(y3.listheader); //sistemo l'header della pagina 
        var t = ""; //contiene tutte le <li> da aggiungere alla lista, per fare un append unico
		$("#filelist_ul").empty(); // distruggo il contenuto della lista
		if (app.localdb == null)
		{
			app.localdb = [];
		}
		if (app.localdb.length == 0) 
		{
			console.log('ERRORE: filelist è vuoto!');
		}
		
		if (y3.countfiles(tags) < 1)//se non ho files con i tag richiesti, lo scrivo nel log
		{
			console.log("Nessun file con in tag richiesti ("+tags+")"); 
			t= "<div class='ui-body ui-body-a ui-corner-all y3-center' style='margin-top:4em;'>"+
               "<h3>Avviso</h3>"+
               "<p >Questa lista non contiene alcun file. E' possibile che sia necessario sincronizzare l'applicazione. Premere il tasto sync</p>"+
               "</div>"
            $("#"+containerid).append(t);
		}
		else
		{
			
			//li - aggiungo i files alla lista
			for (i=0;i<app.localdb.length;i++)
			{
				if (y3.havetags(app.localdb[i].filetags, tags))
				{
					// li - aggiungo il file alla lista
					t = t+("<li onclick = app.openFile(" + i +",false,false) ><a href='#'><img src='img/acrobat_thumb_80x80.jpg'/><h2>"+app.localdb[i].desc+"</h2><p>"+app.localdb[i].localPath+"</p></a></li>");
				}
			}
			
		$("#filelist_ul").append(t);
        $("#filelist_ul").listview("refresh");
		//$("#filelist_ul").filterable("refresh");
		$.mobile.navigate('#filelist');
			
		}
        y3.hideloading();
	},

	countfiles: function(tags){//per  sapere quanti file ci sono in ogni gruppo // i files devono avere TUTTI i tags richiesti, per essere contati
		var atags = tags.split(',');
		numberoffiles = 0;

		if (app.localdb == null)
		{
			app.localdb = [];
		}
		
		for (u=0;u<app.localdb.length;u++){
			includethis = true;
			for (x=0;x<atags.length;x++){
				if (app.localdb[u].filetags.toLowerCase().indexOf(atags[x]) == -1) includethis = false;
			};
			if (includethis) numberoffiles++;
		};
		return numberoffiles;
	},
	
	havetags: function(filetags, requiredtags){
		//verifico se filetags include tutti i tag richiesti (requiredtags)
		var atags = requiredtags.split(',');
		result = true;
		for (t=0; t<atags.length; t++){
			if (filetags.toLowerCase().indexOf(atags[t]) == -1) result = false; //se non ha tutti tag richiesti restituisco false
		};
		return result;
	},

	addlines: function(howmany){
		for (i=0;i<howmany;i++){
			newfile = {"fileid":5+i, "revision":1, "desc":"Dinamically added file n "+i, "filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf", "filetags":"#immagini,#presse"}
			app.localdb.push(newfile)
			}
	},
	
	createprogressbar: function(target){
		this.progressbar = TolitoProgressBar(target)
                    .setOuterTheme('b')
                    .setInnerTheme('e')
                    .isMini(true)
                    .setMax(1)
                    .setStartFrom(0)
                    .setInterval(100)
                    .showCounter(true)
                    //.logOptions()
                    .build()
                    .run();
					//per settarla ad un valore: y3.progressbar.setValue(300); (30%)
	},
	destroyprogressbar: function(){
		this.progressbar.destroy();
	},
	
	syncresult: function(){
		//porta l'utente alla pagina #filestosync la quale gli dice se ci sono file da scaricare.
		//Altrimenti porta l'utente alla pagina #no_filestosync per dirgli che non ci sono aggiornamenti
		var f = 0;
		if (app.toDownloadList != null) {f = app.toDownloadList.length};
		
		if (f > 0) {
			// scrivo nella pagina filestosync se ho dei files da scaricare
            navigator.notification.confirm('clicca Scarica per scaricare i nuovi files', y3.triggerDownload, f+' Aggiornamenti disponibili', 'Annulla,Scrica')
			
		}
		else{
			// nulla da scaricare, mando alla pagina #no_filestosync
			navigator.notification.alert('Non ci sono file da aggiornare', y3.triggerDownload, 'Nessun aggiornamento', 'Chiudi')
		}
		
		
	},

    
    triggerDownload: function(pressedButton){
        if (pressedButton == 2) app.downloadAllFiles();
        else { //con 1 ("Annulla del confirm) o 0 (tasto dell'alert) non faccio nulla
        }
        
    },
    
	showloading: function(){
        $.mobile.loading( "show", {
            text: 'Loading...',
            textVisible: 'true',
            theme: 'a',
            textonly: false,
            html: ''
    });
    },

    hideloading: function(){
        $.mobile.loading( "hide");
    },
    
    
    
    
    
    // ================== 4 DEBUG ===============================
	setDBasVariable: function(){
		y3.getlists();
		app.localGroupList = y3.grouplist;
		app.localdb = y3.filelist;
		y3.populatecontainer('homecontent');
	},

	
}
	
