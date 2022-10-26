/* contentscript */
var clientIP = "";
var md5_value = "";
var sha256_value = "";

/**Funzione per injettare ulteriori script nella pagina */
function inject_script(file)
{
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = chrome.runtime.getURL(file);
    (document.head || documentElement).appendChild(script);
}

inject_script("scripts/injectedWA.js");

/* Get IP Address. La richiesta viene fatta in background.js */
chrome.runtime.sendMessage({name: "fetchIP"}, (response) => {
    console.log("IP Pubblico: ", response.ip);
    clientIP = response.ip
});

/*Funzione per ottenere data e ora correnti*/
function getDateAndTime()
{
    var today = new Date();
    var day = today.getDate();
    var month = today.getMonth()+1;
    var year = today.getFullYear();

    var time = today.toLocaleTimeString(); //orarario secondo il fusio orario locale
    var date_time = year + "-" + month + "-" + day + "@" + time;

    console.log("Data e ora esportazione: ", date_time);
    return date_time;
}

//Callback di calculateHash()
function cb_afterCalculation(hash) {
    console.log("Calculated MD5: " + hash.md5);
    console.log("Calculated SHA256: " + hash.sha256);
    md5_value = hash.md5;
    sha256_value = hash.sha256;
}

function calculateHash(blob, callback) {
    var reader = new FileReader();
    reader.readAsArrayBuffer(blob);
    reader.onloadend = function () {
        var wordArray = CryptoJS.lib.WordArray.create(reader.result);
        var MD5hash = CryptoJS.MD5(wordArray).toString();
        var SHA256hash = CryptoJS.SHA256(wordArray).toString();

        var result = {};
        result.md5=MD5hash;
        result.sha256 = SHA256hash;
        callback(result);
    };
}

/*Generazione del report*/ 
function createReport()
{
    var str = "Export generato dall'estensione WAScraper 2.0 \n";
    str += "-------------------------------------------------------- \n";
    str += "Export time: " + getDateAndTime() + "\n";
    str += "\n\n";
    str += "Client info: \n";
    str += "------------\n";
    if( clientIP != ' ')
        str += " - IP address (public): "+ clientIP +"\n";
    else
        str += " - IP address (public): ERRORE" + "\n";
    str += " - Browser version: " + navigator.userAgent + "\n";
    str += " - Language: " + navigator.language + "\n";
    str += "\n\n";
    str += "Validate info: \n";
    str += "--------------\n";
    str += "Hash:\n";
    if (md5_value != ' ' && sha256_value != ' ')
    {
        str += " - [MD5]: "+ md5_value + "\n";
        str += " - [SHA-256]: "+ sha256_value + "\n";
    }
    else
    {
        str += " - [MD5]: ERRORE" + "\n";
        str += " - [SHA-256]: ERRORE"+ "\n";
    }
    
    str += "File extension: zip\n";

    return str;
}

