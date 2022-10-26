
//Variabile array globale che contiene i media, messaggi e "titolo" di ogni chat che sarà esportata
var chats = [];

var error_alert = function (e) {
    alert(e), WASaver.stopProgress()
},
get_date = function (e, _, t) {
    let s = new Date(e),
        a = s.getFullYear(),
        i = s.getMonth() + 1;
    i = i < 10 ? "0" + i : i;
    let o = s.getDate(),
        d = a + _ + i + _ + (o = o < 10 ? "0" + o : o);
    if (t) {
        d += _ + (s.getHours() < 10 ? "0" + s.getHours() : s.getHours()) + (s.getMinutes() < 10 ? "0" + s.getMinutes() : s.getMinutes()) + (s.getSeconds() < 10 ? "0" + s.getSeconds() : s.getSeconds())
    }
    return d
};

function getMyName() {
    let e;
    for (const _ in WASaver.get_WAStore().Contact._index) WASaver.get_WAStore().Contact._index[_].__x_isMe && (e = WASaver.get_WAStore().Contact._index[_]);
    return e
}

var get_time_from_ts = function (e) {
    const _ = new Date(e);
    return (_.getHours() < 10 ? "0" + _.getHours() : _.getHours()) + ":" + (_.getMinutes() < 10 ? "0" + _.getMinutes() : _.getMinutes()) + ":" + (_.getSeconds() < 10 ? "0" + _.getSeconds() : _.getSeconds())
},
is_next_day = function (e, _) {
        const t = new Date(e),
            s = new Date(_);
        return t.getFullYear() !== s.getFullYear() || t.getMonth() !== s.getMonth() || t.getDate() !== s.getDate()
},
get_not_nulled_user = function (e) {
    let _;
    return e.__x_sender ? _ = e.__x_sender.user ? e.__x_sender.user : "" : e.__x_from && (_ = e.__x_from.user ? e.__x_from.user : ""), _
},
find_by_id = function (e, _){
    return e.find(function (e) {
            return e.__x_id.id === _
    })
},
display_quoted_message_csv = function (e) {
        let _ = "";
        switch (e.__x_type) {
            case "chat":
                _ = e.body;
                break;
            case "image":
            case "video":
            case "audio":
            case "ptt":
            case "document":
            case "sticker":
                let t = e.__x_mimetype || e.mediaData.mediaBlob && e.mediaData.mediaBlob._mimetype,
                    s = WASaver.get_file_extension(t);
                s || (s = "." + t.split("/").pop()), _ = (void 0 !== e.__x_text ? e.__x_text + " " : "") + get_date(1e3 * e.__x_t, "_") + "_" + e.__x_id.id + s;
                break;
            case "location":
                _ = "location (latitude: " + e.__x_lat + ", longitude: " + e.__x_lng + ")"
        }
        return _
},
log_progress = function (e) {
    console.log(e)
},
proceed = function (e, _) {
    const t = _.mediaData.mediaBlob._mimetype || _.mediaData.mediaBlob.type,
        s = _.mediaData.mediaBlob._blob || _.mediaData.mediaBlob;
    let a = WASaver.get_file_extension(t);
    a || (a = "." + t.split("/").pop());
    let i = get_date(1e3 * _.__x_t, "_", !0) + "_" + _.__x_id.id + a;
    WASaver.add_to_media_utils(_.__x_id.id, i), WASaver.add_to_media({
        name: i,
        file: s
    })
},
downloadMedia = async function () {
    if (WASaver.setProgressText("Downloading media..."), log_progress("[Chat log MEDIA]: Downloading media..."), 0 !== WASaver.get_msgs().length) {
        let _ = [];
        const t = WASaver.get_msgs().filter(e => void 0 !== e.mediaData);
        for (let s = 0; len = t.length, s < len; s++) {
            let a = t[s];
            if (!a.__x_isUnsentMedia) try {
                log_progress("[Chat log MEDIA]: msg type: " + a.__x_type + ", time sent: " + a.__x_t);
                var e = {
                    directPath: a.directPath,
                    encFilehash: a.encFilehash,
                    filehash: a.filehash,
                    mediaKey: a.mediaKey,
                    mediaKeyTimestamp: a.mediaKeyTimestamp,
                    signal: (new AbortController).signal,
                    type: a.type,
                    userDownloadAttemptCount: 0,
                    downloadOrigin: 1,
                    mode: "auto"
                };
                "RESOLVED" === a.mediaObject.downloadStage || "INIT" === a.mediaObject.downloadStage && !1 === WASaver.get_is_skip_msg() ? WASaver.setProgressText("Fetching media information: " + (s + 1) + " out of " + len) : "NEED_POKE" !== a.mediaObject.downloadStage && "INIT" !== a.mediaObject.downloadStage || !0 !== WASaver.get_is_skip_msg() || (WASaver.setProgressText("Unresolved or missing piece of media: " + (s + 1) + " out of " + len), await a.downloadMedia({
                    downloadEvenIfExpensive: !0,
                    isUserInitiated: !1,
                    rmrReason: 15
                }));
                const t = await WASaver.get_WAMedia().downloadAndDecrypt(e);
                _.push({
                    msg: a,
                    resp: t
                })
            } catch (e) {
                log_progress("[Chat log MEDIA ERROR]: " + e.stack + ". Msg type: " + a.__x_type + ", time sent: " + a.__x_t)
            }
        }
        const s = e => {
            let _ = "";
            const t = new Uint8Array(e),
                s = t.byteLength;
            for (let e = 0; e < s; e++) _ += String.fromCharCode(t[e]);
            return window.btoa(_)
        },
            a = (e, _) => fetch(`data:${_};base64,${e}`).then(e => e.blob());
        let i = 0;
        for (let e = 0; len = _.length, e < len; e++) try {
            WASaver.setProgressText("Downloading media: " + (e + 1) + " out of " + len);
            const t = s(_[e].resp),
                o = await a(t, _[e].msg.mimetype);
            i++, _[e].msg.mediaData.mediaBlob = o, proceed(e, _[e].msg)
        } catch (t) {
            i++, log_progress("[Chat log MEDIA ERROR]: " + t + ". Msg type: " + _[e].msg.__x_type + ", time sent: " + _[e].msg.__x_t)
        }
    }
},
convertArrayOfObjectsToCSV = function (e) {
        let _, t, s, a;
        const i = e.columnDelimiter || ";",
            o = e.lineDelimiter || "\n";
        return null != (a = e.data || null) && a.length ? (s = Object.keys(a[0]), _ = "", _ += s.join(i), _ += o, a.forEach(function (e) {
            t = 0, s.forEach(function (s) {
                t > 0 && (_ += i), "MessageBody" === s && (e[s] = e[s].replace(/"/g, '\\""'), e[s] = e[s].replace(/\n/g, "\\n")), "QuotedMessage" === s && (e[s] = e[s].replace(/"/g, '\\""'), e[s] = e[s].replace(/\n/g, "\\n")), _ += '"' + e[s] + '"', t++
            }), _ += o
        }), _) : null
},
proceedMessages_CSV = async function (e) {
    try {
        if (WASaver.is_grab_media())
            await downloadMedia();
        let _ = [];
        for (let e = 0; len = WASaver.get_msgs().length, e < len; e++) {
            const t = {};
            for (const e of WASaver.get_columns()) t[e] = "";
            let s, a = WASaver.get_msgs()[e];
            if (e > 0 && (s = WASaver.get_msgs()[e - 1]), "e2e_notification" === a.__x_type) continue;
            let i = get_not_nulled_user(a),
                o = WASaver.retrieve_from_color_utils(i) ? WASaver.retrieve_from_color_utils(i).name : "",
                d = get_date(1e3 * a.__x_t, "-"),
                l = get_time_from_ts(1e3 * a.__x_t),
                n = "",
                c = "",
                r = "";
            if ("chat" === a.__x_type) n = a.__x_text;
            else if (a.__x_isMedia || "ptt" === a.__x_type || "document" === a.__x_type || "sticker" === a.__x_type && a.mediaData && a.mediaData.mediaBlob) {
                let e = a.__x_mimetype;
                e || (e = a.mediaData && a.mediaData.mediaBlob ? a.mediaData.mediaBlob._mimetype || a.mediaData.mediaBlob.type : "undef");
                let _ = WASaver.get_file_extension(e);
                _ || (_ = "." + e.split("/").pop()), n = (void 0 !== a.__x_text ? a.__x_text + " " : "") + get_date(1e3 * a.__x_t, "_", !0) + "_" + a.__x_id.id + _, c = a.__x_type, "audio" === a.__x_type && (c = "forwarded audio"), "ptt" === a.__x_type && (c = "recorded audio"), a.__x_isGif && (_ = ".gif", c = "GIF"), r = '=HYPERLINK(""' + get_date(1e3 * a.__x_t, "_", !0) + "_" + a.__x_id.id + _ + '"")'
            } else if ("gp2" === a.__x_type) {
                if ("add" === a.__x_subtype || "leave" === a.__x_subtype || "remove" === a.__x_subtype) {
                    for (let e = 0; e < a.__x_recipients.length; e++) i = a.__x_recipients[e] ? a.__x_recipients[e].user : "", o = WASaver.retrieve_from_color_utils(i) ? WASaver.retrieve_from_color_utils(i).name : "", "add" === a.__x_subtype ? n = "was added to chat" : "leave" === a.__x_subtype ? n = "left chat" : "remove" === a.__x_subtype && (n = "was removed from chat"), t.hasOwnProperty("Date1") && (t.Date1 = !s || s && ("e2e_notification" === s.__x_type || is_next_day(1e3 * a.__x_t, 1e3 * s.__x_t)) ? d : ""), t.hasOwnProperty("Date2") && (t.Date2 = d), t.hasOwnProperty("Time") && (t.Time = l), t.hasOwnProperty("UserPhone") && (t.UserPhone = i), t.hasOwnProperty("UserName") && (t.UserName = o), t.hasOwnProperty("MessageBody") && (t.MessageBody = n), t.hasOwnProperty("MediaType") && (t.MediaType = ""), t.hasOwnProperty("QuotedMessage") && (t.QuotedMessage = ""), t.hasOwnProperty("QuotedMessageDate") && (t.QuotedMessageDate = ""), t.hasOwnProperty("QuotedMessageTime") && (t.QuotedMessageTime = ""), _.push(t);
                    continue
                }
                "create" === a.__x_subtype && (n = "created chat"), "picture" === a.__x_subtype && (n = "changed chat picture"), "subject" === a.__x_subtype && (n = i + " changed subject to " + a.__x_body), "modify" === a.__x_subtype && (n = i + " was changed to " + (a.__x_recipients[0] ? a.__x_recipients[0].user : "no phone data"))
            } else "location" === a.__x_type ? n = "https://maps.google.com/maps?q=" + a.__x_lat + "," + a.__x_lng : "revoked" === a.__x_type ? n = "this message has been deleted" : "call_log" === a.__x_type ? ("miss" === a.__x_subtype && (n = "missed voice call"), "miss_video" === a.__x_subtype && (n = "missed video call")) : n = a.__x_type;
            let u = "",
                p = "",
                v = "";
            if (void 0 !== a.__x_quotedMsg) {
                let _ = WASaver.get_msgs().slice(0, e),
                    t = find_by_id(_, a.__x_quotedStanzaID);
                void 0 !== t && (u = display_quoted_message_csv(t), p = get_date(1e3 * t.__x_t, "-"), v = get_time_from_ts(1e3 * t.__x_t))
            }
            t.hasOwnProperty("Date1") && (t.Date1 = !s || s && ("e2e_notification" === s.__x_type || is_next_day(1e3 * a.__x_t, 1e3 * s.__x_t)) ? d : ""), t.hasOwnProperty("Date2") && (t.Date2 = d), t.hasOwnProperty("Time") && (t.Time = l), t.hasOwnProperty("UserPhone") && (t.UserPhone = i), t.hasOwnProperty("UserName") && (t.UserName = o), t.hasOwnProperty("MessageBody") && (t.MessageBody = n), t.hasOwnProperty("MediaType") && (t.MediaType = c), /*t.hasOwnProperty("MediaLink") && (t.MediaLink = r),*/ t.hasOwnProperty("QuotedMessage") && (t.QuotedMessage = u), t.hasOwnProperty("QuotedMessageDate") && (t.QuotedMessageDate = p), t.hasOwnProperty("QuotedMessageTime") && (t.QuotedMessageTime = v), _.push(t)
        }
        if (_.length > 0) {
            let e = "\ufeff" + convertArrayOfObjectsToCSV({
                data: _,
                columnDelimiter: WASaver.get_delimiter()
            });
            WASaver.set_Doc(e)
        }
        e(), await sleep(2000);
    } catch (e) {
        console.log(e.message), 
        error_alert(e.message)
    }
};

var load_msgs = async function (e, _) {
    const t = e.msgs._models[0].__x_t,
        s = await WASaver.get_WAMsgs().loadEarlierMsgs(e);
    if (s && s.length > 0) 
    {
        let a = s.filter(e => e.__x_t >= _.firstDate && e.__x_t < _.lastDate);
        if ( a.length > 0 )
        {
            WASaver.setProgressText("Downloaded messages: " + WASaver.get_msgs().length);
            WASaver.fill_msgs(a);
            if (  s[0].__x_t < _.firstDate || t === s[0].__x_t )
                await export_chats(_.export_type, e)
            else
                {
                    if ( a.length === 0 )
                    {
                        WASaver.set_total_skipped_in_time_msgs(s.length)
                        WASaver.setProgressText("Searching for messages between the two dates... Skipped: " + WASaver.get_total_skipped_in_time_msgs())
                    }
                    //await sleep(1500);
                    await load_msgs(e, _);
                }
        }
    } 
    else 
        await export_chats(_.export_type, e);
};

