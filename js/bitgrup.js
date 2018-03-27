
//FUNCTIONS APP

var bitgrup = {
    urlFunctions: 'https://bitgrup.es/webtest/segursub/includes/ajax_mobile.php',
    urlFunctions2: 'https://bitgrup.es/webtest/segursub/json/test.json',
//    urlFunctions2: 'https://www.divemasterinsurance.com/JSONtest/JSONTest.php?TransactionID=3542',
    DB: null,
    menu_heiht: 0,
    oferta: 0,
    ficha: 0,
    page: "",
    lang: "",
    initApp: function () {

        bitgrup.initLangs();

        //COMPROVAM SESSIO
        bitgrup.users.getSession();
        //TORNADA ENRERA
        $(".pagina").on("swiperight", function () {
            window.history.back();
        });
        var page = '';
        //ABANS DE CANVIAR DE PAGINA TORNAM A COMPROVAR LA SESSIO

        var url = window.location.href;
        var page = url.split("#")[1];
        $(document).on("pagebeforechange", function (e, data) {
            var toPage = data.toPage[0].id;
            if (toPage != "login" && toPage) {
                if (!bitgrup.users.getSession()) {
                    e.preventDefault();
                }
            }
        });

        bitgrup.ofertas();
        bitgrup.ofert_funct();
        bitgrup.segurs();
        bitgrup.ficha_funct();
    },
    initLangs: function () {
        bitgrup.getLang();
        jQuery.i18n.properties({
            name: 'Messages', //Nombre del fichero
            path: 'bundle/', //Carpeta donde la incluimos
            mode: 'both',
            language: bitgrup.lang, //Lenguaje, hablaremos del el abajo
            callback: function () {
                //Callback
                bitgrup.setLiterals();
            }
        });
    },
    getLang: function () {
        var lang = null;
        if (navigator && navigator.userAgent && (lang = navigator.userAgent.match(/android.*\W(\w\w)-(\w\w)\W/i))) {
            lang = lang[1];
        }

        if (!lang && navigator) {
            if (navigator.language) {
                lang = navigator.language;
            } else if (navigator.browserLanguage) {
                lang = navigator.browserLanguage;
            } else if (navigator.systemLanguage) {
                lang = navigator.systemLanguage;
            } else if (navigator.userLanguage) {
                lang = navigator.userLanguage;
            }
            lang = lang.substr(0, 2);
        }
        bitgrup.lang = lang;
    },
    setLiterals: function () {
        var literal = null;
        $('.literal').each(function () {
            literal = $(this).data('literal');
            $(this).text(jQuery.i18n.prop(literal));
        });
    },
    conect: function (formData) {
        var resposta = '';
        $.ajax({
            url: bitgrup.urlFunctions, type: 'POST', data: formData, cache: false, contentType: false, processData: false, async: false, beforeSend: function () {},
            complete: function () {},
            success: function (data) {
                try {
                    resposta = JSON.parse(data);
                } catch (e) {
                    console.log(e);
                }
            },
            error: function (xhr, ajaxOptions, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
            }
        });

        return resposta;
    }
    ,
    conect2: function () {
        var resposta = '';
        $.ajax({
            url: bitgrup.urlFunctions2, type: 'POST', cache: false, contentType: false, processData: false, async: false, beforeSend: function () {},
            complete: function () {},
            success: function (data) {
                resposta = data;
            },
            error: function (e) {
                console.log(e);
            }
        });
        return resposta;
    }
    ,
    //<!-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    //<!-=-=-=-=-=-=-=-=-=-=-=-=-=-     Login     -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    //<!-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    login: function () {
        $("#login_form").submit(function (e) {
            bitgrup.users.login();
            return false;
            e.preventDefault();
        });
        $("footer .log_out").click(function () {
            bitgrup.areYouSure("¿Esta seguro de que desea cerrar la sesión?", "Si", "No", bitgrup.users.logOut);
        });
    }
    ,
    ofertas: function () {
        var str = '';
        var formData = new FormData();
        formData.append("function", "get_ofertas");
        formData.append("lang", bitgrup.lang);
        var resp = bitgrup.conect(formData);
        $("#list_ofertas").html(resp.str);
    }
    ,
    to_oferta: function (id) {
        localStorage.setItem('oferta', id);
        bitgrup.ofert_funct();
        bitgrup.changePage("oferta");
    }
    ,
    ofert_funct: function () {
        var formData = new FormData();
        bitgrup.oferta = localStorage.getItem("oferta");
        formData.append("function", "get_oferta");
        formData.append("lang", bitgrup.lang);
        formData.append("id", bitgrup.oferta);
        var res = bitgrup.conect(formData);
        $("#oferta .grey-heading-title").html(res.nom);
        $("#oferta .title-new.tit1").html(res.data_in + " - " + res.data_fi);
        $("#oferta .desciption_cont").html(res.text);
        $("#oferta .imgs_list").html(res.str);
    }
    ,
    to_segur: function (id) {
        localStorage.setItem('ficha', id);
        bitgrup.changePage("ficha");
    }
    ,
    segurs: function () {
        var res = bitgrup.conect2();
        $.each(res.insurances, function (key, value) {
            var formData = new FormData();
            formData.append("function", "get_tipus_segur");
            formData.append("lang", bitgrup.lang);
            formData.append("code", value.type);
            var resp = bitgrup.conect(formData);
            $(".lists_segurs").append('<li class="list-message">\n\
                                        <a class="link-blog-list w-inline-block" onclick="bitgrup.to_segur(\'' + key + '\')">\n\
                                            <div class="column-left w-clearfix">\n\
                                                <div class="image-message">\n\
                                                    <img src="../images/ofertas/mobile_' + resp.str.img + '" style="max-height: 100%; max-width: none;">\n\
                                                </div>\n\
                                            </div>\n\
                                            <div class="column-right">\n\
                                                <div class="message-title">\n\
                                                    <span class="title">' + value.init + '</span>\n\
                                                    <span class="title2">' + value.end + '</span>\n\
                                                </div>\n\
                                                <div class="message-text">' + resp.str.nom + '</div>\n\
                                            </div>\n\
                                        </a>\n\
                                    </li>');
        })
    }
    ,
    ficha_funct: function () {
        var res = bitgrup.conect2();
        var seg = res.insurances[bitgrup.ficha];
        var formData = new FormData();
        formData.append("function", "get_tipus_segur");
        formData.append("lang", bitgrup.lang);
        formData.append("code", seg.type);
        var resp = bitgrup.conect(formData);
        $("#ficha .profile-avatar img").attr("src", '../images/ofertas/mobile_' + resp.str.img + '');
        $("#ficha .profile-avatar img").attr("height", '74');
        $("#ficha .profile-avatar-name").html(resp.str.nom);
        $("#ficha .profile-figures .date_in").html(seg.init);
        $("#ficha .profile-figures .date_fin").html(seg.end);
//        $("#ficha .description").html(' <object data="http://'+seg.conditions+'" type="application/pdf">\n\
//                                            <embed src="http://'+seg.conditions+'" type="application/pdf" />\n\
//                                        </object>');
        $("#ficha .description").html('<iframe id="fred" style="border:1px solid #666CCC" title="PDF in an i-Frame" src="http://' + seg.conditions + '" frameborder="1" scrolling="auto" width="100%" ></iframe>');
    }
    ,
