// JavaScript Document

var y3 = {
    // Application Constructor
    initialize: function(containerid) {
        this.getlists();
		this.populatecontainer(containerid);
    },
	
	grouplist: null, //lista files
	filelist: null, //lista files

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
				"grouptags":"#presse",
				"grouptitle":"Linee e macchinari",
				"desc":"Presse",
				"notes":"Tutti i documenti relativi alle presse."
			},
			{
				"groupid":3,
				"grouptags":"#linee,#pasta secca",
				"grouptitle":"Linee e macchinari",
				"desc":"Linee per pasta secca",
				"notes":"Tutti i documenti relativi alle linee per pasta secca."
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

		];
		console.log('Ho popolato una lista di gruppi ed una di files...');
    },
	
	populatecontainer: function(containerid){
		
		var listCreated = false;
		var tags = '';
		var files, tot_files, groupid = 0;
		var oldgrouptitle = '';
		var datacollapsed = "false";
		if (y3.grouplist.length == 0) {console.log('ERRORE: grouplist è vuoto!');}

		$("#"+containerid).empty(); // distruggo il contenuto del containerid
		
		//collapsible
		for (i=0;i<y3.grouplist.length;i++)
		{//collapsible: grouplist
			
			
			if (y3.grouplist[i].grouptitle != oldgrouptitle) //aggiungo nuovo collapsible
			{// è necessario che nel db i gruppi siano ordinati per groutitle
				groupid = y3.grouplist[i].groupid; //id del collapsible, viene usato per inserirvi i <li>
				oldgrouptitle = y3.grouplist[i].grouptitle; // riferimento per sapere quando cambia il tipo di raggruppamento (per fare un nuovo collapsible)
				if (i>0) datacollapsed = 'true'//il primo collapsible è sempre aperto di default
				$("#"+containerid).append("<div data-role='collapsible' data-theme='c' data-collapsed='"+datacollapsed+"' id='collapsible"+groupid+"' class='collapsible_refreshme'>");
				console.log('ho aggiunto un collabsible');
				files = y3.countfiles(y3.grouplist[i].grouptags);//contiene i files che presentano TUTTI i tag richiesti da questo gruppo
				$("#collapsible"+groupid).append("<h2>"+y3.grouplist[i].grouptitle+"</h2>");//titolo del collapsible
				$("#"+y3.grouplist[i].groupid+"_filecount").append(tot_files);
				$("#collapsible"+groupid).append("<ul data-role='listview' id='collapsible"+y3.grouplist[i].groupid+"_list'>");//ul
				$("#collapsible"+groupid+"_list").append("<li><a href='#filelist'><h2>"+y3.grouplist[i].desc+"</h2><p>"+y3.grouplist[i].grouptags+"</p><p class='ui-li-aside'><strong>"+files+"</strong> files</p></a></li>");
				console.log('ho aggiunto il primo <li>');
			}
			else // aggiungo categorie al collapsible esistente
			{
				files = y3.countfiles(y3.grouplist[i].grouptags);//contiene i files che presentano TUTTI i tag richiesti da questo gruppo
				$("#collapsible"+groupid+"_list").append("<li><a href='#filelist'><h2>"+y3.grouplist[i].desc+"</h2><p>"+y3.grouplist[i].grouptags+"</p><p class='ui-li-aside'><strong>"+files+"</strong> files</p></a></li>");
				console.log('ho aggiunto un altro <li>');				
			}
			
		
		};//collapsible: grouplist
		
		$("#"+oldgrouptitle+"_filecount").append(tot_files);//se ho un gruppo solo, devo scrivere il totale dei suoi file qui, perchè non faccio un altro giro.
		$(".collapsible_refreshme").collapsible().trigger('create'); // creo il collapsible (altrimenti non sarebbe impaginato)

		},
		
		countfiles: function(tags){//per  sapere quanti file ci sono in ogni gruppo
			var atags = tags.split(',');
			numberoffiles = 0;
			
			for (u=0;u<y3.filelist.length;u++){
				includethis = true;
				for (x=0;x<atags.length;x++){
					if (y3.filelist[u].filetags.toLowerCase().indexOf(atags[x]) == -1) includethis = false;
				};
				if (includethis) numberoffiles++;
			};
			return numberoffiles;
		}
}
	