document.addEventListener("to_injected_get_data", function (e) {
    let _ = "undefined" != typeof WASaver,
        t = {};
    _ && (t.store = WASaver.get_WAStore(), t.media = WASaver.get_WAMedia(), t.msgs = WASaver.get_WAMsgs()),
        function (_) {
            var t, s, a, i, o, d, l = [];
            let n;
            _.fill_msgs = function (e) {
                l.unshift(...e)
            }, _.get_msgs = function () {
                return l
            }, _.clear_msgs = function () {
                l = []
            }, _.set_first_date = function (e) {
                t = e
            }, _.set_last_date = function (e) {
                s = e
            }, _.get_first_date = function () {
                return t
            }, _.get_last_date = function () {
                return s
            }, _.set_WAStore = function (e) {
                a = e
            }, _.get_WAStore = function () {
                return a
            }, _.set_WAConn = function (e) {
                i = e
            }, _.get_WAConn = function () {
                return i
            }, _.set_WACrypto = function (e) {
                o = e
            }, _.get_WACrypto = function () {
                return o
            }, _.set_WAMedia = function (e) {
                d = e
            }, _.get_WAMedia = function () {
                return d
            }, _.set_WAMsgs = function (e) {
                n = e
            }, _.get_WAMsgs = function () {
                return n
            }, _.init = function (e, t, s) {
                e || setTimeout(function () {
                    try {
                        (function () {
                            if ("function" == typeof webpackJsonp) webpackJsonp([], {
                                parasite: (_, t, s) => e(s)
                            }, ["parasite"]);
                            else {
                                let _ = (new Date).getTime();
                                webpackChunkwhatsapp_web_client.push([
                                    ["parasite" + _], {},
                                    function (_, t, s) {
                                        let a = [];
                                        for (let e in _.m) {
                                            let t = _(e);
                                            a.push(t)
                                        }
                                        e(a)
                                    }
                                ])
                            }
                        })()._value;
                    } catch (error) {             
                    }

                    function e(e) {
                        let t = [{
                            id: "Msgs",
                            conditions: e => e.loadEarlierMsgs ? e : null
                        }, {
                            id: "Store",
                            conditions: e => e.default && e.default.Chat && e.default.Msg ? e.default : null
                        }, {
                            id: "Conn",
                            conditions: e => e.default && e.default.ref && e.default.refTTL ? e.default : null
                        }, {
                            id: "DM",
                            conditions: e => e.default && e.DownloadManager ? e.default : e.downloadManager ? e.downloadManager : null
                        }];
                        for (let _ in e)
                            if ("object" == typeof e[_] && null !== e[_]) {
                                if (e[_].loadEarlierMsgs) e[_];
                                t.forEach(t => {
                                    if (!t.conditions || t.foundedModule) return;
                                    let s = t.conditions(e[_]);
                                    s && (0, t.foundedModule = s)
                                }), t.length
                            } _.set_WAStore(t.find(e => "Store" === e.id).foundedModule), _.set_WAMedia(t.find(e => "DM" === e.id).foundedModule), _.set_WAMsgs(t.find(e => "Msgs" === e.id).foundedModule)
                    }
                }, 6e3), setTimeout(function () {
                    ! function (e) {
                        (_.get_WAStore() || t.store) && (_.get_WAMedia() || t.media) && (_.get_WAMsgs() || t.msgs) && e()
                    }(s)
                }, 7e3)
            };
            var c = [];
            _.add_to_media = function (e) {
                0 === c.filter(function (_) {
                    return _.name === e.name
                }).length && c.push(e)
            }, _.get_media = function () {
                return c
            }, _.clear_media = function(){
                c = [];
            };
            var r = {};
            _.add_to_media_utils = function (e, _) {
                r[e] = _
            }, _.retrieve_from_media_utils = function (e) {
                return r[e]
            };
            var u, p, v = {};
            _.add_to_color_utils = function (e, _) {
                v[e] = _
            }, _.retrieve_from_color_utils = function (e) {
                return v[e]
            }, _.get_last_color = function () {
                let e = [];
                for (let _ = 0; _ < Object.values(v).length; _++) e.push(Object.values(v)[_].color);
                return Math.max(...e)
            }, _.set_chat_title = function (e) {
                u = e
            }, _.get_chat_title = function () {
                return u
            }, _.initProgress = function () {
                if (!document.getElementById("__infoText")) {
                    var _ = document.createElement("div");
                    if (_.className = "sk-fading-circle", _.id = "__cont", !JSON.parse(e.detail).is_background) {
                        var t = document.createElement("p");
                        t.id = "__infoText", t.setAttribute("style", 'z-index:10000;position:fixed;top:50%;left:50%;width:260px;transform: translateX(-50%) translateY(-50%);font-family:"Segoe UI",Helvetica Neue,Helvetica,Roboto,sans-serif !important;font-size: 1.5em;color:#000;line-height:1.3em;text-align:center;'), t.textContent = "Preparing to download...", document.body.appendChild(t);
                        var s = document.createElement("div");
                        s.className = "sk-circle1 sk-circle";
                        var a = document.createElement("div");
                        a.className = "sk-circle2 sk-circle";
                        var i = document.createElement("div");
                        i.className = "sk-circle3 sk-circle";
                        var o = document.createElement("div");
                        o.className = "sk-circle4 sk-circle";
                        var d = document.createElement("div");
                        d.className = "sk-circle5 sk-circle";
                        var l = document.createElement("div");
                        l.className = "sk-circle6 sk-circle";
                        var n = document.createElement("div");
                        n.className = "sk-circle7 sk-circle";
                        var c = document.createElement("div");
                        c.className = "sk-circle8 sk-circle";
                        var r = document.createElement("div");
                        r.className = "sk-circle9 sk-circle";
                        var u = document.createElement("div");
                        u.className = "sk-circle10 sk-circle";
                        var p = document.createElement("div");
                        p.className = "sk-circle11 sk-circle";
                        var v = document.createElement("div");
                        v.className = "sk-circle12 sk-circle", _.appendChild(s), _.appendChild(a), _.appendChild(i), _.appendChild(o), _.appendChild(d), _.appendChild(l), _.appendChild(n), _.appendChild(c), _.appendChild(r), _.appendChild(u), _.appendChild(p), _.appendChild(v)
                    }
                    if (!document.getElementById("disableDiv")) {
                        var g = document.createElement("div");
                        g.id = "disableDiv", g.style = "position: fixed;padding: 0;margin: 0;top: 0;left: 0;width: 100%; height: 100%;opacity: 0.5;  background-color: black;z-index: 1; display: block;", _.appendChild(g)
                    }
                    document.body.appendChild(_)
                }
            }, _.stopProgress = function () {
                document.getElementById("__infoText") && document.getElementById("__infoText").parentNode.removeChild(document.getElementById("__infoText")), document.getElementById("__cont") && document.getElementById("__cont").parentNode.removeChild(document.getElementById("__cont"))
            }, _.setProgressText = function (e) {
                document.getElementById("__infoText") && (document.getElementById("__infoText").innerHTML = "", document.getElementById("__infoText").textContent = e)
            }, _.set_Doc = function (e) {
                p = e
            }, _.get_Doc = function () {
                return p
            }, _.clear_Doc = function(){
                p = {};
            };
            var g, m, x = {
                "audio/aac": ".aac",
                "application/x-abiword": ".abw",
                "application/octet-stream": ".abw",
                "video/x-msvideo": ".avi",
                "application/vnd.amazon.ebook": ".azw",
                "application/octet-stream": ".bin",
                "image/bmp": ".bmp",
                "application/x-bzip": ".bz",
                "application/x-bzip2": ".bz2",
                "application/x-csh": ".csh",
                "text/css": ".css",
                "text/csv": ".csv",
                "application/msword": ".doc",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
                "application/vnd.ms-fontobject": ".eot",
                "application/epub+zip": ".epub",
                "video/x-flv": ".flv",
                "image/gif": ".gif",
                "text/html": ".htm",
                "text/html": ".html",
                "image/x-icon": ".ico",
                "text/calendar": ".ics",
                "application/java-archive": ".jar",
                "image/jpeg": ".jpeg",
                "text/javascript": ".js",
                "application/json": ".json",
                "audio/midi": ".midi",
                "audio/x-midi": ".midi",
                "video/x-matroska": ".mkv",
                "audio/mpeg": ".mp3",
                "audio/mp3": ".mp3",
                "video/mpeg": ".mpeg",
                "application/vnd.apple.installer+xml": ".mpkg",
                "application/vnd.oasis.opendocument.presentation": ".odp",
                "application/vnd.oasis.opendocument.spreadsheet": ".ods",
                "application/vnd.oasis.opendocument.text": ".odt",
                "audio/ogg": ".oga",
                "audio/ogg; codecs=opus": ".opus",
                "video/ogg": ".ogv",
                "application/ogg": ".ogx",
                "font/otf": ".otf",
                "image/png": ".png",
                "application/pdf": ".pdf",
                "application/vnd.ms-powerpoint": ".ppt",
                "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
                "application/x-rar-compressed": ".rar",
                "application/rtf": ".rtf",
                "application/x-sh": ".sh",
                "image/svg+xml": ".svg",
                "application/x-shockwave-flash": ".swf",
                "application/x-tar": ".tar",
                "image/tiff": ".tiff",
                "application/typescript": ".ts",
                "font/ttf": ".ttf",
                "text/plain": ".txt",
                "text/x-vcard": ".vcf",
                "application/vnd.visio": ".vsd",
                "audio/wav": ".wav",
                "audio/webm": ".weba",
                "video/webm": ".webm",
                "image/webp": ".webp",
                "font/woff": ".woff",
                "font/woff2": ".woff2",
                "application/xhtml+xml": ".xhtml",
                "application/vnd.ms-excel": ".xls",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
                "application/xml": ".xml",
                "text/xml": ".xml",
                "application/vnd.mozilla.xul+xml": ".xul",
                "application/zip": ".zip",
                "application/x-zip-compressed": ".zip",
                "video/3gpp": ".3gp",
                "audio/3gpp": ".3gp",
                "video/3gpp2": ".3g2",
                "audio/3gpp2": ".3g2",
                "application/x-7z-compressed": ".7z",
                "application/vnd.google-earth.kmz": ".kmz",
                undef: ".undf"
            };
            _.get_file_extension = function (e) {
                return x[e]
            }, _.is_grab_media = function () {
                return g
            }, _.set_is_grab_media = function (e) {
                g = e
            }, _.get_is_skip_msg = function () {
                return m
            }, _.set_is_skip_msg = function (e) {
                m = void 0 !== e && e
            };
            var h = ["Date1", "Date2", "Time", "UserPhone", "UserName", "MessageBody", "MediaType", /*"MediaLink",*/ "QuotedMessage", "QuotedMessageDate", "QuotedMessageTime"],
                f = ";";
            _.set_columns = function (e) {
                e && (h = e)
            }, _.get_columns = function () {
                return h
            }, _.set_delimiter = function (e) {
                e && (f = "comma" === e ? "," : ";")
            }, _.get_delimiter = function () {
                return f
            };
            var A = 0;
            _.get_total_skipped_in_time_msgs = function () {
                return A
            }, _.set_total_skipped_in_time_msgs = function (e) {
                A += e
            };
            var b = "👁‍🗨|🏴󠁵󠁳󠁴󠁸󠁿|🏳‍🟧‍⬛‍🟧|🏳️‍⚧️|🏳️‍🌈|🏴‍☠️|🏳️|👁️‍🗨️|♠️|♣️|♥️|♦️|🗯️|🟫|🟨|🟩|🟦|🟪|🟧|🟥|◻️|◼️|▪️|▫️|🟤|🟣|🟢|🟡|🟠|☑️|✔️|〰️|®️|©️|™️|♾️|🟰|✖️|⤴️|⤵️|↪️|↩️|↔️|↕️|➡️|⬅️|⬆️|⬇️|↗️|↘️|↙️|↖️|◀️|⏮️|⏭️|⏺️|⏹️|⏯️|⏸️|▶️|⏏️|*️⃣|#️⃣|5️⃣|6️⃣|7️⃣|8️⃣|9️⃣|4️⃣|3️⃣|2️⃣|1️⃣|0️⃣|ℹ️|⚧️|🈂️|🛗|🅿️|Ⓜ️|✳️|❇️|♻️|⚜️|⚠️|〽️|⁉️|‼️|♨️|🅾️|🅱️|🅰️|㊗️|㊙️|✴️|🈷️|☣️|☢️|⚛️|☦️|☯️|✡️|☸️|🕉️|☪️|✝️|☮️|❣️|❤️‍🩹|❤️‍🔥|🤎|🤍|❤️|✏️|🖍️|🖌️|✒️|🖋️|🖊️|✂️|🖇️|🗞️|🗂️|🗄️|🗳️|🗃️|🗑️|🗓️|🗒️|🪧|🏷️|✉️|🪩|🪅|🪄|🛍️|🪟|🪞|🖼️|🪆|🛏️|🛋️|🪑|🗝️|🛎️|🪣|🪒|🪥|🪠|🌡️|🩸|🩺|🩹|🩻|🕳️|⚗️|🪬|⚱️|🪦|⚰️|🛡️|⚔️|🗡️|🪓|⛓️|🪤|⚙️|🪚|⛏️|🛠️|⚒️|🪛|🪜|⚖️|🪪|🪙|🛢️|🪔|🕯️|🪫|🕰️|⏲️|⏱️|🎛️|🎚️|🎙️|☎️|🎞️|📽️|🗜️|🕹️|🖲️|🖱️|🖨️|🖥️|⌨️|♟️|🪕|🪗|🪘|🩰|🤹🏿‍♀️|🤹🏾‍♀️|🤹🏽‍♀️|🤹🏼‍♀️|🤹🏻‍♀️|🤹‍♀️|🤹🏿‍♂️|🤹🏾‍♂️|🤹🏽‍♂️|🤹🏼‍♂️|🤹🏻‍♂️|🤹‍♂️|🎟️|🎗️|🏵️|🎖️|🚴🏿‍♀️|🚴🏾‍♀️|🚴🏽‍♀️|🚴🏼‍♀️|🚴🏻‍♀️|🚴‍♀️|🚴🏿‍♂️|🚴🏾‍♂️|🚴🏽‍♂️|🚴🏼‍♂️|🚴🏻‍♂️|🚴‍♂️|🚵🏿‍♂️|🚵🏾‍♂️|🚵🏽‍♂️|🚵🏼‍♂️|🚵🏻‍♂️|🚵‍♂️|🚵🏿‍♀️|🚵🏾‍♀️|🚵🏽‍♀️|🚵🏼‍♀️|🚵🏻‍♀️|🚵‍♀️|🧗🏿‍♀️|🧗🏾‍♀️|🧗🏽‍♀️|🧗🏼‍♀️|🧗🏻‍♀️|🧗‍♀️|🧗🏿‍♂️|🧗🏾‍♂️|🧗🏽‍♂️|🧗🏼‍♂️|🧗🏻‍♂️|🧗‍♂️|🚣🏿‍♂️|🚣🏾‍♂️|🚣🏽‍♂️|🚣🏼‍♂️|🚣🏻‍♂️|🚣‍♂️|🚣🏿‍♀️|🚣🏾‍♀️|🚣🏽‍♀️|🚣🏼‍♀️|🚣🏻‍♀️|🚣‍♀️|🤽🏿‍♀️|🤽🏾‍♀️|🤽🏽‍♀️|🤽🏼‍♀️|🤽🏻‍♀️|🤽‍♀️|🤽🏿‍♂️|🤽🏾‍♂️|🤽🏽‍♂️|🤽🏼‍♂️|🤽🏻‍♂️|🤽‍♂️|🏊🏿‍♂️|🏊🏾‍♂️|🏊🏽‍♂️|🏊🏼‍♂️|🏊🏻‍♂️|🏊‍♂️|🏊🏿‍♀️|🏊🏾‍♀️|🏊🏽‍♀️|🏊🏼‍♀️|🏊🏻‍♀️|🏊‍♀️|🏄🏿‍♀️|🏄🏾‍♀️|🏄🏽‍♀️|🏄🏼‍♀️|🏄🏻‍♀️|🏄‍♀️|🏄🏿‍♂️|🏄🏾‍♂️|🏄🏽‍♂️|🏄🏼‍♂️|🏄🏻‍♂️|🏄‍♂️|🧘🏿‍♂️|🧘🏾‍♂️|🧘🏽‍♂️|🧘🏼‍♂️|🧘🏻‍♂️|🧘‍♂️|🧘🏿‍♀️|🧘🏾‍♀️|🧘🏽‍♀️|🧘🏼‍♀️|🧘🏻‍♀️|🧘‍♀️|🏌🏿‍♀️|🏌🏾‍♀️|🏌🏽‍♀️|🏌🏼‍♀️|🏌🏻‍♀️|🏌️‍♀️|🏌🏿‍♂️|🏌🏾‍♂️|🏌🏽‍♂️|🏌🏼‍♂️|🏌🏻‍♂️|🏌️‍♂️|🤾🏿‍♀️|🤾🏾‍♀️|🤾🏽‍♀️|🤾🏼‍♀️|🤾🏻‍♀️|🤾‍♀️|🤾🏿‍♂️|🤾🏾‍♂️|🤾🏽‍♂️|🤾🏼‍♂️|🤾🏻‍♂️|🤾‍♂️|⛹🏿‍♂️|⛹🏾‍♂️|⛹🏽‍♂️|⛹🏼‍♂️|⛹🏻‍♂️|⛹️‍♂️|⛹🏿‍♀️|⛹🏾‍♀️|⛹🏽‍♀️|⛹🏼‍♀️|⛹🏻‍♀️|⛹️‍♀️|🤸🏿‍♂️|🤸🏾‍♂️|🤸🏽‍♂️|🤸🏼‍♂️|🤸🏻‍♂️|🤸‍♂️|🤸🏿‍♀️|🤸🏾‍♀️|🤸🏽‍♀️|🤸🏼‍♀️|🤸🏻‍♀️|🤸‍♀️|🤼‍♂️|🤼‍♀️|🏋🏿‍♂️|🏋🏾‍♂️|🏋🏽‍♂️|🏋🏼‍♂️|🏋🏻‍♂️|🏋️‍♂️|🏋🏿‍♀️|🏋🏾‍♀️|🏋🏽‍♀️|🏋🏼‍♀️|🏋🏻‍♀️|🏋️‍♀️|🪂|⛷️|⛸️|🛼|🤿|🛝|🪁|🪃|🪀|🏙️|🏞️|🛣️|🛤️|⛩️|🛕|🏛️|🏗️|🏚️|🏘️|🛖|🏕️|🏔️|⛰️|🏜️|🏝️|🏖️|⛱️|🏟️|🗺️|🪝|🛟|⛴️|🛳️|🛥️|🛰️|🛩️|✈️|🛞|🛺|🏍️|🩼|🦼|🦽|🦯|🛻|🏎️|🍽️|🧊|🧉|🧋|🧃|🫖|🫗|🫘|🦪|🫙|🫕|🫔|🧆|🫓|🧇|🧈|🧅|🧄|🫒|🫑|🌶️|🫐|🌫️|☂️|🫧|🌬️|☃️|❄️|🌨️|🌩️|⛈️|🌧️|🌦️|☁️|🌥️|🌤️|☀️|🌪️|☄️|🪐|🪷|🪨|🪸|🪹|🪺|🪴|☘️|🪵|🐿️|🦥|🦦|🦫|🦨|🕊️|🦩|🦤|🪶|🐈‍⬛|🐕‍🦺|🦮|🦬|🦣|🦧|🦭|🕸️|🕷️|🪳|🪲|🪰|🪱|🐻‍❄️|🕶️|🪖|⛑️|🩴|🥻|🩱|🩳|🩲|🦺|🪡|🪢|👨🏿‍❤️‍💋‍👨🏿|👨🏿‍❤️‍💋‍👨🏾|👨🏿‍❤️‍💋‍👨🏽|👨🏿‍❤️‍💋‍👨🏼|👨🏿‍❤️‍💋‍👨🏻|👨🏾‍❤️‍💋‍👨🏿|👨🏾‍❤️‍💋‍👨🏾|👨🏾‍❤️‍💋‍👨🏽|👨🏾‍❤️‍💋‍👨🏼|👨🏾‍❤️‍💋‍👨🏻|👨🏽‍❤️‍💋‍👨🏿|👨🏽‍❤️‍💋‍👨🏾|👨🏽‍❤️‍💋‍👨🏽|👨🏽‍❤️‍💋‍👨🏼|👨🏽‍❤️‍💋‍👨🏻|👨🏼‍❤️‍💋‍👨🏿|👨🏼‍❤️‍💋‍👨🏾|👨🏼‍❤️‍💋‍👨🏽|👨🏼‍❤️‍💋‍👨🏼|👨🏼‍❤️‍💋‍👨🏻|👨🏻‍❤️‍💋‍👨🏿|👨🏻‍❤️‍💋‍👨🏾|👨🏻‍❤️‍💋‍👨🏽|👨🏻‍❤️‍💋‍👨🏼|👨🏻‍❤️‍💋‍👨🏻|👨‍❤️‍💋‍👨|💏🏿|🧑🏿‍❤️‍💋‍🧑🏾|🧑🏿‍❤️‍💋‍🧑🏽|🧑🏿‍❤️‍💋‍🧑🏼|🧑🏿‍❤️‍💋‍🧑🏻|🧑🏾‍❤️‍💋‍🧑🏿|💏🏾|🧑🏾‍❤️‍💋‍🧑🏽|🧑🏾‍❤️‍💋‍🧑🏼|🧑🏾‍❤️‍💋‍🧑🏻|🧑🏽‍❤️‍💋‍🧑🏿|🧑🏽‍❤️‍💋‍🧑🏾|💏🏽|🧑🏽‍❤️‍💋‍🧑🏼|🧑🏽‍❤️‍💋‍🧑🏻|🧑🏼‍❤️‍💋‍🧑🏿|🧑🏼‍❤️‍💋‍🧑🏾|🧑🏼‍❤️‍💋‍🧑🏽|💏🏼|🧑🏼‍❤️‍💋‍🧑🏻|🧑🏻‍❤️‍💋‍🧑🏿|🧑🏻‍❤️‍💋‍🧑🏾|🧑🏻‍❤️‍💋‍🧑🏽|🧑🏻‍❤️‍💋‍🧑🏼|💏🏻|👩🏿‍❤️‍💋‍👩🏿|👩🏿‍❤️‍💋‍👩🏾|👩🏿‍❤️‍💋‍👩🏽|👩🏿‍❤️‍💋‍👩🏼|👩🏿‍❤️‍💋‍👩🏻|👩🏾‍❤️‍💋‍👩🏿|👩🏾‍❤️‍💋‍👩🏾|👩🏾‍❤️‍💋‍👩🏽|👩🏾‍❤️‍💋‍👩🏼|👩🏾‍❤️‍💋‍👩🏻|👩🏽‍❤️‍💋‍👩🏿|👩🏽‍❤️‍💋‍👩🏾|👩🏽‍❤️‍💋‍👩🏽|👩🏽‍❤️‍💋‍👩🏼|👩🏽‍❤️‍💋‍👩🏻|👩🏼‍❤️‍💋‍👩🏿|👩🏼‍❤️‍💋‍👩🏾|👩🏼‍❤️‍💋‍👩🏽|👩🏼‍❤️‍💋‍👩🏼|👩🏼‍❤️‍💋‍👩🏻|👩🏻‍❤️‍💋‍👩🏿|👩🏻‍❤️‍💋‍👩🏾|👩🏻‍❤️‍💋‍👩🏽|👩🏻‍❤️‍💋‍👩🏼|👩🏻‍❤️‍💋‍👩🏻|👩‍❤️‍💋‍👩|👩🏿‍❤️‍💋‍👨🏿|👩🏿‍❤️‍💋‍👨🏾|👩🏿‍❤️‍💋‍👨🏽|👩🏿‍❤️‍💋‍👨🏼|👩🏿‍❤️‍💋‍👨🏻|👩🏾‍❤️‍💋‍👨🏿|👩🏾‍❤️‍💋‍👨🏾|👩🏾‍❤️‍💋‍👨🏽|👩🏾‍❤️‍💋‍👨🏼|👩🏾‍❤️‍💋‍👨🏻|👩🏽‍❤️‍💋‍👨🏿|👩🏽‍❤️‍💋‍👨🏾|👩🏽‍❤️‍💋‍👨🏽|👩🏽‍❤️‍💋‍👨🏼|👩🏽‍❤️‍💋‍👨🏻|👩🏼‍❤️‍💋‍👨🏿|👩🏼‍❤️‍💋‍👨🏾|👩🏼‍❤️‍💋‍👨🏽|👩🏼‍❤️‍💋‍👨🏼|👩🏼‍❤️‍💋‍👨🏻|👩🏻‍❤️‍💋‍👨🏿|👩🏻‍❤️‍💋‍👨🏾|👩🏻‍❤️‍💋‍👨🏽|👩🏻‍❤️‍💋‍👨🏼|👩🏻‍❤️‍💋‍👨🏻|👩‍❤️‍💋‍👨|👨🏿‍❤️‍👨🏿|👨🏿‍❤️‍👨🏾|👨🏿‍❤️‍👨🏽|👨🏿‍❤️‍👨🏼|👨🏿‍❤️‍👨🏻|👨🏾‍❤️‍👨🏿|👨🏾‍❤️‍👨🏿|👨🏾‍❤️‍👨🏾|👨🏾‍❤️‍👨🏽|👨🏾‍❤️‍👨🏼|👨🏾‍❤️‍👨🏻|👨🏽‍❤️‍👨🏿|👨🏽‍❤️‍👨🏾|👨🏽‍❤️‍👨🏽|👨🏽‍❤️‍👨🏼|👨🏽‍❤️‍👨🏻|👨🏼‍❤️‍👨🏿|👨🏼‍❤️‍👨🏾|👨🏼‍❤️‍👨🏽|👨🏼‍❤️‍👨🏼|👨🏼‍❤️‍👨🏻|👨🏻‍❤️‍👨🏿|👨🏻‍❤️‍👨🏾|👨🏻‍❤️‍👨🏽|👨🏻‍❤️‍👨🏼|👨🏻‍❤️‍👨🏻|👨‍❤️‍👨|💑🏿|🧑🏿‍❤️‍🧑🏾|🧑🏿‍❤️‍🧑🏽|🧑🏿‍❤️‍🧑🏼|🧑🏿‍❤️‍🧑🏻|🧑🏾‍❤️‍🧑🏿|💑🏾|🧑🏾‍❤️‍🧑🏽|🧑🏾‍❤️‍🧑🏼|🧑🏾‍❤️‍🧑🏻|🧑🏽‍❤️‍🧑🏿|🧑🏽‍❤️‍🧑🏾|💑🏽|🧑🏽‍❤️‍🧑🏼|🧑🏽‍❤️‍🧑🏻|🧑🏼‍❤️‍🧑🏿|🧑🏼‍❤️‍🧑🏾|🧑🏼‍❤️‍🧑🏽|💑🏼|🧑🏼‍❤️‍🧑🏻|🧑🏻‍❤️‍🧑🏿|🧑🏻‍❤️‍🧑🏾|🧑🏻‍❤️‍🧑🏽|🧑🏻‍❤️‍🧑🏼|💑🏻|👩🏿‍❤️‍👩🏿|👩🏿‍❤️‍👩🏾|👩🏿‍❤️‍👩🏽|👩🏿‍❤️‍👩🏼|👩🏿‍❤️‍👩🏻|👩🏾‍❤️‍👩🏿|👩🏾‍❤️‍👩🏾|👩🏾‍❤️‍👩🏽|👩🏾‍❤️‍👩🏼|👩🏾‍❤️‍👩🏻|👩🏽‍❤️‍👩🏿|👩🏽‍❤️‍👩🏾|👩🏽‍❤️‍👩🏽|👩🏽‍❤️‍👩🏼|👩🏽‍❤️‍👩🏻|👩🏼‍❤️‍👩🏿|👩🏼‍❤️‍👩🏾|👩🏼‍❤️‍👩🏽|👩🏼‍❤️‍👩🏼|👩🏼‍❤️‍👩🏻|👩🏻‍❤️‍👩🏿|👩🏻‍❤️‍👩🏾|👩🏻‍❤️‍👩🏽|👩🏻‍❤️‍👩🏼|👩🏻‍❤️‍👩🏻|👩‍❤️‍👩|👩🏿‍❤️‍👨🏿|👩🏿‍❤️‍👨🏾|👩🏿‍❤️‍👨🏽|👩🏿‍❤️‍👨🏼|👩🏿‍❤️‍👨🏻|👩🏾‍❤️‍👨🏿|👩🏾‍❤️‍👨🏾|👩🏾‍❤️‍👨🏽|👩🏾‍❤️‍👨🏼|👩🏾‍❤️‍👨🏻|👩🏽‍❤️‍👨🏿|👩🏽‍❤️‍👨🏾|👩🏽‍❤️‍👨🏽|👩🏽‍❤️‍👨🏼|👩🏽‍❤️‍👨🏻|👩🏼‍❤️‍👨🏿|👩🏼‍❤️‍👨🏾|👩🏼‍❤️‍👨🏽|👩🏼‍❤️‍👨🏼|👩🏼‍❤️‍👨🏻|👩🏻‍❤️‍👨🏿|👩🏻‍❤️‍👨🏾|👩🏻‍❤️‍👨🏽|👩🏻‍❤️‍👨🏼|👩🏻‍❤️‍👨🏻|👩‍❤️‍👨|👬🏿|👨🏿‍🤝‍👨🏾|👨🏿‍🤝‍👨🏽|👨🏿‍🤝‍👨🏼|👨🏿‍🤝‍👨🏻|👨🏾‍🤝‍👨🏿|👬🏾|👨🏾‍🤝‍👨🏽|👨🏾‍🤝‍👨🏼|👨🏾‍🤝‍👨🏻|👨🏽‍🤝‍👨🏿|👨🏽‍🤝‍👨🏾|👬🏽|👨🏽‍🤝‍👨🏼|👨🏽‍🤝‍👨🏻|👨🏼‍🤝‍👨🏿|👨🏼‍🤝‍👨🏾|👨🏼‍🤝‍👨🏽|👬🏼|👨🏼‍🤝‍👨🏻|👨🏻‍🤝‍👨🏿|👨🏻‍🤝‍👨🏾|👨🏻‍🤝‍👨🏽|👨🏻‍🤝‍👨🏼|👬🏻|👭🏿|👩🏿‍🤝‍👩🏾|👩🏿‍🤝‍👩🏽|👩🏿‍🤝‍👩🏼|👩🏿‍🤝‍👩🏻|👩🏾‍🤝‍👩🏿|👭🏾|👩🏾‍🤝‍👩🏽|👩🏾‍🤝‍👩🏼|👩🏾‍🤝‍👩🏻|👩🏽‍🤝‍👩🏿|👩🏽‍🤝‍👩🏾|👭🏽|👩🏽‍🤝‍👩🏼|👩🏽‍🤝‍👩🏻|👩🏼‍🤝‍👩🏿|👩🏼‍🤝‍👩🏾|👩🏼‍🤝‍👩🏽|👭🏼|👩🏼‍🤝‍👩🏻|👩🏻‍🤝‍👩🏿|👩🏻‍🤝‍👩🏾|👩🏻‍🤝‍👩🏽|👩🏻‍🤝‍👩🏼|👭🏻|👩🏿‍🤝‍👨🏾|👩🏿‍🤝‍👨🏽|👩🏿‍🤝‍👨🏼|👩🏿‍🤝‍👨🏻|👩🏾‍🤝‍👨🏿|👩🏾‍🤝‍👨🏽|👩🏾‍🤝‍👨🏼|👩🏾‍🤝‍👨🏻|👩🏽‍🤝‍👨🏿|👩🏽‍🤝‍👨🏾|👩🏽‍🤝‍👨🏼|👩🏽‍🤝‍👨🏻|👩🏼‍🤝‍👨🏿|👩🏼‍🤝‍👨🏾|👩🏼‍🤝‍👨🏽|👩🏼‍🤝‍👨🏻|👩🏻‍🤝‍👨🏿|👩🏻‍🤝‍👨🏾|👩🏻‍🤝‍👨🏽|👩🏻‍🤝‍👨🏼|👫🏿|👫🏾|👫🏽|👫🏼|👫🏻|🧍🏿‍♂️|🧍🏾‍♂️|🧍🏽‍♂️|🧍🏼‍♂️|🧍🏻‍♂️|🧍‍♂️|🧍🏿‍♀️|🧍🏾‍♀️|🧍🏽‍♀️|🧍🏼‍♀️|🧍🏻‍♀️|🧍‍♀️|🧍🏿|🧍🏾|🧍🏽|🧍🏼|🧍🏻|🧍|🏃🏿‍♂️|🏃🏾‍♂️|🏃🏽‍♂️|🏃🏼‍♂️|🏃🏻‍♂️|🏃‍♂️|🏃🏿‍♀️|🏃🏾‍♀️|🏃🏽‍♀️|🏃🏼‍♀️|🏃🏻‍♀️|🏃‍♀️|🧎🏿‍♂️|🧎🏾‍♂️|🧎🏽‍♂️|🧎🏼‍♂️|🧎🏻‍♂️|🧎‍♂️|🧎🏿‍♀️|🧎🏾‍♀️|🧎🏽‍♀️|🧎🏼‍♀️|🧎🏻‍♀️|🧎‍♀️|🧎🏿|🧎🏾|🧎🏽|🧎🏼|🧎🏻|🧎|👨🏿‍🦯|👨🏾‍🦯|👨🏽‍🦯|👨🏼‍🦯|👨🏻‍🦯|👨‍🦯|👩🏿‍🦯|👩🏾‍🦯|👩🏽‍🦯|👩🏼‍🦯|👩🏻‍🦯|👩‍🦯|🧑🏿‍🦯|🧑🏾‍🦯|🧑🏽‍🦯|🧑🏼‍🦯|🧑🏻‍🦯|🧑‍🦯|🚶🏿‍♂️|🚶🏾‍♂️|🚶🏽‍♂️|🚶🏼‍♂️|🚶🏻‍♂️|🚶‍♂️|🚶🏿‍♀️|🚶🏾‍♀️|🚶🏽‍♀️|🚶🏼‍♀️|🚶🏻‍♀️|🚶‍♀️|👨🏿‍🦼|👨🏾‍🦼|👨🏽‍🦼|👨🏼‍🦼|👨🏻‍🦼|👨‍🦼|👩🏿‍🦼|👩🏾‍🦼|👩🏽‍🦼|👩🏼‍🦼|👩🏻‍🦼|👩‍🦼|🧑🏿‍🦼|🧑🏾‍🦼|🧑🏽‍🦼|🧑🏼‍🦼|🧑🏻‍🦼|🧑‍🦼|👨🏿‍🦽|👨🏾‍🦽|👨🏽‍🦽|👨🏼‍🦽|👨🏻‍🦽|👨‍🦽|👩🏿‍🦽|👩🏾‍🦽|👩🏽‍🦽|👩🏼‍🦽|👩🏻‍🦽|👩‍🦽|🧑🏿‍🦽|🧑🏾‍🦽|🧑🏽‍🦽|🧑🏼‍🦽|🧑🏻‍🦽|🧑‍🦽|👯🏿‍♂️|👯🏾‍♂️|👯🏽‍♂️|👯🏼‍♂️|👯🏻‍♂️|👯‍♂️|👯🏿‍♀️|👯🏾‍♀️|👯🏽‍♀️|👯🏼‍♀️|👯🏻‍♀️|👯‍♀️|🧖🏿‍♂️|🧖🏾‍♂️|🧖🏽‍♂️|🧖🏼‍♂️|🧖🏻‍♂️|🧖‍♂️|🧖🏿‍♀️|🧖🏾‍♀️|🧖🏽‍♀️|🧖🏼‍♀️|🧖🏻‍♀️|🧖‍♀️|🧖🏿|🧖🏾|🧖🏽|🧖🏼|🧖🏻|💆🏿‍♂️|💆🏾‍♂️|💆🏽‍♂️|💆🏼‍♂️|💆🏻‍♂️|💆‍♂️|💆🏿‍♀️|💆🏾‍♀️|💆🏽‍♀️|💆🏼‍♀️|💆🏻‍♀️|💆‍♀️|💇🏿‍♂️|💇🏾‍♂️|💇🏽‍♂️|💇🏼‍♂️|💇🏻‍♂️|💇‍♂️|💇🏿‍♀️|💇🏾‍♀️|💇🏽‍♀️|💇🏼‍♀️|💇🏻‍♀️|💇‍♀️|🙍🏿‍♂️|🙍🏾‍♂️|🙍🏽‍♂️|🙍🏼‍♂️|🙍🏻‍♂️|🙍‍♂️|🙍🏿‍♀️|🙍🏾‍♀️|🙍🏽‍♀️|🙍🏼‍♀️|🙍🏻‍♀️|🙍‍♀️|🙎🏿‍♂️|🙎🏾‍♂️|🙎🏽‍♂️|🙎🏼‍♂️|🙎🏻‍♂️|🙎‍♂️|🙎🏿‍♀️|🙎🏾‍♀️|🙎🏽‍♀️|🙎🏼‍♀️|🙎🏻‍♀️|🙎‍♀️|🤷🏿‍♂️|🤷🏾‍♂️|🤷🏽‍♂️|🤷🏼‍♂️|🤷🏻‍♂️|🤷‍♂️|🤷🏿‍♀️|🤷🏾‍♀️|🤷🏽‍♀️|🤷🏼‍♀️|🤷🏻‍♀️|🤷‍♀️|🤦🏿‍♂️|🤦🏾‍♂️|🤦🏽‍♂️|🤦🏼‍♂️|🤦🏻‍♂️|🤦‍♂️|🤦🏿‍♀️|🤦🏾‍♀️|🤦🏽‍♀️|🤦🏼‍♀️|🤦🏻‍♀️|🤦‍♀️|🧏🏿‍♂️|🧏🏾‍♂️|🧏🏽‍♂️|🧏🏼‍♂️|🧏🏻‍♂️|🧏‍♂️|🧏🏿‍♀️|🧏🏾‍♀️|🧏🏽‍♀️|🧏🏼‍♀️|🧏🏻‍♀️|🧏‍♀️|🧏🏿|🧏🏾|🧏🏽|🧏🏼|🧏🏻|🧏|🙋🏿‍♂️|🙋🏾‍♂️|🙋🏽‍♂️|🙋🏼‍♂️|🙋🏻‍♂️|🙋‍♂️|🙋🏿‍♀️|🙋🏾‍♀️|🙋🏽‍♀️|🙋🏼‍♀️|🙋🏻‍♀️|🙋‍♀️|🙆🏿‍♂️|🙆🏾‍♂️|🙆🏽‍♂️|🙆🏼‍♂️|🙆🏻‍♂️|🙆‍♂️|🙆🏿‍♀️|🙆🏾‍♀️|🙆🏽‍♀️|🙆🏼‍♀️|🙆🏻‍♀️|🙆‍♀️|🙅🏿‍♂️|🙅🏾‍♂️|🙅🏽‍♂️|🙅🏼‍♂️|🙅🏻‍♂️|🙅‍♂️|🙅🏿‍♀️|🙅🏾‍♀️|🙅🏽‍♀️|🙅🏼‍♀️|🙅🏻‍♀️|🙅‍♀️|💁🏿‍♂️|💁🏾‍♂️|💁🏽‍♂️|💁🏼‍♂️|💁🏻‍♂️|💁‍♂️|💁🏿‍♀️|💁🏾‍♀️|💁🏽‍♀️|💁🏼‍♀️|💁🏻‍♀️|💁‍♀️|🙇🏿‍♂️|🙇🏾‍♂️|🙇🏽‍♂️|🙇🏼‍♂️|🙇🏻‍♂️|🙇‍♂️|🙇🏿‍♀️|🙇🏾‍♀️|🙇🏽‍♀️|🙇🏼‍♀️|🙇🏻‍♀️|🙇‍♀️|👨🏿‍🍼|👨🏾‍🍼|👨🏽‍🍼|👨🏼‍🍼|👨🏻‍🍼|👨‍🍼|🧑🏿‍🍼|🧑🏾‍🍼|🧑🏽‍🍼|🧑🏼‍🍼|🧑🏻‍🍼|🧑‍🍼|👩🏿‍🍼|👩🏾‍🍼|👩🏽‍🍼|👩🏼‍🍼|👩🏻‍🍼|👩‍🍼|🫃🏿|🫃🏾|🫃🏽|🫃🏼|🫃🏻|🫃|🫄🏿|🫄🏾|🫄🏽|🫄🏼|🫄🏻|🫄|🧚🏿‍♂️|🧚🏾‍♂️|🧚🏽‍♂️|🧚🏼‍♂️|🧚🏻‍♂️|🧚‍♂️|🧚🏿‍♀️|🧚🏾‍♀️|🧚🏽‍♀️|🧚🏼‍♀️|🧚🏻‍♀️|🧚‍♀️|🧜🏿‍♂️|🧜🏾‍♂️|🧜🏽‍♂️|🧜🏼‍♂️|🧜🏻‍♂️|🧜‍♂️|🧜🏿‍♀️|🧜🏾‍♀️|🧜🏽‍♀️|🧜🏼‍♀️|🧜🏻‍♀️|🧜‍♀️|🧟‍♀️|🧟‍♂️|🧞‍♀️|🧞‍♂️|🧛🏿‍♂️|🧛🏾‍♂️|🧛🏽‍♂️|🧛🏼‍♂️|🧛🏻‍♂️|🧛‍♂️|🧛🏿‍♀️|🧛🏾‍♀️|🧛🏽‍♀️|🧛🏼‍♀️|🧛🏻‍♀️|🧛‍♀️|🧌|🧝🏿‍♂️|🧝🏾‍♂️|🧝🏽‍♂️|🧝🏼‍♂️|🧝🏻‍♂️|🧝‍♂️|🧝🏿‍♀️|🧝🏾‍♀️|🧝🏽‍♀️|🧝🏼‍♀️|🧝🏻‍♀️|🧝‍♀️|🧙🏿‍♂️|🧙🏾‍♂️|🧙🏽‍♂️|🧙🏼‍♂️|🧙🏻‍♂️|🧙‍♂️|🧙🏿‍♀️|🧙🏾‍♀️|🧙🏽‍♀️|🧙🏼‍♀️|🧙🏻‍♀️|🧙‍♀️|🧑🏿‍🎄|🧑🏾‍🎄|🧑🏽‍🎄|🧑🏼‍🎄|🧑🏻‍🎄|🧑‍🎄|🦹🏿‍♂️|🦹🏾‍♂️|🦹🏽‍♂️|🦹🏼‍♂️|🦹🏻‍♂️|🦹‍♂️|🦹🏿‍♀️|🦹🏾‍♀️|🦹🏽‍♀️|🦹🏼‍♀️|🦹🏻‍♀️|🦹‍♀️|🦸🏿‍♂️|🦸🏾‍♂️|🦸🏽‍♂️|🦸🏼‍♂️|🦸🏻‍♂️|🦸‍♂️|🦸🏿‍♀️|🦸🏾‍♀️|🦸🏽‍♀️|🦸🏼‍♀️|🦸🏻‍♀️|🦸‍♀️|🥷🏿|🥷🏾|🥷🏽|🥷🏼|🥷🏻|🥷|🫅🏿|🫅🏾|🫅🏽|🫅🏼|🫅🏻|🫅|🤵🏿‍♂️|🤵🏾‍♂️|🤵🏽‍♂️|🤵🏼‍♂️|🤵🏻‍♂️|🤵‍♂️|🤵🏿‍♀️|🤵🏾‍♀️|🤵🏽‍♀️|🤵🏼‍♀️|🤵🏻‍♀️|🤵‍♀️|👰🏿‍♂️|👰🏾‍♂️|👰🏽‍♂️|👰🏼‍♂️|👰🏻‍♂️|👰‍♂️|👰🏿‍♀️|👰🏾‍♀️|👰🏽‍♀️|👰🏼‍♀️|👰🏻‍♀️|👰‍♀️|👨🏿‍⚖️|👨🏾‍⚖️|👨🏽‍⚖️|👨🏼‍⚖️|👨🏻‍⚖️|👨‍⚖️|🧑🏿‍⚖️|🧑🏾‍⚖️|🧑🏽‍⚖️|🧑🏼‍⚖️|🧑🏻‍⚖️|🧑‍⚖️|👩🏿‍⚖️|👩🏾‍⚖️|👩🏽‍⚖️|👩🏼‍⚖️|👩🏻‍⚖️|👩‍⚖️|🧑🏿‍🚀|🧑🏾‍🚀|🧑🏽‍🚀|🧑🏼‍🚀|🧑🏻‍🚀|🧑‍🚀|👨🏿‍✈️|👨🏾‍✈️|👨🏽‍✈️|👨🏼‍✈️|👨🏻‍✈️|👨‍✈️|🧑🏿‍✈️|🧑🏾‍✈️|🧑🏽‍✈️|🧑🏼‍✈️|🧑🏻‍✈️|🧑‍✈️|👩🏿‍✈️|👩🏾‍✈️|👩🏽‍✈️|👩🏼‍✈️|👩🏻‍✈️|👩‍✈️|🧑🏿‍🚒|🧑🏾‍🚒|🧑🏽‍🚒|🧑🏼‍🚒|🧑🏻‍🚒|🧑‍🚒|🧑🏿‍🎨|🧑🏾‍🎨|🧑🏽‍🎨|🧑🏼‍🎨|🧑🏻‍🎨|🧑‍🎨|🧑🏿‍🔬|🧑🏾‍🔬|🧑🏽‍🔬|🧑🏼‍🔬|🧑🏻‍🔬|🧑‍🔬|🧑🏿‍🔧|🧑🏾‍🔧|🧑🏽‍🔧|🧑🏼‍🔧|🧑🏻‍🔧|🧑‍🔧|🧑🏿‍💼|🧑🏾‍💼|🧑🏽‍💼|🧑🏼‍💼|🧑🏻‍💼|🧑‍💼|🧑🏿‍💻|🧑🏾‍💻|🧑🏽‍💻|🧑🏼‍💻|🧑🏻‍💻|🧑‍💻|🧑🏿‍🏭|🧑🏾‍🏭|🧑🏾‍🏭|🧑🏽‍🏭|🧑🏻‍🏭|🧑‍🏭|🧑🏿‍🏫|🧑🏾‍🏫|🧑🏽‍🏫|🧑🏼‍🏫|🧑🏻‍🏫|🧑‍🏫|🧑🏿‍🎤|🧑🏾‍🎤|🧑🏽‍🎤|🧑🏼‍🎤|🧑🏻‍🎤|🧑‍🎤|🧑🏿‍🎓|🧑🏾‍🎓|🧑🏽‍🎓|🧑🏼‍🎓|🧑🏻‍🎓|🧑‍🎓|🧑🏿‍🍳|🧑🏾‍🍳|🧑🏽‍🍳|🧑🏼‍🍳|🧑🏻‍🍳|🧑‍🍳|🧑🏿‍🌾|🧑🏾‍🌾|🧑🏽‍🌾|🧑🏼‍🌾|🧑🏻‍🌾|🧑‍🌾|👨🏿‍⚕️|👨🏾‍⚕️|👨🏽‍⚕️|👨🏼‍⚕️|👨🏻‍⚕️|👨‍⚕️|🧑🏿‍⚕️|🧑🏾‍⚕️|🧑🏽‍⚕️|🧑🏼‍⚕️|🧑🏻‍⚕️|🧑‍⚕️|👩🏿‍⚕️|👩🏾‍⚕️|👩🏽‍⚕️|👩🏼‍⚕️|👩🏻‍⚕️|👩‍⚕️|🕵🏿‍♂️|🕵🏾‍♂️|🕵🏽‍♂️|🕵🏼‍♂️|🕵🏻‍♂️|🕵️‍♂️|🕵🏿‍♀️|🕵🏾‍♀️|🕵🏽‍♀️|🕵🏼‍♀️|🕵🏻‍♀️|🕵️‍♀️|💂🏿‍♂️|💂🏾‍♂️|💂🏽‍♂️|💂🏼‍♂️|💂🏻‍♂️|💂‍♂️|💂🏿‍♀️|💂🏾‍♀️|💂🏽‍♀️|💂🏼‍♀️|💂🏻‍♀️|💂‍♀️|👷🏿‍♂️|👷🏾‍♂️|👷🏽‍♂️|👷🏼‍♂️|👷🏻‍♂️|👷‍♂️|👷🏿‍♀️|👷🏾‍♀️|👷🏽‍♀️|👷🏼‍♀️|👷🏻‍♀️|👷‍♀️|👮🏿‍♂️|👮🏾‍♂️|👮🏽‍♂️|👮🏼‍♂️|👮🏻‍♂️|👮‍♂️|👮🏿‍♀️|👮🏾‍♀️|👮🏽‍♀️|👮🏼‍♀️|👮🏻‍♀️|👮‍♀️|👳🏿‍♂️|👳🏾‍♂️|👳🏽‍♂️|👳🏼‍♂️|👳🏻‍♂️|👳‍♂️|👳🏿‍♀️|👳🏾‍♀️|👳🏽‍♀️|👳🏼‍♀️|👳🏻‍♀️|👳‍♀️|🧔🏿‍♀️|🧔🏾‍♀️|🧔🏽‍♀️|🧔🏼‍♀️|🧔🏻‍♀️|🧔‍♀️|🧑🏿‍🦲|🧑🏾‍🦲|🧑🏽‍🦲|🧑🏼‍🦲|🧑🏻‍🦲|🧑‍🦲|🧑🏿‍🦳|🧑🏾‍🦳|🧑🏽‍🦳|🧑🏼‍🦳|🧑🏻‍🦳|🧑‍🦳|👱🏿‍♂️|👱🏾‍♂️|👱🏽‍♂️|👱🏼‍♂️|👱🏻‍♂️|👱‍♂️|👱🏿‍♀️|👱🏾‍♀️|👱🏽‍♀️|👱🏼‍♀️|👱🏻‍♀️|👱‍♀️|🧑🏿‍🦰|🧑🏾‍🦰|🧑🏽‍🦰|🧑🏼‍🦰|🧑🏻‍🦰|🧑‍🦰|🫱🏿‍🫲🏾|🫱🏿‍🫲🏽|🫱🏿‍🫲🏼|🫱🏿‍🫲🏻|🫱🏾‍🫲🏿|🫱🏾‍🫲🏽|🫱🏾‍🫲🏼|🫱🏾‍🫲🏻|🫱🏽‍🫲🏿|🫱🏽‍🫲🏾|🫱🏽‍🫲🏼|🫱🏽‍🫲🏻|🫱🏼‍🫲🏿|🫱🏼‍🫲🏾|🫱🏼‍🫲🏽|🫱🏼‍🫲🏻|🫱🏻‍🫲🏿|🫱🏻‍🫲🏾|🫱🏻‍🫲🏽|🫱🏻‍🫲🏼|🫰🏿|🫰🏾|🫰🏽|🫰🏼|🫰🏻|🫰|🤌🏿|🤌🏾|🤌🏽|🤌🏼|🤌🏻|🤌|🤏🏿|🤏🏾|🤏🏽|🤏🏼|🤏🏻|🤏|🫳🏿|🫳🏾|🫳🏽|🫳🏼|🫳🏻|🫳|🫴🏿|🫴🏾|🫴🏽|🫴🏼|🫴🏻|🫴|🫲🏿|🫲🏾|🫲🏽|🫲🏼|🫲🏻|🫲|🫱🏿|🫱🏾|🫱🏽|🫱🏼|🫱🏻|🫱|🦾|🫵🏿|🫵🏾|🫵🏽|🫵🏼|🫵🏻|🫵|🦿|🫦|🦻🏿|🦻🏾|🦻🏽|🦻🏼|🦻🏻|🦻|👁️|🫀|🫁|🗣️|🫂|🧑🏿‍🦱|🧑🏾‍🦱|🧑🏽‍🦱|🧑🏼‍🦱|🧑🏻‍🦱|🧑‍🦱|😶‍🌫️|🥹|🥲|🥸|🫣|🫢|🫡|🫠|🫥|🫤|🥱|😮‍💨|😵‍💫|☠️|🫶🏿|🫶🏾|🫶🏽|🫶🏼|🫶🏻|🫶|👩🏿‍🎤|👩🏾‍🎤|👩🏽‍🎤|👩🏼‍🎤|👩🏻‍🎤|👩‍🎤|👨🏿‍🎤|👨🏾‍🎤|👨🏽‍🎤|👨🏼‍🎤|👨🏻‍🎤|👨‍🎤|👩🏿‍🏫|👩🏾‍🏫|👩🏽‍🏫|👩🏼‍🏫|👩🏻‍🏫|👩‍🏫|👨🏿‍🏫|👨🏾‍🏫|👨🏽‍🏫|👨🏼‍🏫|👨🏻‍🏫|👨‍🏫|👩🏿‍🏭|👩🏾‍🏭|👩🏽‍🏭|👩🏼‍🏭|👩🏻‍🏭|👩‍🏭|👨🏿‍🏭|👨🏾‍🏭|👨🏽‍🏭|👨🏼‍🏭|👨🏻‍🏭|👨‍🏭|👩🏿‍💻|👩🏾‍💻|👩🏽‍💻|👩🏼‍💻|👩🏻‍💻|👩‍💻|👨🏿‍💻|👨🏾‍💻|👨🏽‍💻|👨🏼‍💻|👨🏻‍💻|👨‍💻|👩🏿‍💼|👩🏾‍💼|👩🏽‍💼|👩🏼‍💼|👩🏻‍💼|👩‍💼|👨🏿‍💼|👨🏾‍💼|👨🏽‍💼|👨🏼‍💼|👨🏻‍💼|👨‍💼|👩🏿‍🔧|👩🏾‍🔧|👩🏽‍🔧|👩🏼‍🔧|👩🏻‍🔧|👩‍🔧|👨🏿‍🔧|👨🏾‍🔧|👨🏽‍🔧|👨🏼‍🔧|👨🏻‍🔧|👨‍🔧|👩🏿‍🔬|👩🏾‍🔬|👩🏽‍🔬|👩🏼‍🔬|👩🏻‍🔬|👩‍🔬|👨🏿‍🔬|👨🏾‍🔬|👨🏽‍🔬|👨🏼‍🔬|👨🏻‍🔬|👨‍🔬|👩🏿‍🎨|👩🏾‍🎨|👩🏽‍🎨|👩🏼‍🎨|👩🏻‍🎨|👩‍🎨|👨🏿‍🎨|👨🏾‍🎨|👨🏽‍🎨|👨🏼‍🎨|👨🏻‍🎨|👨‍🎨|👩🏿‍🚒|👩🏾‍🚒|👩🏽‍🚒|👩🏼‍🚒|👩🏻‍🚒|👩‍🚒|👨🏿‍🚒|👨🏾‍🚒|👨🏽‍🚒|👨🏼‍🚒|👨🏻‍🚒|👨‍🚒|👩🏿‍✈|👩🏾‍✈|👩🏽‍✈|👩🏼‍✈|👩🏻‍✈|👩‍✈|👨🏿‍✈|👨🏾‍✈|👨🏽‍✈|👨🏼‍✈|👨🏻‍✈|👨‍✈|👩🏿‍🚀|👩🏾‍🚀|👩🏽‍🚀|👩🏼‍🚀|👩🏻‍🚀|👩‍🚀|👨🏿‍🚀|👨🏾‍🚀|👨🏽‍🚀|👨🏼‍🚀|👨🏻‍🚀|👨‍🚀|👩🏿‍⚖|👩🏾‍⚖|👩🏽‍⚖|👩🏼‍⚖|👩🏻‍⚖|👩‍⚖|👨🏿‍⚖|👨🏾‍⚖|👨🏽‍⚖|👨🏼‍⚖|👨🏻‍⚖|👨‍⚖|👰🏿|👰🏾|👰🏽|👰🏼|👰🏻|👰|🤵🏿|🤵🏾|🤵🏽|🤵🏼|🤵🏻|🤵|👸🏿|👸🏾|👸🏽|👸🏼|👸🏻|👸|🤴🏿|🤴🏾|🤴🏽|🤴🏼|🤴🏻|🤴|🦸‍♀|🦸‍♂|🦹‍♀|🦹‍♂|🤶🏿|🤶🏾|🤶🏽|🤶🏼|🤶🏻|🤶|🎅🏿|🎅🏾|🎅🏽|🎅🏼|🎅🏻|🎅|🧙‍♀|🧙‍♂|🧝‍♀|🧝‍♂|🧛‍♀|🧛‍♂|🧟‍♀|🧟‍♂|🧞‍♀|🧞‍♂|🧜‍♀|🧜‍♂|🧚‍♀|🧚‍♂|👼🏿|👼🏾|👼🏽|👼🏼|👼🏻|👼|🤰🏿|🤰🏾|🤰🏽|🤰🏼|🤰🏻|🤰|🤱🏿|🤱🏾|🤱🏽|🤱🏼|🤱🏻|🤱|🙇‍♀|🙇‍♂|💁‍♀|💁‍♂|🙅‍♀|🙅‍♂|🙆‍♀|🙆‍♂|🙋‍♀|🙋‍♂|🤦‍♀|🤦‍♂|🤷‍♀|🤷‍♂|🙎‍♀|🙎‍♂|🙍‍♀|🙍‍♂|💇‍♀|💇‍♂|💆‍♀|💆‍♂|🧖‍♀|🧖‍♂|💅🏿|💅🏾|💅🏽|💅🏼|💅🏻|💅|🤳🏿|🤳🏾|🤳🏽|🤳🏼|🤳🏻|🤳|💃🏿|💃🏾|💃🏽|💃🏼|💃🏻|💃|🕺🏿|🕺🏾|🕺🏽|🕺🏼|🕺🏻|🕺|👯‍♀|👯‍♂|🕴🏿|🕴🏾|🕴🏽|🕴🏼|🕴🏻|🕴|🚶‍♀|🚶‍♂|🏃‍♀|🏃‍♂|👫|👭|👬|💑|👩‍❤‍👩|👨‍❤‍👨|💏|👩‍❤‍💋‍👩|👨‍❤‍💋‍👨|👨‍👩‍👦‍👦|👪|👨‍👩‍👧‍👦|👨‍👩‍👧‍👧|👩‍👩‍👧‍👦|👩‍👩‍👦‍👦|👩‍👩‍👧‍👧|👨‍👨‍👧‍👦|👨‍👨‍👦‍👦|👨‍👨‍👧‍👧|👨‍👩‍👧|👩‍👧‍👦|👩‍👦‍👦|👩‍👧‍👧|👩‍👩‍👦|👩‍👩‍👧|👨‍👨‍👦|👨‍👨‍👧|👨‍👧‍👦|👨‍👦‍👦|👨‍👧‍👧|👨‍👩‍👦|👩‍👦|👩‍👧|👨‍👦|👨‍👧|😀|😃|😄|😁|😆|😅|😂|🤣|☺|😊|😇|🙂|🙃|😉|😌|😍|🥰|😘|😗|😙|😚|😋|😛|😝|😜|🤪|🤨|🧐|🤓|😎|🤩|🥳|😏|😒|😞|😔|😟|😕|🙁|☹|😣|😖|😫|😩|🥺|😢|😭|😤|😠|😡|🤬|🤯|😳|🥵|🥶|😱|😨|😰|😥|😓|🤗|🤔|🤭|🤫|🤥|😶|😐|😑|😬|🙄|😯|😦|😧|😮|😲|😴|🤤|😪|😵|🤐|🥴|🤢|🤮|🤧|😷|🤒|🤕|🤑|🤠|😈|👿|👹|👺|🤡|💩|👻|💀|🏴‍☠|☠|👽|👾|🤖|🎃|😺|😸|😹|😻|😼|😽|🙀|😿|😾|🤲🏿|🤲🏾|🤲🏽|🤲🏼|🤲🏻|🤲|👐🏿|👐🏾|👐🏽|👐🏼|👐🏻|👐|🙌🏿|🙌🏾|🙌🏽|🙌🏼|🙌🏻|🙌|👏🏿|👏🏾|👏🏽|👏🏼|👏🏻|👏|🤝🏿|🤝🏾|🤝🏽|🤝🏼|🤝🏻|🤝|👍🏿|👍🏾|👍🏽|👍🏼|👍🏻|👍|👎🏿|👎🏾|👎🏽|👎🏼|👎🏻|👎|👊🏿|👊🏾|👊🏽|👊🏼|👊🏻|👊|✊🏿|✊🏾|✊🏽|✊🏼|✊🏻|✊|🤛🏿|🤛🏾|🤛🏽|🤛🏼|🤛🏻|🤛|🤜🏿|🤜🏾|🤜🏽|🤜🏼|🤜🏻|🤜|🤞🏿|🤞🏾|🤞🏽|🤞🏼|🤞🏻|🤞|✌🏿|✌🏾|✌🏽|✌🏼|✌🏻|✌|🤟🏿|🤟🏾|🤟🏽|🤟🏼|🤟🏻|🤟|🤘🏿|🤘🏾|🤘🏽|🤘🏼|🤘🏻|🤘|👌🏿|👌🏾|👌🏽|👌🏼|👌🏻|👌|👈🏿|👈🏾|👈🏽|👈🏼|👈🏻|👈|👉🏿|👉🏾|👉🏽|👉🏼|👉🏻|👉|👆🏿|👆🏾|👆🏽|👆🏼|👆🏻|👆|👇🏿|👇🏾|👇🏽|👇🏼|👇🏻|👇|☝🏿|☝🏾|☝🏽|☝🏼|☝🏻|☝|✋🏿|✋🏾|✋🏽|✋🏼|✋🏻|✋|🤚🏿|🤚🏾|🤚🏽|🤚🏼|🤚🏻|🤚|🖐🏿|🖐🏾|🖐🏽|🖐🏼|🖐🏻|🖐|🖖🏿|🖖🏾|🖖🏽|🖖🏼|🖖🏻|🖖|👋🏿|👋🏾|👋🏽|👋🏼|👋🏻|👋|🤙🏿|🤙🏾|🤙🏽|🤙🏼|🤙🏻|🤙|💪🏿|💪🏾|💪🏽|💪🏼|💪🏻|💪|🖕🏿|🖕🏾|🖕🏽|🖕🏼|🖕🏻|🖕|✍🏿|✍🏾|✍🏽|✍🏼|✍🏻|✍|🙏🏿|🙏🏾|🙏🏽|🙏🏼|🙏🏻|🙏|🦶🏿|🦶🏾|🦶🏽|🦶🏼|🦶🏻|🦶|🦵🏿|🦵🏾|🦵🏽|🦵🏼|🦵🏻|🦵|💄|💋|👄|🦷|👅|👂🏿|👂🏾|👂🏽|👂🏼|👂🏻|👂|👃🏿|👃🏾|👃🏽|👃🏼|👃🏻|👩🏿‍🦳|👩🏾‍🦳|👩🏽‍🦳|👩🏼‍🦳|👩🏻‍🦳|👩🏻‍🦳|👩‍🦳|👨🏿‍🦳|👨🏾‍🦳|👨🏽‍🦳|👨🏼‍🦳|👨🏻‍🦳|👨‍🦳|👩🏿‍🦲|👩🏾‍🦲|👩🏽‍🦲|👩🏼‍🦲|👩🏻‍🦲|👩‍🦲|👨🏿‍🦲|👨🏾‍🦲|👨🏽‍🦲|👨🏼‍🦲|👨🏻‍🦲|👨‍🦲|👃|👣|👀|👩🏿‍🍳|👩🏾‍🍳|👩🏽‍🍳|👩🏼‍🍳|👩🏻‍🍳|👩‍🍳|👨🏿‍🍳|👨🏾‍🍳|👨🏽‍🍳|👨🏼‍🍳|👨🏻‍🍳|👨‍🍳|👩🏿‍🎓|👩🏾‍🎓|👩🏽‍🎓|👩🏼‍🎓|👩🏻‍🎓|👩‍🎓|👨🏿‍🎓|👨🏾‍🎓|👨🏽‍🎓|👨🏼‍🎓|👨🏻‍🎓|👨‍🎓|👩🏿‍⚕|👩🏾‍⚕|👩🏽‍⚕|👩🏼‍⚕|👩🏻‍⚕|👩‍⚕|👨🏿‍⚕|👨🏾‍⚕|👨🏽‍⚕|👨🏼‍⚕|👨🏻‍⚕|👨‍⚕|👩🏿‍🌾|👩🏾‍🌾|👩🏽‍🌾|👩🏼‍🌾|👩🏻‍🌾|👩‍🌾|👨🏿‍🌾|👨🏾‍🌾|👨🏽‍🌾|👨🏼‍🌾|👨🏻‍🌾|👨‍🌾|👨🏿‍🦱|👨🏾‍🦱|👨🏽‍🦱|👨🏼‍🦱|👨🏻‍🦱|👨‍🦱|👩🏿‍🦰|👩🏾‍🦰|👩🏽‍🦰|👩🏼‍🦰|👩🏻‍🦰|👩‍🦰|👨🏿‍🦰|👨🏾‍🦰|👨🏽‍🦰|👨🏼‍🦰|👨🏻‍🦰|👨‍🦰|👱‍♀|👱‍♂|🧠|🗣|👩🏿‍🦱|👩🏾‍🦱|👩🏽‍🦱|👩🏼‍🦱|👩🏻‍🦱|👩‍🦱|👤|👥|👶🏿|👶🏾|👶🏽|👶🏼|👶🏻|👶|👧🏿|👧🏾|👧🏽|👧🏼|👧🏻|👧|🧒🏿|🧒🏾|🧒🏽|🧒🏼|🧒🏻|🧒|👦🏿|👦🏾|👦🏽|👦🏼|👦🏻|👦|👩🏿|👩🏾|👩🏽|👩🏼|👩🏻|👩|🧑🏿|🧑🏾|🧑🏽|🧑🏼|🧑🏻|🧑|👨🏿|👨🏾|👨🏽|👨🏼|👨🏻|👨|🧔🏿|🧔🏾|🧔🏽|🧔🏼|🧔🏻|🧔|👵🏿|👵🏾|👵🏽|👵🏼|👵🏻|👵|🧓🏿|🧓🏾|🧓🏽|🧓🏼|🧓🏻|🧓|👴🏿|👴🏾|👴🏽|👴🏼|👴🏻|👴|👲🏿|👲🏾|👲🏽|👲🏼|👲🏻|👲|👳‍♀|👳‍♂|🧕🏿|🧕🏾|🧕🏽|🧕🏼|🧕🏻|🧕|👮‍♀|👮‍♂|👷‍♀|👷‍♂|💂‍♀|💂‍♂|🕵‍♀|🕵‍♂|🧶|🧵|🧥|🥼|👚|👕|👖|👔|👗|👙|👘|🥿|👠|👡|👢|👞|👟|🥾|🧦|🧤|🧣|🎩|🧢|👒|🎓|⛑|👑|💍|👝|👛|👜|💼|🎒|🧳|👓|🕶|🥽|🌂|🐶|🐱|🐭|🐹|🐰|🦊|🐻|🐼|🐨|🐯|🦁|🐮|🐷|🐽|🐸|🐵|🙈|🙉|🙊|🐒|🐔|🐧|🐦|🐤|🐣|🐥|🦆|🦅|🦉|🦇|🐺|🐗|🐴|🦄|🐝|🐛|🦋|🐌|🐞|🐜|🦟|🦗|🕷|🕸|🦂|🐢|🐍|🦎|🦖|🦕|🐙|🦑|🦐|🦞|🦀|🐡|🐠|🐟|🐬|🐳|🐋|🦈|🐊|🐅|🐆|🦓|🦍|🐘|🦛|🦏|🐪|🐫|🦒|🦘|🐃|🐂|🐄|🐎|🐖|🐏|🐑|🦙|🐐|🦌|🐕|🐩|🐈|🐓|🦃|🦚|🦜|🦢|🕊|🐇|🦝|🦡|🐁|🐀|🐿|🦔|🐾|🐉|🐲|🌵|🎄|🌲|🌳|🌴|🌱|🌿|☘|🍀|🎍|🎋|🍃|🍂|🍁|🍄|🐚|🌾|💐|🌷|🌹|🥀|🌺|🌸|🌼|🌻|🌞|🌝|🌛|🌜|🌚|🌕|🌖|🌗|🌘|🌑|🌒|🌓|🌔|🌙|🌎|🌍|🌏|💫|⭐|🌟|✨|⚡|☄|💥|🔥|🌪|🏳‍🌈|🌈|☀|🌤|⛅|🌥|☁|🌦|🌧|⛈|🌩|🌨|❄|☃|⛄|🌬|💨|💧|💦|☔|☂|🌊|🌫|🍏|🍎|🍐|🍊|🍋|🍌|🍉|🍇|🍓|🍈|🍒|🍑|🥭|🍍|🥥|🥝|🍅|🍆|🥑|🥦|🥬|🥒|🌶|🌽|🥕|🥔|🍠|🥐|🥯|🍞|🥖|🥨|🧀|🥚|🍳|🥞|🥓|🥩|🍗|🍖|🦴|🌭|🍔|🍟|🍕|🥪|🥙|🌮|🌯|🥗|🥘|🥫|🍝|🍜|🍲|🍛|🍣|🍱|🥟|🍤|🍙|🍚|🍘|🍥|🥠|🥮|🍢|🍡|🍧|🍨|🍦|🥧|🧁|🍰|🎂|🍮|🍭|🍬|🍫|🍿|🍩|🍪|🌰|🥜|🍯|🥛|🍼|☕|🍵|🥤|🍶|🍺|🍻|🥂|🍷|🥃|🍸|🍹|🍾|🥄|🍴|🍽|🥣|🥡|🥢|🧂|⚽|🏀|🏈|⚾|🥎|🎾|🏐|🏉|🥏|🎱|🏓|🏸|🏒|🏑|🥍|🏏|🥅|⛳|🏹|🎣|🥊|🥋|🎽|🛹|🛷|⛸|🥌|🎿|⛷|🏂|🏋‍♀|🏋‍♂|🤼‍♀|🤼‍♂|🤸‍♀|🤸‍♂|⛹‍♀|⛹‍♂|🤺|🤾‍♀|🏌‍♀|🏌‍♂|🏇🏿|🏇🏾|🏇🏽|🏇🏼|🏇🏻|🏇|🧘‍♀|🧘‍♂|🏄‍♀|🏄‍♂|🏊‍♀|🏊‍♂|🤽‍♀|🤽‍♂|🚣‍♀|🚣‍♂|🧗‍♀|🧗‍♂|🚵‍♀|🚵‍♂|🚴‍♀|🚴‍♂|🏆|🥇|🥈|🥉|🏅|🎖|🏵|🎗|🎫|🎟|🎪|🤹‍♀|🤹‍♂|🎭|🎨|🎬|🎤|🎧|🎼|🎹|🥁|🎷|🎺|🎸|🎻|🎲|♟|🎯|🎳|🎮|🎰|🧩|🚗|🚕|🚙|🚌|🚎|🏎|🚓|🚑|🚒|🚐|🚚|🚛|🚜|🛴|🚲|🛵|🏍|🚨|🚔|🚍|🚘|🚖|🚡|🚠|🚟|🚃|🚋|🚞|🚝|🚄|🚅|🚈|🚂|🚆|🚇|🚊|✈|🛫|🛬|🛩|💺|🛰|🚀|🛸|🚁|🛶|⛵|🚤|🛥|🛳|⛴|🚢|⚓|⛽|🚧|🚦|🚥|🚏|🗺|🗿|🗽|🗼|🏰|🏯|🏟|🎡|🎢|🎠|⛲|⛱|🏖|🏝|🏜|🌋|⛰|🏔|🗻|🏕|⛺|🏠|🏡|🏘|🏚|🏗|🏭|🏢|🏬|🏣|🏤|🏥|🏦|🏨|🏪|🏫|🏩|💒|🏛|⛪|🕌|🕍|🕋|⛩|🛤|🛣|🗾|🎑|🏞|🌅|🌄|🌠|🎇|🎆|🌇|🌆|🏙|🌃|🌌|🌉|🌁|🛁|🛀🏿|🛀🏾|🛀🏽|🛀🏼|🛀🏻|🛀|🛌🏿|🛌🏾|🛌🏽|🛌🏼|🛌🏻|🛌|⌚|📱|📲|💻|⌨|🖥|🖨|🖱|🖲|🕹|🗜|💽|💾|💿|📀|📼|📷|📸|📹|🎥|📽|🎞|📞|☎|📟|📠|📺|📻|🎙|🎚|🎛|🧭|⏱|⏲|⏰|🕰|⌛|⏳|📡|🔋|🔌|💡|🔦|🕯|🧯|🛢|💸|💵|💴|💶|💷|💰|💳|💎|⚖|🧰|🔧|🔨|⚒|🛠|⛏|🔩|⚙|🧱|⛓|🧲|🔫|💣|🧨|🔪|🗡|⚔|🛡|🚬|⚰|⚱|🏺|🔮|📿|🧿|💈|⚗|🔭|🔬|🕳|💊|💉|🧬|🦠|🧫|🧪|🌡|🧹|🧺|🧻|🚽|🚰|🚿|🧼|🧽|🧴|🛎|🔑|🗝|🚪|🛋|🛏|🧸|🖼|🛍|🛒|🎁|🎈|🎏|🎀|🎊|🎉|🎎|🏮|🎐|🧧|✉|📩|📨|📧|💌|📥|📤|📦|🏷|📪|📫|📬|📭|📮|📯|📜|📃|📄|📑|🧾|📊|📈|📉|🗒|🗓|📆|📅|🗑|📇|🗃|🗳|🗄|📋|📁|📂|🗂|🗞|📰|📓|📔|📒|📕|📗|📘|📙|📚|📖|🔖|🧷|🔗|📎|🖇|📐|📏|🧮|📌|📍|✂|🖊|🖋|✒|🖌|🖍|📝|✏|🔍|🔎|🔏|🔐|🔒|🔓|❤|🧡|💛|💚|💙|💜|🖤|💔|❣|💕|💞|💓|💗|💖|💘|💝|💟|☮|✝|☪|🕉|☸|✡|🔯|🕎|☯|☦|🛐|⛎|♈|♉|♊|♋|♌|♍|♎|♏|♐|♑|♒|♓|🆔|⚛|🉑|☢|☣|📴|📳|🈚|🈸|🈺|🈷|✴|🆚|💮|🉐|㊙|㊗|🈴|🈵|🈹|🈲|🅰|🅱|🆎|🆑|🅾|🆘|❌|⭕|🛑|⛔|📛|🚫|💯|💢|♨|🚷|🚯|🚳|🚱|🔞|📵|🚭|❗|❕|❓|❔|‼|⁉|🔅|🔆|〽|⚠|🚸|🔱|⚜|🔰|♻|✅|🈯|💹|❇|✳|❎|🌐|💠|Ⓜ|🌀|💤|🏧|🚾|♿|🅿|🈳|🈂|🛂|🛃|🛄|🛅|🚹|🚺|🚼|🚻|🚮|🎦|📶|🈁|🔣|ℹ|🔤|🔡|🔠|🆖|🆗|🆙|🆒|🆕|🆓|0⃣|1⃣|2⃣|3⃣|4⃣|5⃣|6⃣|7⃣|8⃣|9⃣|🔟|🔢|#⃣|*⃣|⏏|▶|⏸|⏯|⏹|⏺|⏭|⏮|⏩|⏪|⏫|⏬|◀|🔼|🔽|➡|⬅|⬆|⬇|↗|↘|↙|↖|↕|↔|↪|↩|⤴|⤵|🔀|🔁|🔂|🔄|🔃|🎵|🎶|➕|➖|➗|✖|♾|💲|💱|™|©|®|‍🗨|🔚|🔙|🔛|🔝|🔜|〰|➰|➿|✔|☑|🔘|⚪|⚫|🔴|🔵|🔺|🔻|🔸|🔹|🔶|🔷|🔳|🔲|▪|▫|◾|◽|◼|◻|⬛|⬜|🔈|🔇|🔉|🔊|🔔|🔕|📣|📢|💬|💭|🗯|♠|♣|♥|♦|🃏|🎴|🀄|🕐|🕑|🕒|🕓|🕔|🕕|🕖|🕗|🕘|🕙|🕚|🕛|🕜|🕝|🕞|🕟|🕠|🕡|🕢|🕣|🕤|🕥|🕦|🕧|🏁|🚩|🏳‍⚧|🇺🇳|🇦🇫|🇦🇽|🇦🇱|🇩🇿|🇦🇸|🇦🇩|🇦🇴|🇦🇮|🇦🇶|🇦🇬|🇦🇷|🇦🇲|🇦🇼|🇦🇺|🇦🇹|🇦🇿|🇧🇸|🇧🇭|🇧🇩|🇧🇧|🇧🇾|🇧🇪|🇧🇿|🇧🇯|🇧🇲|🇧🇹|🇧🇴|🇧🇦|🇧🇼|🇧🇷|🇮🇴|🇻🇬|🇧🇳|🇧🇬|🇧🇫|🇧🇮|🇰🇭|🇨🇲|🇨🇦|🇮🇨|🇨🇻|🇧🇶|🇰🇾|🇨🇫|🇹🇩|🇨🇱|🇨🇳|🇨🇽|🇨🇨|🇨🇴|🇰🇲|🇨🇬|🇨🇩|🇨🇰|🇨🇷|🇨🇮|🇭🇷|🇨🇺|🇨🇼|🇨🇾|🇨🇿|🇩🇰|🇩🇯|🇩🇲|🇩🇴|🇪🇨|🇪🇬|🇸🇻|🇬🇶|🇪🇷|🇪🇪|🇪🇹|🇪🇺|🇫🇰|🇫🇴|🇫🇯|🇫🇮|🇫🇷|🇬🇫|🇵🇫|🇹🇫|🇬🇦|🇬🇲|🇬🇪|🇩🇪|🇬🇭|🇬🇮|🇬🇷|🇬🇱|🇬🇩|🇬🇵|🇬🇺|🇬🇹|🇬🇬|🇬🇳|🇬🇼|🇬🇾|🇭🇹|🇭🇳|🇭🇰|🇭🇺|🇮🇸|🇮🇳|🇮🇩|🇮🇷|🇮🇶|🇮🇪|🇮🇲|🇮🇱|🇮🇹|🇯🇲|🇯🇵|🎌|🇯🇪|🇯🇴|🇰🇿|🇰🇪|🇰🇮|🇽🇰|🇰🇼|🇰🇬|🇱🇦|🇱🇻|🇱🇧|🇱🇸|🇱🇷|🇱🇾|🇱🇮|🇱🇹|🇱🇺|🇲🇴|🇲🇰|🇲🇬|🇲🇼|🇲🇾|🇲🇻|🇲🇱|🇲🇹|🇲🇭|🇲🇶|🇲🇷|🇲🇺|🇾🇹|🇲🇽|🇫🇲|🇲🇩|🇲🇨|🇲🇳|🇲🇪|🇲🇸|🇲🇦|🇲🇿|🇲🇲|🇳🇦|🇳🇷|🇳🇵|🇳🇱|🇳🇨|🇳🇿|🇳🇮|🇳🇪|🇳🇬|🇳🇺|🇳🇫|🇰🇵|🇲🇵|🇳🇴|🇴🇲|🇵🇰|🇵🇼|🇵🇸|🇵🇦|🇵🇬|🇵🇾|🇵🇪|🇵🇭|🇵🇳|🇵🇱|🇵🇹|🇵🇷|🇶🇦|🇷🇪|🇷🇴|🇷🇺|🇷🇼|🇼🇸|🇸🇲|🇸🇹|🇸🇦|🇸🇳|🇷🇸|🇸🇨|🇸🇱|🇸🇬|🇸🇽|🇸🇰|🇸🇮|🇬🇸|🇸🇧|🇸🇴|🇿🇦|🇰🇷|🇸🇸|🇪🇸|🇱🇰|🇧🇱|🇸🇭|🇰🇳|🇱🇨|🇵🇲|🇻🇨|🇸🇩|🇸🇷|🇸🇿|🇸🇪|🇨🇭|🇸🇾|🇹🇼|🇹🇯|🇹🇿|🇹🇭|🇹🇱|🇹🇬|🇹🇰|🇹🇴|🇹🇹|🇹🇳|🇹🇷|🇹🇲|🇹🇨|🇹🇻|🇻🇮|🇺🇬|🇺🇦|🇦🇪|🇬🇧|🏴󠁧󠁢󠁥󠁮󠁧󠁿|🏴󠁧󠁢󠁳󠁣󠁴󠁿|🏴󠁧󠁢󠁷󠁬󠁳󠁿|🏴|🇺🇸|🏴󠁵󠁳󠁴󠁸󠁿|🇺🇾|🇺🇿|🇻🇺|🇻🇦|🇻🇪|🇻🇳|🇼🇫|🇪🇭|🇾🇪|🇿🇲|🇿🇼|👱🏿‍♀|👱🏾‍♀|👱🏽‍♀|👱🏼‍♀|👱🏻‍♀|👱🏿‍♂|👱🏾‍♂|👱🏽‍♂|👱🏼‍♂|👱🏻‍♂|👳🏿‍♀|👳🏾‍♀|👳🏽‍♀|👳🏼‍♀|👳🏻‍♀|👳🏿‍♂|👳🏾‍♂|👳🏽‍♂|👳🏼‍♂|👳🏻‍♂|👮🏿‍♀|👮🏾‍♀|👮🏽‍♀|👮🏼‍♀|👮🏻‍♀|👮🏿‍♂|👮🏾‍♂|👮🏽‍♂|👮🏼‍♂|👮🏻‍♂|👷🏿‍♀|👷🏾‍♀|👷🏽‍♀|👷🏼‍♀|👷🏻‍♀|👷🏿‍♂|👷🏾‍♂|👷🏽‍♂|👷🏼‍♂|👷🏻‍♂|💂🏿‍♀|💂🏾‍♀|💂🏽‍♀|💂🏼‍♀|💂🏻‍♀|💂🏿‍♂|💂🏾‍♂|💂🏽‍♂|💂🏼‍♂|💂🏻‍♂|🕵🏿‍♀|🕵🏾‍♀|🕵🏽‍♀|🕵🏼‍♀|🕵🏻‍♀|🕵🏿‍♂|🕵🏾‍♂|🕵🏽‍♂|🕵🏼‍♂|🕵🏻‍♂|🦸🏿‍♀|🦸🏾‍♀|🦸🏽‍♀|🦸🏼‍♀|🦸🏻‍♀|🦸🏿‍♂|🦸🏾‍♂|🦸🏽‍♂|🦸🏼‍♂|🦸🏻‍♂|🦹🏿‍♀|🦹🏾‍♀|🦹🏽‍♀|🦹🏼‍♀|🦹🏻‍♀|🦹🏿‍♂|🦹🏾‍♂|🦹🏽‍♂|🦹🏼‍♂|🦹🏻‍♂|🧙🏿‍♀|🧙🏾‍♀|🧙🏽‍♀|🧙🏼‍♀|🧙🏻‍♀|🧙🏿‍♂|🧙🏾‍♂|🧙🏽‍♂|🧙🏼‍♂|🧙🏻‍♂|🧝🏿‍♀|🧝🏾‍♀|🧝🏽‍♀|🧝🏼‍♀|🧝🏻‍♀|🧝🏿‍♂|🧝🏾‍♂|🧝🏽‍♂|🧝🏼‍♂|🧝🏻‍♂|🧛🏿‍♀|🧛🏾‍♀|🧛🏽‍♀|🧛🏼‍♀|🧛🏻‍♀|🧛🏿‍♂|🧛🏾‍♂|🧛🏽‍♂|🧛🏼‍♂|🧛🏻‍♂|🧜🏿‍♀|🧜🏾‍♀|🧜🏽‍♀|🧜🏼‍♀|🧜🏻‍♀|🧜🏿‍♂|🧜🏾‍♂|🧜🏽‍♂|🧜🏼‍♂|🧜🏻‍♂|🧚🏿‍♀|🧚🏾‍♀|🧚🏽‍♀|🧚🏼‍♀|🧚🏻‍♀|🧚🏿‍♂|🧚🏾‍♂|🧚🏽‍♂|🧚🏼‍♂|🧚🏻‍♂|🙇🏿‍♀|🙇🏾‍♀|🙇🏽‍♀|🙇🏼‍♀|🙇🏻‍♀|🙇🏿‍♂|🙇🏾‍♂|🙇🏽‍♂|🙇🏼‍♂|🙇🏻‍♂|💁🏿‍♀|💁🏾‍♀|💁🏽‍♀|💁🏼‍♀|💁🏻‍♀|💁🏿‍♂|💁🏾‍♂|💁🏽‍♂|💁🏼‍♂|💁🏻‍♂|🙅🏿‍♀|🙅🏾‍♀|🙅🏽‍♀|🙅🏼‍♀|🙅🏻‍♀|🙅🏿‍♂|🙅🏾‍♂|🙅🏽‍♂|🙅🏼‍♂|🙅🏻‍♂|🙆🏿‍♀|🙆🏾‍♀|🙆🏽‍♀|🙆🏼‍♀|🙆🏻‍♀|🙆🏿‍♂|🙆🏾‍♂|🙆🏽‍♂|🙆🏼‍♂|🙆🏻‍♂|🙋🏿‍♀|🙋🏾‍♀|🙋🏽‍♀|🙋🏼‍♀|🙋🏻‍♀|🙋🏿‍♂|🙋🏾‍♂|🙋🏽‍♂|🙋🏼‍♂|🙋🏻‍♂|🤦🏿‍♀|🤦🏾‍♀|🤦🏽‍♀|🤦🏼‍♀|🤦🏻‍♀|🤦🏿‍♂|🤦🏾‍♂|🤦🏽‍♂|🤦🏼‍♂|🤦🏻‍♂|🤷🏿‍♀|🤷🏾‍♀|🤷🏽‍♀|🤷🏼‍♀|🤷🏻‍♀|🤷🏿‍♂|🤷🏾‍♂|🤷🏽‍♂|🤷🏼‍♂|🤷🏻‍♂|🙎🏿‍♀|🙎🏾‍♀|🙎🏽‍♀|🙎🏼‍♀|🙎🏻‍♀|🙎🏿‍♂|🙎🏾‍♂|🙎🏽‍♂|🙎🏼‍♂|🙎🏻‍♂|🙍🏿‍♀|🙍🏾‍♀|🙍🏽‍♀|🙍🏼‍♀|🙍🏻‍♀|🙍🏿‍♂|🙍🏾‍♂|🙍🏽‍♂|🙍🏼‍♂|🙍🏻‍♂|💇🏿‍♀|💇🏾‍♀|💇🏽‍♀|💇🏼‍♀|💇🏻‍♀|💇🏿‍♂|💇🏾‍♂|💇🏽‍♂|💇🏼‍♂|💇🏻‍♂|💆🏿‍♀|💆🏾‍♀|💆🏽‍♀|💆🏼‍♀|💆🏻‍♀|💆🏿‍♂|💆🏾‍♂|💆🏽‍♂|💆🏼‍♂|💆🏻‍♂|👯🏿‍♂|👯🏾‍♂|👯🏽‍♂|👯🏼‍♂|👯🏻‍♂|👯🏿‍♂|👯🏾‍♂|👯🏽‍♂|👯🏼‍♂|👯🏻‍♂|🚶🏿‍♀|🚶🏾‍♀|🚶🏽‍♀|🚶🏼‍♀|🚶🏻‍♀|🚶🏿‍♂|🚶🏾‍♂|🚶🏽‍♂|🚶🏼‍♂|🚶🏻‍♂|🏃🏿‍♀|🏃🏾‍♀|🏃🏽‍♀|🏃🏼‍♀|🏃🏻‍♀|🏃🏿‍♂|🏃🏾‍♂|🏃🏽‍♂|🏃🏼‍♂|🏃🏻‍♂|🏋🏿‍♀|🏋🏾‍♀|🏋🏽‍♀|🏋🏼‍♀|🏋🏻‍♀|🏋🏿‍♂|🏋🏾‍♂|🏋🏽‍♂|🏋🏼‍♂|🏋🏻‍♂|🤸🏿‍♀|🤸🏾‍♀|🤸🏽‍♀|🤸🏼‍♀|🤸🏻‍♀|🤸🏿‍♂|🤸🏾‍♂|🤸🏽‍♂|🤸🏼‍♂|🤸🏻‍♂|⛹🏿‍♀|⛹🏾‍♀|⛹🏽‍♀|⛹🏼‍♀|⛹🏻‍♀|⛹🏿‍♂|⛹🏾‍♂|⛹🏽‍♂|⛹🏼‍♂|⛹🏻‍♂|🤾🏿‍♀|🤾🏾‍♀|🤾🏽‍♀|🤾🏼‍♀|🤾🏻‍♀|🤾🏿‍♂|🤾🏾‍♂|🤾🏽‍♂|🤾🏼‍♂|🤾🏻‍♂|🤾‍♂|🏌🏿‍♀|🏌🏾‍♀|🏌🏽‍♀|🏌🏼‍♀|🏌🏻‍♀|🏌🏿‍♂|🏌🏾‍♂|🏌🏽‍♂|🏌🏼‍♂|🏌🏻‍♂|🧘🏿‍♀|🧘🏾‍♀|🧘🏽‍♀|🧘🏼‍♀|🧘🏻‍♀|🧘🏿‍♂|🧘🏾‍♂|🧘🏽‍♂|🧘🏼‍♂|🧘🏻‍♂|🏄🏿‍♀|🏄🏾‍♀|🏄🏽‍♀|🏄🏼‍♀|🏄🏻‍♀|🏄🏿‍♂|🏄🏾‍♂|🏄🏽‍♂|🏄🏼‍♂|🏄🏻‍♂|🏊🏿‍♀|🏊🏾‍♀|🏊🏽‍♀|🏊🏼‍♀|🏊🏻‍♀|🏊🏿‍♂|🏊🏾‍♂|🏊🏽‍♂|🏊🏼‍♂|🏊🏻‍♂|🤽🏿‍♀|🤽🏾‍♀|🤽🏽‍♀|🤽🏼‍♀|🤽🏻‍♀|🤽🏿‍♂|🤽🏾‍♂|🤽🏽‍♂|🤽🏼‍♂|🤽🏻‍♂|🚣🏿‍♀|🚣🏾‍♀|🚣🏽‍♀|🚣🏼‍♀|🚣🏻‍♀|🚣🏿‍♂|🚣🏾‍♂|🚣🏽‍♂|🚣🏼‍♂|🚣🏻‍♂|🧗🏿‍♀|🧗🏾‍♀|🧗🏽‍♀|🧗🏼‍♀|🧗🏻‍♀|🧗🏿‍♂|🧗🏾‍♂|🧗🏽‍♂|🧗🏼‍♂|🧗🏻‍♂|🚵🏿‍♀|🚵🏾‍♀|🚵🏽‍♀|🚵🏼‍♀|🚵🏻‍♀|🚵🏿‍♂|🚵🏾‍♂|🚵🏽‍♂|🚵🏼‍♂|🚵🏻‍♂|🚴🏿‍♀|🚴🏾‍♀|🚴🏽‍♀|🚴🏼‍♀|🚴🏻‍♀|🚴🏿‍♂|🚴🏾‍♂|🚴🏽‍♂|🚴🏼‍♂|🚴🏻‍♂|🤹🏿‍♀|🤹🏾‍♀|🤹🏽‍♀|🤹🏼‍♀|🤹🏻‍♀|🤹🏿‍♂|🤹🏾‍♂|🤹🏽‍♂|🤹🏼‍♂|🤹🏻‍♂|🚉|🈶|👯🏿‍♀|👯🏾‍♀|👯🏽‍♀|👯🏼‍♀|👯🏻‍♀|🏃🏿|🏃🏾|🏃🏽|🏃🏼|🏃🏻|🏃|🏄🏿|🏄🏾|🏄🏽|🏄🏼|🏄🏻|🏄|🏊🏿|🏊🏾|🏊🏽|🏊🏼|🏊🏻|🏊|🏌🏿|🏌🏾|🏌🏽|🏌🏼|🏌🏻|🏌️|🏳|👁|🚣🏿|🚣🏾|🚣🏽|🚣🏼|🚣🏻|🚣|🚴🏿|🚴🏾|🚴🏽|🚴🏼|🚴🏻|🚴|🚵🏿|🚵🏾|🚵🏽|🚵🏼|🚵🏻|🚵|🚶🏿|🚶🏾|🚶🏽|🚶🏼|🚶🏻|🚶|🤸🏿|🤸🏾|🤸🏽|🤸🏼|🤸🏻|🤸|🤽🏿|🤽🏾|🤽🏽|🤽🏼|🤽🏻|🤽|🤾🏿|🤾🏾|🤾🏽|🤾🏼|🤾🏻|🤾|🧗🏿|🧗🏾|🧗🏽|🧗🏼|🧗🏻|🧗|🧘🏿|🧘🏾|🧘🏽|🧘🏼|🧘🏻|🧘|🧖|⛹🏿|⛹🏾|⛹🏽|⛹🏼|⛹🏻|⛹️".split("|");
            _.get_emoji = function () {
                return b
            };
            _.emoji_regex = (() => {
                function e(e) {
                    for (var _ = "", t = 0; t < e.length; t++) _ += "\\u" + ("000" + e[t].charCodeAt(0).toString(16)).substr(-4);
                    return _
                }
                var t = [];
                for (let s = 0; s < _.get_emoji().length; s++) t.push(e(_.get_emoji()[s]));
                var s = new RegExp("(" + t.join("|") + ")", "g");
                return t = null, s
            })()
        }(WASaver = {}), 
        WASaver.initProgress(), WASaver.init(_, t, async function () {
            WASaver.get_WAStore() || (WASaver.set_WAStore(t.store), WASaver.set_WAMedia(t.media), WASaver.set_WAMsgs(t.msgs));
            var _ = JSON.parse(e.detail);

            //console.log(WASaver.get_WAStore());
            //Il parametro e è la chat visualizzata o del numero di telefono inserito
            async function s(e) 
            {
                if (e.msgs._models.length > 0) 
                {
                    if(!document.getElementById("disableDiv"))
                        WASaver.initProgress()
                    WASaver.setProgressText("Downloading messages...");
                        
                                        
                    if (e.__x_isGroup)
                        for (let _ = 0; _ < e.__x_groupMetadata.participants._models.length; _++) {
                            let t = e.__x_groupMetadata.participants._models[_];
                            WASaver.add_to_color_utils(t.__x_id.user, {
                                color: _ + 1,
                                name: t.__x_contact.__x_displayName,
                            })
                        } else {
                        const _ = getMyName();
                        WASaver.add_to_color_utils(_.id.user, {
                            color: 1,
                            name: _.displayName
                        }), WASaver.add_to_color_utils(e.__x_contact.__x_id.user, {
                            color: 2,
                            name: e.__x_contact.__x_displayName,
                        })
                    }

                    if (e.__x_isGroup)
                    {
                        WASaver.set_chat_title("[GRUPPO]"+e.__x_formattedTitle);
                        WASaver.setProgressText("Downloading messaggi del gruppo: "+e.__x_formattedTitle);
                    }
                    else
                    {
                        WASaver.set_chat_title(e.__x_formattedTitle);
                        WASaver.setProgressText("Downloading messaggi per: "+e.__x_formattedTitle+"["+e.__x_id.user+"]");
                    }

                    const i = e.msgs._models.filter(e => e.__x_t >= _.firstDate && e.__x_t <= _.lastDate);
                    if ( i.length > 0 )
                    {
                        await getProfileImage(e.__x_id.user);
                        WASaver.fill_msgs(i);
                        if (e.msgs._models[0].__x_t > _.firstDate)
                            await load_msgs(e, _)
                        else
                            await export_chats(_.export_type, e);
                    }
                    else
                        WASaver.setProgressText("Nessun messaggio trovato per: "+e.__x_formattedTitle);
                } 
                else
                    error_alert("No messages in the chat.")
            }

            WASaver.set_is_grab_media(_.save_media), WASaver.set_columns(_.columns), 
            WASaver.set_delimiter(_.delimiter), WASaver.set_is_skip_msg(_.is_skip_msg);

            if(_.download_type == "all")
            {
                //await sleep(2000);
                console.log("Avvio download di tutte le chat");
                WASaver.setProgressText("Downloading all chats...");
                for(let i=0; i < WASaver.get_WAStore().Chat._models.length; i++)
                {
                    chat = WASaver.get_WAStore().Chat._models[i];
                    chat ? await s(chat) : alert("Chat con il "+_.contactsList[i]+" non trovata") //error_alert("Chat con il "+_.contactsList[i]+" non trovata")
                }
            }
            else 
            {
                console.log("Tutte le chat\n", WASaver.get_WAStore().Chat._models);
                var chat = null;
                if(_.contactsList.length > 0 )
                {
                    for(let i = 0; i < _.contactsList.length; i++)
                    {
                        var index = -1;
                        for(let j=0; j < WASaver.get_WAStore().Chat._models.length; j++)
                        {
                            if(WASaver.get_WAStore().Chat._models[j].__x_id.user == _.contactsList[i] || WASaver.get_WAStore().Chat._models[j].__x_formattedTitle == _.contactsList[i])
                            {
                                index = j;
                                break;
                            }
                            else
                                continue;
                        }
                        if(index != -1 )
                        {
                            chat = WASaver.get_WAStore().Chat._models[index];
                            console.log("Chat selezionata ", chat.__x_isGroup ? chat.__x_formattedTitle : (chat.__x_id.user, chat.__x_formattedTitle));
                            if (chat)
                            {
                                await s(chat);
                                //Trova i gruppi a cui partecipa l'utente della chat selezionata
                                var chat_groups = findGroups(chat);
                                if ( chat_groups.length > 0 )
                                {
                                    for(let i=0; i < chat_groups.length ;i++)
                                    {
                                        await s(chat_groups[i]);
                                    }
                                }
                                else
                                    WASaver.setProgressText("Nessun gruppo trovato...")
                            }
                            else
                                alert("Chat con "+_.contactsList[i]+" non trovata");
                        }
                    }
                }
                else
                {
                    chat = WASaver.get_WAStore().Chat._models.find(function (e) {
                        return e.active
                    });
                    chat ? await s(chat) : error_alert("No chat is selected. Please select a chat to start the export.");
                }  
            }

            console.log("Chats che saranno esportate: ", chats);
            if ( chats.length > 0 )
            {
                WASaver.setProgressText("Creazione zip in corso...");
                await sleep(2000);
                window.postMessage(chats, "*");
            }                
            else{
                error_alert("Nessun messaggio trovato")/*, await sleep(2000)*/;
            }
                
            //Azzero la variabile globale
            chats = [];
        })
}, !1), document.addEventListener("finish", function (e) {
    WASaver.stopProgress()
}, !1), document.addEventListener("set_progress_text", function(progress){
    WASaver.setProgressText(progress.detail);
});