//<!-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
//<!-=-=-=-=-=-=-=-=-=-=-=-     IMPORTACIO  XML   =-=-=-=-=-=-=-=-=-=-==-=-=-=-=-->
//<!-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    importacio: {
        inputsTotal: 0,
        inputsProcessats: 0,
        init: function () {
            bitgrup.changePage('importacio');
        },
        copyFile: function () {
            customFileChooser.open('', bitgrup.importacio.success, bitgrup.importacio.fail);
        },
        fail: function (e) {
            console.log(e);
            bitgrup.error_('ERROR-45', '', 'Error important arxiu xml');
        },
        success: function (uri) {
            bitgrup.importacio.getPath.init(uri);
        },
        getPath: {
            init: function (uri) {
                bitgrup.progressBar(0, 0);
                window.FilePath.resolveNativePath(uri, bitgrup.importacio.getPath.success, bitgrup.importacio.getPath.fail);
            },
            success: function (file_) {
                //GET FILE CONTENT
                $.ajax({url: file_, type: 'GET', dataType: 'xml',
                    success: function (data) {
                        bitgrup.importacio.save(data);
                    },
                    error: function (e) {
                        $('#loading').hide();
                        console.log(e);
                        bitgrup.error_('E BIT-101', 'Error important arxiu xml');
                    }
                });
            },
            fail: function (e) {
                $('#loading').hide();
                console.log(e);
                bitgrup.error_('ERROR-107', '', 'Error important arxiu xml');
            }
        },
        save: function (xml_in) {
            //##########################        INCIDENCIES     ##################
            dataBase.query('DELETE FROM INCIDENCIES');
            $(xml_in).find('LECTINCID').each(function (index, element) {
                dataBase.query('INSERT INTO INCIDENCIES (INCCODIGO, INCDESCRI) VALUES (?,?)', [$(this).find('INCCODIGO').text(), $(this).find('INCDESCRI').text()]);
            });
            //##########################        COMPTADORS     ##################
            dataBase.query('DELETE FROM COMPTADORS');
            bitgrup.importacio.inputsTotal = $(xml_in).find('LECTAGUAS').length;
            bitgrup.importacio.inputsProcessats = 0;
            try {
                $(xml_in).find('LECTAGUAS').each(function (index, element) {
                    var compt = $(this);
                    dataBase.query('INSERT INTO COMPTADORS (LAGINSTAN,LAGCONTAD,LAGBKCONT,LAGCONTRA,LAGCTINOM,LAGCTITVI,LAGCTIVIA,LAGCTININ,LAGCTIDIR,LAGRUTAAG,LAGFLEANT,LAGULTLEC,LAGACTLEC,LAGLECENT,LAGLECEXP,LAGINCIDE,LAGBKINCI,LAGCONSUM,LAGCONMED,LAGCOMEUP,LAGORDENA) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
                            [compt.find('LAGINSTAN').text(), compt.find('LAGCONTAD').text(), compt.find('LAGBKCONT').text(), compt.find('LAGCONTRA').text(), compt.find('LAGCTINOM').text(),
                                compt.find('LAGCTITVI').text(), compt.find('LAGCTIVIA').text(), compt.find('LAGCTININ').text(), compt.find('LAGCTIDIR').text(), compt.find('LAGRUTAAG').text(),
                                compt.find('LAGFLEANT').text(), compt.find('LAGULTLEC').text(), compt.find('LAGACTLEC').text(), compt.find('LAGLECENT').text(), compt.find('LAGLECEXP').text(),
                                compt.find('LAGINCIDE').text(), compt.find('LAGBKINCI').text(), compt.find('LAGCONSUM').text(), compt.find('LAGCONMED').text(), compt.find('LAGCOMEUP').text(),
                                compt.find('LAGORDENA').text()], bitgrup.importacio.finalitzat
                            );
                });
                //RESET LECTURES
                dataBase.query('DELETE FROM LECTURES');
            } catch (e) {
                console.log(e);
                bitgrup.error_('ERROR-143', '', 'Error actualitzant la base de dades');
            }

        },
        finalitzat: function (result) {
            bitgrup.importacio.inputsProcessats++;
            if (bitgrup.importacio.inputsProcessats >= bitgrup.importacio.inputsTotal) {
                bitgrup.areYouSure('Importació finalitzada, es necessari reiniciar l\'app', 'Reiniciar', function () {
                    bitgrup.inici();
                });
            }
            bitgrup.progressBar(bitgrup.importacio.inputsProcessats, bitgrup.importacio.inputsTotal);
        }
    },
    //<!-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    //<!-=-=-=-=-=-=-=-      CONTROL D'USUARIS     =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    //<!-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    users: {
        user: '',
        permisos: 0,
        password: '',
        token: 'KDJFLFIFF89EKDJ',
        sessionId: '',
        login: function () {
            var user = $('#user').val();
            var password = md5($('#password').val());
            if (user != '' && password != '') {
                var formData = new FormData();
                formData.append("funcio", "login");
                formData.append("usuari", user);
                formData.append("password", password);
                var resp = bitgrup.conect(formData);
                if (resp.error == 0) {
                    if (resp.logIn == 1) {
                        bitgrup.users.user = user;
                        bitgrup.users.password = password;
                        bitgrup.users.sessionId = md5(bitgrup.users.token + bitgrup.users.user + bitgrup.users.password);
                        bitgrup.users.writeSession();
                        //CARREGAM LLISTAT
                        bitgrup.changePage("menu");
                    } else {
                        bitgrup.areYouSure(resp.str, '', false);
                    }
                }
            } else {
                bitgrup.areYouSure('Usuario y contraseña obligatorios', '', false);
            }
        },
        login2: function () {
            var id = $('#id').val();
            if (id != '') {
//                var formData = new FormData();
//                formData.append("funcio", "login");
//                formData.append("id", id);
//                var resp = bitgrup.conect(formData);
//                if (resp.error == 0) {
//                    if (resp.logIn == 1) {
                if (id == "demo") {
                    bitgrup.users.user = id;
                    bitgrup.users.sessionId = md5(bitgrup.users.token + bitgrup.users.user + bitgrup.users.password);
                    bitgrup.users.writeSession();
                    //CARREGAM LLISTAT
                    bitgrup.changePage("home");
                } else {
                    alert("error");
                    console.log("error");
//                        bitgrup.areYouSure('Incorrect usser', '', false);
                }
//                }
            } else {
                alert("error2");
//                bitgrup.areYouSure('Usuario y contraseña obligatorios', '', false);
            }
        },
        logOut: function () {
            localStorage.setItem('sessionId', 0);
            localStorage.setItem('user', '');
            localStorage.setItem('password', '');
            bitgrup.inici();
        },
        writeSession: function () {
            //COOKIE SESSION
            var date, expires;
            var days = 30;
            if (days) {
                date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = date.toGMTString();
            } else {
                expires = "";
            }
            localStorage.setItem('sessionId', bitgrup.users.sessionId);
            localStorage.setItem('user', bitgrup.users.user);
            localStorage.setItem('password', bitgrup.users.password);
            localStorage.setItem('expires', expires);
        },
        getSession: function () {
            var f1 = new Date(localStorage.getItem('expires'));
            var f2 = new Date();
            //SI NO HA EXPIRAT
            if (f1 >= f2) {
                bitgrup.users.sessionId = localStorage.getItem('sessionId');
                bitgrup.users.user = 'demo';
                bitgrup.users.password = '';
                if (bitgrup.users.sessionId != '' && bitgrup.users.user != '') {
                    var sessId = md5(bitgrup.users.token + bitgrup.users.user + bitgrup.users.password);
                    if (sessId == bitgrup.users.sessionId) {
//                        $('#logIn').hide();
//                        $('#logOut').css('display', 'block');


//                        window.location = bitgrup.page;
                        return true;
                    } else {
                        bitgrup.changePage('login');
                        return false;
                    }
                } else {
                    bitgrup.changePage("login");
                    return false;
                }
            } else {
                bitgrup.users.sessionId = '';
//                bitgrup.changePage('login');
                return false;
            }

        }
    },
    //<!-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    //<!-=-=-=-=-=-=-=-     FUNCIONS GENERALS      =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    //<!-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-->
    inici: function () {
        window.location.href = "index.html";
    },
    error_: function (codi, json, error) {
        $('#loading').hide();
        console.log(codi + ' *** ' + json + ' **** ' + error)
        bitgrup.areYouSure('Ho sentim, qualque cosa no ha anat bé', '', false);
    },
    carrega: function (url) {
        var ref = window.open(url, '_system', 'location=yes');
    },
    areYouSure: function (text2, button, button2, callback) {
        $("#sure .sure-2").html(text2);
        if (button && button2 !== '') {
            $('.sure-do').html(button);
            $('.not-sure-do').show();
            $('.not-sure-do').html(button2);
        } else {
            $('.sure-do').html('Aceptar');
            $('.not-sure-do').hide();
        }
        $(".sure-do").click(function () {
            if (callback) {
                callback();
                callback = false;
            }
            $('#sure').dialog('close');
        });
        $('.not-sure-do').click(function () {
            $('#sure').dialog('close');
        });
        $("#sure").dialog();
    },
    changePage: function (page) {
        $.mobile.changePage("#" + page, {"transition": "slide"});
    },
    changePageBack: function (page) {
        $.mobile.changePage("#" + page, {"transition": "slide", reverse: true});
    },
    openDeviceBrowser: function (externalLinkToOpen) {
        window.open(externalLinkToOpen, '_system', 'location=no');
    },
    htmlEntities: function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    },
    sendAjax: function (formData) {
        formData.append('sessionId', bitgrup.users.sessionId);
        formData.append('user', bitgrup.users.user);
        var json = false;
        $.ajax({
            url: bitgrup.urlFunctions, timeout: 3000, type: 'POST', data: formData, cache: false, contentType: false, processData: false, async: false,
            beforeSend: function () {
                $('#loading').show();
            },
            complete: function () {
                $('#loading').hide();
            },
            success: function (resposta) {
                try {
                    var resp = JSON.parse(resposta);
                    if (resp.error == 1) {
                        bitgrup.error_('E BIT-184', '', resp.str);
                    } else {
                        json = resp;
                    }
                } catch (e) {
                    bitgrup.error_('E BIT-189', '', e);
                    json = {error: 1};
                }
            },
            error: function (e) {
                $('#loading').hide();
                bitgrup.error_('E BIT-194', 'Sense connexió', e);
                json = {error: 1};
            }
        });
        return json;
    },
    getDate: function (date_) {
        if (date_) {
            var d = new Date(date_);
        } else {
            var d = new Date();
        }
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    },
    parseISOString: function (s) {
        return bitgrup.getDate(Date.parse(s));
    },
    parseISOLocalString: function (date_) {
        if (date_) {
            var d = new Date(date_);
        } else {
            var d = new Date();
        }
        function pad(n) {
            return n < 10 ? '0' + n : n
        }
        ;
        var utc = d.getTimezoneOffset() / 60;
        var str = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + utc + ':00';
        return str;
    },
    progressBar: function (status, total) {
        if (status == 0) {
            $("#body_progressbar").show();
            $("#progressbar").progressbar({value: 1});
            $('#mss_progressbar').html('Carregant el fitxer dins la memòria');
        } else if (status < total) {
            $('#mss_progressbar').html('Insertant dins la base de dades');
            var percnt = parseInt((status * 100) / total);
            $("#progressbar").progressbar({value: percnt});
            $("#progressbar .ui-progressbar-value").html(percnt + '%');
        } else {
            $('#mss_progressbar').html('');
            $("#progressbar").progressbar({value: 0});
            $("#body_progressbar").hide();
        }
    }
}





//ON DEVICE READY
//function onLoad() {
//
//    if ((/(ipad|iphone|ipod|android|windows phone)/i.test(navigator.userAgent))) {
//        document.addEventListener('deviceready', bitgrup.initApp, false);
//    } else {
//        bitgrup.initApp();
//    }
//}

$(document).ready(function () {
    bitgrup.initApp();
});
//per carregar pagines externes amb jquery ####################

$(document).bind("mobileinit", function () {
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
});
// Determine support properties
(function (xhr) {
    jQuery.extend(jQuery.support, {
        ajax: !!xhr,
        cors: !!xhr && ("withCredentials" in xhr)
    });
})(jQuery.ajaxSettings.xhr());