//Funzione per l'esportazione di una singola chat
function zipBlob(media, chat, username)
{
    var zipChat = new JSZip;
    var zipContainer = null;

    username = username.replace(/[/\\?%*:|"<>]/g, '-'); //remove illegal characters from file name
    media.push({name: username + '.csv', file: chat});
    for(let i = 0; i < media.length; i++)
    {
        console.log("File da zippare",media[i].name);
    }
   
    for(let i = 0; i < media.length; i++ )
    {
        zipChat.file(media[i].name, media[i].file);
    }

    chatZip_filename="Chat_"+username+"_Export_.zip";
    zipChat.generateAsync({type: "blob"}, function updateCallback(metadata){
        //console.log("Progresso: "+ metadata.percent.toFixed(2) + " %");
        document.dispatchEvent(new CustomEvent('set_progress_text', {detail: "Progresso esportazione: "+ metadata.percent.toFixed(2) + " %"}))
        
    }).then(function(content){
        var first_zip = content;
        calculateHash(content, cb_afterCalculation);

        setTimeout(function(){
            zipContainer = new JSZip;

            zipContainer.file("report.txt", createReport());
            zipContainer.file(chatZip_filename, first_zip);

            zipContainer.generateAsync({type: "blob"}, function updateCallback(metadata){
                //console.log("Progresso: "+ metadata.percent.toFixed(2) + " %");
                document.dispatchEvent(new CustomEvent('set_progress_text', {detail: "Progresso esportazione: "+ metadata.percent.toFixed(2) + " %"}))
                
            }).then(function(fileZip)
            {
                var zipName = "WAScraper_export.zip";
                saveAs(fileZip, zipName);
                document.dispatchEvent(new CustomEvent('finish'));
            })

        }, 2000);

    });
    
}

//Funzione per l'esportazione di più chat contemporaneamente
function zipBlobAll(data)
{
    var zipChat = new JSZip;
    var zipContainer = null;

    for( let i=0; i < data.length; i++ )
    {
        var media = data[i].media;
        var username = data[i].title;
        var chat = data[i].doc;

        username = username.replace(/[/\\?%*:|"<>]/g, '-'); //remove illegal characters from file name
        media.push({name: username + '.csv', file: chat});
        var folder = zipChat.folder("Chat_"+username+"_Export");
        for(let i = 0; i < media.length; i++ )
        {
            folder.file(media[i].name, media[i].file);
        }
    }

    var time = getDateAndTime();

    chatsZip_filename="Chats_Export_" + time.replace(/:/g,'-') + ".zip"; //Occorre rimuovere i : dal nome del file
    zipChat.generateAsync({type: "blob"}, function updateCallback(metadata){
        //console.log("Progresso: "+ metadata.percent.toFixed(2) + " %");
        document.dispatchEvent(new CustomEvent('set_progress_text', {detail: "Progresso esportazione: "+ metadata.percent.toFixed(2) + " %"}))

    }).then(function(content){
        var zip_folders = content;
        calculateHash(content, cb_afterCalculation);
        
        setTimeout(function(){ 
            zipContainer = new JSZip;
            zipContainer.file("report.txt", createReport());
            zipContainer.file(chatsZip_filename, zip_folders);

            zipContainer.generateAsync({type: "blob"}, function updateCallback(metadata){
                //console.log("Progresso: "+ metadata.percent.toFixed(2) + " %");
                document.dispatchEvent(new CustomEvent('set_progress_text', {detail: "Progresso esportazione: "+ metadata.percent.toFixed(2) + " %"}))

            }).then(function(fileZip){
                var zipName = "WAScraper_export.zip";
                saveAs(fileZip, zipName);
                document.dispatchEvent(new CustomEvent('finish'));
            })

        }, 2000);
    });
    
}

/* ricevo il messaggio dalla funzione download_chat (popup.js) per avvisarmi che i dati per il download sono stati impostati */
var settings ="";
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if ( request.key === "send_data" )
    {
        //passo null così mi viene restituito l'intero storage
        chrome.storage.local.get(null, function(values){
            settings = JSON.stringify(values);
            console.log("Impostazioni utente da popup.js\n", settings);

            //Creo un nuovo evento per avviare l'esportazione delle chat
            //con le impostazioni scelte dall'utente
            //Detail è un campo dell'oggeto Evento che viene creato. A questo associamo i valori impostati nel popup
            document.dispatchEvent(new CustomEvent('to_injected_get_data',{'detail': settings}));
        });
    }    
});

/**
 * Event listener post scraping
 */
window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
        return;
    
    if (event.data.length == 1)
    {
        if (event.data[0].type && (event.data[0].type == "CSV")) 
        {
            console.log("Avvio esportazione in zip (singola chat)");
            zipBlob(event.data[0].media, event.data[0].doc, event.data[0].title)
        }
    }
    if (event.data.length > 1 )
    {
        console.log("Avvio esportazione in zip (chat multiple)");
        zipBlobAll(event.data);
    }
});