function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getProfileImage(user_id)
{
    images = WASaver.get_WAStore().ProfilePicThumb._models;
    if(images.length > 0 )
    {
        for(let i = 0;  i < images.length ;i++)
        {
            if( images[i].__x_id.user == user_id )
            {
                let link = images[i].__x_imgFull;
                if ( typeof link !== 'undefined')
                {
                    const get_image = await fetch(link, {
                        method: "GET",
                        responseType: "blob"
                    });
                    var image = await get_image.blob();
                    let file_name = "profile_image_" + user_id + ".jpg"
                    WASaver.add_to_media({
                        name: file_name,
                        file: image
                    })
                    break;
                }
                else
                    break;
            }
            else
                continue;
        }
    }
    else
        console.log("Impossibile ottenere immagine del profilo");
}

async function export_chats (export_type, _) 
{
    console.log("Esportazione della chat: ", WASaver.get_chat_title());
    "CSV (chat)" === export_type ? await proceedMessages_CSV(function () {
        if (WASaver.get_Doc()) {
            WASaver.setProgressText("Downloading files...");
            let e = {
                type: "CSV",
                doc: WASaver.get_Doc(),
                media: WASaver.get_media(),
                title: WASaver.get_chat_title()
            };
            chats.push(e);
            WASaver.clear_Doc();
            WASaver.clear_msgs();
            WASaver.clear_media();
        } 
        else WASaver.setProgressText("No messages for "+WASaver.get_chat_title()+" in the chosen period.");
    }) : error_alert("Something wrong")
}

