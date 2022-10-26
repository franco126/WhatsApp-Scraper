function download_chat(download_type){

    var contacts = [];
    //Verifico l'input utente
    if (download_type == "one")
        contacts = checkContactsList(document.getElementById("contactsList").value);
    
    //Setto le impostazioni necessarie per il download
    chrome.storage.local.set(
        {
           'firstDate': new Date(document.getElementById('firstDate').value).getTime()/1000,
           'lastDate': new Date(document.getElementById('lastDate').value).getTime()/1000,
           'save_media': document.getElementById("media_cb").checked,
           'export_type': "CSV (chat)",
           'is_skip_msg': document.getElementById("unmedia_cb").checked,
           'download_type': download_type,
           "contactsList": contacts

        }, function(){

            chrome.tabs.query( {active: true, currentWindow: true}, function(tabs) 
            {
                //Manda un messaggio al content script (cs.js)
                chrome.tabs.sendMessage(tabs[0].id, {key: "send_data"}, null);                
            });

        });
}

document.addEventListener('DOMContentLoaded', (setUp) => {
    
    //Imposta unresolved media disattivato
    document.getElementById('unmedia_cb').disabled = true;

    //Verifico di essere su web.whatsapp.com
    chrome.tabs.query( {active: true, currentWindow: true}, function(tabs) 
    {
        if ( tabs[0].url != "https://web.whatsapp.com/")
        {
            document.getElementById("oops-box").style.display = "inline-block";
            document.getElementById("main-box").style.display = "none";
        }
    });
    
    /*Inizializzo i campi data*/
    var start_date = document.getElementById("firstDate");
    var end_date = document.getElementById("lastDate");
    var today = new Date();
    //Imposto la data finale al giorno successivo ad oggi per poter estrarre i messaggi del giorno corrente
    today.setDate(today.getDate()+1);

    //Oggi
    end_date.value = today.toISOString().substr(0, 10);
    //console.log("Last date value: ", end_date.value);

    //Sette giorni prima di oggi
    var m = moment(today.toISOString().substr(0, 10));
    //console.log(m.format().substr(0,10));
    var seven_dayes_ago = m.subtract(7,'days');
    start_date.value = seven_dayes_ago.format().substr(0,10);
    //console.log("First date value: ", start_date.value);

    //Se last date è precedente a start, imposta start date ad una settimana prima 
    end_date.addEventListener("change", function() {
        var firstDate = document.getElementById("firstDate").value;
        //console.log(firstDate);
        var lastDate = document.getElementById("lastDate").value;
        if ( moment(lastDate).isBefore(firstDate) )
        {
            m = moment(lastDate);
            seven_dayes_ago = m.subtract(7,'days');
            start_date.value = seven_dayes_ago.format().substr(0,10);
            //console.log("New first date value:", start_date.value);
            //console.log("New last date value:", end_date.value);
        }
    });

    //Se start date è successivo a last date, imposta last date a una settimana dopo
    start_date.addEventListener("change", function() {
        var firstDate = document.getElementById("firstDate").value;
        //console.log(firstDate);
        var lastDate = document.getElementById("lastDate").value;
        if ( moment(firstDate).isAfter(lastDate) )
        {
            m = moment(firstDate);
            var seven_dayes_later = m.add(7,'days');
            end_date.value = seven_dayes_later.format().substr(0,10);
            //console.log("New first date value:", start_date.value);
            //console.log("New last date value:", end_date.value);
        }
    });

    /* Per gestire la text area dei numeri di telefono */
    /*
    var contacts_text = document.getElementById("contactsList");
    contacts_text.addEventListener("input", function handleChange(event){
        contacts_text.style.borderColor="";
        //console.log(event);
        //console.log("Valore: ", event.data);
        //Se il carattere non è uno spazio vuoto o un numero, segnalo errore
        if ( event.data != null && event.data!= ' ' && !isNumeric(event.data) && event.data != ','){
            //console.log("ERORRE");
            contacts_text.style.borderColor="red";
        }
    });
    */

    /*Se "scarica media" è flaggato, allora abilito il pulsante per media non disposnibili */
    document.querySelector('#media_cb').addEventListener('change', function() {
        if(this.checked)
            document.getElementById('unmedia_cb').disabled = false;
        else
            document.getElementById('unmedia_cb').disabled = true;
    });
    
    /* Listener se viene cliccato il tasto download */
    var btn_download = document.getElementById("download");
    btn_download.addEventListener("click", ()=> {
        download_chat("one");
    });

    /* Listener se viene cliccato il tasto download all */
    var btn_download_all = document.getElementById("download_all");
    btn_download_all.addEventListener("click", ()=> {
        download_chat("all");
    });

});

/** Verifico che ogni singolo carattere scritto dall'utente sia un numero*/
function isNumeric(value)
{
    return /^\d+$/.test(value);
}

/** Verifica che si tratti di un numero telefonico */
function isValidPhoneNumber(value)
{
    const re = new RegExp('^39[0-9]{10}');
    return re.test(value);
}

/** Restituisce la lista di contatti validi inseriti nella textarea */
//I valori sono separati da virgola. 
//Ogni valore viene poi controllato se è un numero di telefono valido o una stringa di lunghezza massima 25 (limite per i nomi gruppo)
function checkContactsList(contactsList)
{
    const NAME_LENGTH = 25;
    var valid_contacts = [];
    if (contactsList != "")
    {
        var array_contacts = contactsList.split(',');
        for ( let i = 0; i < array_contacts.length; i++ )
        {
            current = array_contacts[i].trim();
            if (isValidPhoneNumber(current))
                valid_contacts.push(current);
            else if (current.length < NAME_LENGTH )
                valid_contacts.push(current);
        }
        console.log("Valori validi: ", valid_contacts);
    }
    return valid_contacts;
}

