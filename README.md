# WhatsApp Scraper - A Google Chrome Extension

<p align="center">
<img src="images/logo-WAScraper.png"/>
</p>
WhatsApp Scraper è un'estensione per browser Google Chrome che esporta le chat con i relativi messaggi e media da WhatsApp Web.<br> Progetto realizzato per l'esame di Sicurezza nelle reti (LM in Sicurezza Informatica @ Università degli studi di Bari Aldo Moro)

## Riepilogo Funzionalità
- Esportazione messaggi in formato csv
- Esportazione contenuti multimediali (immagini, audio, video, sticker, documenti, ...)
- Esportazione chat utente, chat di gruppo e canali
- Esportazione chat correntemente visualizzata
- Esportazione di chat specifiche, fornendo nome utente, numero di telefono o nome gruppo
- Esportazione delle chat di gruppo a cui appartiene il contatto indicato tramite nome utente o numero telefonico
- Esportazione di più chat contemporaneamente
- Esportazione globale di tutte le chat
- Esportazione in formato zip

## How To
### Prerequisiti
- Browser Google Chrome
- Sessione autenticata su WhatsApp Web (web.whatsapp.com)
### Installazione
1. Aprire il browser Google Chrome
2. Recarsi sulla pagina delle Estensioni digitando l’indirizzo chrome://extensions
3. Abilitare la Modalità sviluppatore cliccando sull’apposito pulsante
4. Cliccare su Carica estensione non pacchettizzata
5. Selezionare la directory dell’estensione
### "Bloccare" l'estensione nella toolbar di Chrome
1. Cliccare sul puzzle extension button <img src="https://winaero.com/blog/wp-content/uploads/2020/12/Extension-icon.png" width="20" height="20"/>
2. Cliccare su <img src="https://icon-library.com/images/icon-pins/icon-pins-0.jpg" width="20" height="20"/>

## Esportazione
### Configurazione
Attraverso la finestra popup, visualizzata al clic sull'icona dell'estensione, è possibile impostare i seguenti parametri.
- **Periodo di tempo** (giorni) rispetto al quale esportare chat con i relativi messaggi e contenuti multimediali (se abilitato)
- Elenco di **nomi gruppi, nomi utenti e numeri di telefono** di cui esportare le chat. Sono supportate anche le emoji. In caso di più valori, questi dovranno essere separati dalla virgola
- **Esportazione dei media** (disabilitato di default)
### Modalità esportazione
- **Esportazione della chat corrente**: modalità di esportazione di messaggi (e contenuti multimediali, se abilitato) nell’arco temporale indicato, eseguita quando non sono specificati nomi di gruppi o utenti o numeri di telefono nel campo di testo. L’utente  dovrà quindi aver visualizzato una chat, in caso contrario sarà mostrato un errore. Per avviare l’esportazione, occorre cliccare sul pulsante “Download”.
- **Esportazione delle chat specificate nella text area**: esportazione di messaggi (e contenuti multimediali, se abilitato), nell’arco temporale indicato, delle chat specificate dall’utente nel campo di testo tramite numeri telefonici, nomi utenti dei contatti e nomi di gruppi. Per avviare l’esportazione, occorre cliccare sul pulsante “Download”.
- **Esportazione di tutte le chat**: modalità che consente l’esportazione di tutti i messaggi (e contenuti multimediali, se abilitato) nell’arco temporale indicato, di tutte le chat, sia utente  che di gruppo. In questo caso, occorre cliccare sul pulsante “Download all”.
# Galleria immagini
<p>
<img src="https://user-images.githubusercontent.com/51539908/198267770-b014fef0-a495-49ba-9bfd-233507aff5da.jpg" width="40%"/>
<img src="https://user-images.githubusercontent.com/51539908/198267771-29aff5e4-d20c-4269-971e-12417eca30a1.jpg" width="40%" />
<img src="https://user-images.githubusercontent.com/51539908/198267777-8d65e4ee-163e-49f3-8cf4-9738ae0b32c8.png" width="40%"/>
<img src="https://user-images.githubusercontent.com/51539908/198267775-348604ab-a9f0-4719-b9e1-23963c13d0a0.png" width="40%"/>
<img src="https://user-images.githubusercontent.com/51539908/198267781-e808f880-dbf9-4878-ab68-589e8619fd8e.png" width="40%"/>
<img src="https://user-images.githubusercontent.com/51539908/198267780-5179791c-1f93-4529-affd-5583b25a10b8.png" width="40%"/>
</p>