function findGroups(current_chat)
{
    var groups = [];
    if (current_chat.__x_isGroup)
        return groups;

    all_chats = WASaver.get_WAStore().Chat._models;
    
    WASaver.setProgressText("Ricerca gruppi in corso...");
    console.log("Cerco gruppi per: ", current_chat.__x_id.user, current_chat.__x_formattedTitle);
    for (let i = 0;  i < all_chats.length ;i++)
    {
        if (all_chats[i].__x_isGroup)
        {
            console.log("Gruppo: "+all_chats[i].__x_formattedTitle, all_chats[i]);

            participants = all_chats[i].__x_groupMetadata.participants._models;
            console.log("Lista partecipanti: ", participants);
            past_participants = all_chats[i].__x_groupMetadata.pastParticipants._models;
            console.log("Lista ex partecipanti: ", past_participants);

            for(let j = 0; j < participants.length; j++)
            {
                if ( participants[j].__x_id.user == current_chat.__x_id.user )
                {
                    //Salva l'id o il nome del gruppo
                    //groups.push(all_chats[i].__x_formattedTitle);
                    console.log("Gruppo trovato: ", all_chats[i].__x_formattedTitle)
                    groups.push(all_chats[i]);
                }
            }

            for(let k = 0; k < past_participants.length; k++)
            {
                if (past_participants[k].__x_id.user == current_chat.__x_id.user)
                {
                    //Salva l'id o il nome del gruppo
                    //groups.push(all_chats[i].__x_formattedTitle);
                    console.log("Gruppo trovato: ", all_chats[i].__x_formattedTitle)
                    groups.push(all_chats[i]);
                }
            }
        }
    }
    console.log("Gruppi trovati\n", groups);
    return groups; 
}

