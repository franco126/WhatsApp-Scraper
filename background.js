/* Per ottenere l'ip dell'utente */
chrome.runtime.onMessage.addListener((message, sender, response) => {

  if(message.name =="fetchIP"){

    const url = "https://jsonip.com/";
    fetch(url).then(function(res){

      if (res.status !== 200 ){
        response({ip: 'error', desc: 'Errore nella richiesta'})
      }
      res.json().then(function(data){
        //invia la risposta
        response({ip: data.ip, desc: 'IP ottenuto'})
      });

    }).catch(function(error){
      response({ip: 'errore', desc: 'Errore nella richiesta'})
    });
  }
  return true;
});