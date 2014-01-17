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
			{
				"groupid":0, //id, per identificare univocamente gli oggetti HTML e manipolarli
				"grouptag":"#cataloghi", // tutti i documenti con almeno uno di questi tag, vengono inclusi in questo gruppo
				"grouptitle":"Tipi di documenti", //titolo del collapsible, visibile all'utente
				"desc":"Cataloghi e Schede tecniche", //titolo della categoria (cliccabile)
				"notes":"Cataloghi prodotti e linee in pdf." // descrizione aggiuntiva della categoria, compare sotto al titolo
			},
			{
				"groupid":1,
				"grouptag":"#manuali",
				"grouptitle":"Tipi di documenti",
				"desc":"Manuali",
				"notes":"Manuali operativi e di manutenzione"
			},
			{
				"groupid":2,
				"grouptag":"#presse",
				"grouptitle":"Linee e macchinari",
				"desc":"Presse",
				"notes":"Tutti i documenti relativi alle presse."
			}
		];
		
		
		
		this.filelist = [
			{
				"fileid":0,
				"revision":11,
				"desc":"Catalogo generale Linee pasta secca", //compare sotto al nome del file
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#cataloghi,#pasta secca,#Linee,#IT"
			},
			{
				"fileid":1,
				"revision":12,
				"desc":"Catalogo generale Linee pasta fresca",
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#cataloghi,#pasta fresca,#Linee,#IT"
			},
			{
				"fileid":2,
				"revision":12,
				"desc":"Manuale operartivo Pressa 130.1.",
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#manuali,#Linee,#IT"
			},
			{
				"fileid":3,
				"revision":11,
				"desc":"Manuale operativo Linea Omnia",
				"filePath":"http://www.storci.com/pdf/products/vsfTVmix.pdf",
				"filetags":"#manuali,#pasta secca,#Linee,#Omnia,#IT"
			},

		];
		console.log('Ho popolato una lista di gruppi ed una di files...');
    },
	
	populatecontainer: function(containerid){
		
		var listCreated = false;
		var tags = '';
		var files, tot_files, groupid = 0;
		var oldgrouptitle = '';
		if (y3.grouplist.length == 0) {console.log('ERRORE: grouplist è vuoto!');}

		//collapsible
		for (i=0;i<y3.grouplist.length;i++)
		{//collapsible: grouplist
			
			
			if (y3.grouplist[i].grouptitle != oldgrouptitle) //aggiungo nuovo collapsible
			{
				$("#"+oldgrouptitle+"_filecount").append(tot_files); //scrivo nel vecchio collapsible la somma di tutti i file in esso contenuti
				groupid = y3.grouplist[i].groupid; //id del collapsible, viene usato per inserirvi i <li>
				oldgrouptitle = y3.grouplist[i].grouptitle; // riferimento per sapere quando cambia il tipo di raggruppamento (per fare un nuovo collapsible)
				$("#"+containerid).append("<div data-role='collapsible' data-theme='c' data-collapsed='false' id='collapsible"+groupid+"' class='collapsible_refreshme'>");
				console.log('ho aggiunto un collabsible');
				files = i+1;//TODO contare i documenti con i tag di questo gruppo.
				tot_files = files;
				$("#collapsible"+groupid).append("<h2>"+y3.grouplist[i].grouptitle+"<span class='ui-li-count' id='"+y3.grouplist[i].groupid+"_filecount'></span></h2>");//titolo del collapsible
				$("#"+y3.grouplist[i].groupid+"_filecount").append(tot_files);
				$("#collapsible"+groupid).append("<ul data-role='listview' id='collapsible"+y3.grouplist[i].groupid+"_list'>");//ul
				$("#collapsible"+groupid+"_list").append("<li><a href='#filelist'><h2>"+y3.grouplist[i].desc+"</h2><p>"+y3.grouplist[i].notes+"</p><p class='ui-li-aside'><strong>??</strong> files</p></a></li>");
				console.log('ho aggiunto il primo <li>');
			}
			else // aggiungo categorie al collapsible esistente
			{
				$("#collapsible"+groupid+"_list").append("<li><a href='#filelist'><h2>"+y3.grouplist[i].desc+"</h2><p>"+y3.grouplist[i].notes+"</p><p class='ui-li-aside'><strong>??</strong> files</p></a></li>");
				console.log('ho aggiunto un altro <li>');				
			}
			
		
		};//collapsible: grouplist
		
		$("#"+oldgrouptitle+"_filecount").append(tot_files);//se ho un gruppo solo, devo scrivere il totale dei suoi file qui, perchè non faccio un altro giro.
		$(".collapsible_refreshme").collapsible().trigger('create'); // creo il collapsible (altrimenti non sarebbe impaginato)

		}
}
	
