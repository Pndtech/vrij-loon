/*!
* VrijLoon
* Copyright (C) 2017 Pndtech BV
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/
;(function($) {
    "use strict";
    
    $.views.tags("nf", function(number) {
        return format_number(number)
    });
    
    var API, beschikbareJaren, laatsteJaar, gekozenJaar, 
        db = { werkgever: null, werknemer: null, inkomstenverhouding: null, loonuitdraai: null };
    
    var maanden = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
    
    var colours = [
    	'rgb(255, 99, 132)',
    	'rgb(255, 159, 64)',
    	'rgb(255, 205, 86)',
    	'rgb(75, 192, 192)',
    	'rgb(54, 162, 235)',
    	'rgb(153, 102, 255)',
    	'rgb(231,233,237)'
    ];
    
    function sum(array, item) {
        if(array instanceof Array) {
            return array.reduce(function(a, b) {
                return a + (typeof item != 'undefined' ? b[item] : b);
            }, 0);
        }
    }
    
    function valideerAow(aow) {
        if(typeof aow === 'undefined' || aow === 0 || aow === null) {
            return 'niet';
        }else if(aow === 1 || aow === false) {
            return 'voor';
        }else if(aow === 2 || aow === true) {
            return 'in';
        }
        API.log('Onbekende waarde voor aow parameter: ' + aow);
        
    }
    
    function bereken(bedrag, tarief) {
        var berekendTarief = 0;
        
        if(typeof tarief.bedrag != 'undefined') {
            if(tarief.bedrag instanceof Function) {
                berekendTarief = tarief.bedrag(bedrag);
            }else{
                berekendTarief = tarief.bedrag;
            }
        }else if(typeof tarief.percentage != 'undefined') {
            berekendTarief = bedrag * tarief.percentage / 100;
        }else{
            API.log('Onbekend hoe dit tarief berekend moet worden: ', tarief);
            return false;
        }
        
        berekendTarief = Math.floor(berekendTarief);
        
        if(typeof tarief.minimum != 'undefined' && berekendTarief < tarief.minimum) {
            return 0;
        }else if(typeof tarief.maximum != 'undefined' && berekendTarief > tarief.maximum) {
            return tarief.maximum;
        }
        
        return berekendTarief;
    }
    
    function format_number(number) {
        return $.number(number, 2, ',', '.');
    }
    
    $.fn.vrijLoon = function( options ) {
        var cmd, cmdFn;
        var args = $.makeArray( arguments );
        
        if( $.type( options ) == 'string' ) {
            var cmdArgs;
            
            cmd = options;
            cmdFn = API[ cmd ];
            if ( $.isFunction( cmdFn )) {
                cmdArgs = args;//$.makeArray( args );
                cmdArgs.shift();
                return cmdFn.apply( API, cmdArgs );
            } else {
                API.log('unknown command ' + cmd);
            }
        } else {
            var container = $(this);
            
            API.container = container;
            API.options = $.extend( {}, $.fn.vrijLoon.defaults, options || {});
            
            for(var dbname in db) {
                db[dbname] = TAFFY();
                db[dbname].store('vrij-loon.'+dbname);
            }
            
            beschikbareJaren = [];
            for(var key in $.fn.vrijLoon.tarieven) {
                beschikbareJaren.push(key);
            }
            laatsteJaar = gekozenJaar = Math.max.apply(Math, beschikbareJaren);
            
            API.init();
            
            return container;
        };
    };
    
    $.fn.vrijLoon.basisTarief = {
        tarief: function(tariefType, aow) {
            return this[tariefType][aow];
        },
        berekenBox1: function(inkomen, aow, maand) {
            return API.tariefBerekeningCumulatief(inkomen, this.box1[aow]);
        },
        
        berekenTarief: function(tariefType, inkomen, aow) {
            if(this[tariefType][aow] === false) return this[tariefType][aow];
            
            return API.tariefBerekeningAfhankelijk(inkomen, this[tariefType][aow]);
        },
        
        berekenHeffingsKorting: function(inkomen, aow) {
            return this.berekenTarief('heffingsKorting', inkomen, aow);
        },
        
        berekenArbeidsKorting: function(inkomen, aow) {
            return this.berekenTarief('arbeidsKorting', inkomen, aow);
        },
        
        berekenPremieZvw: function(inkomen, verzekerd) {
            var tarief = this.premieZvw[verzekerd];
            
            return API.tariefBerekening(inkomen, tarief);
        },
        grensPremieZvw: function(inkomen, verzekerd) {
            var tarief = this.premieZvw[verzekerd];
            
            return API.tariefBerekening(inkomen, tarief);
        },
        // https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/themaoverstijgend/brochures_en_publicaties/model-loonstaat-2017
        maakLoonstaat: function(maand, inkomstenverhouding, werkgever, werknemer, voorgaandeLoonstaten) {
            var cumulatieven = {}, voorgaandeLoonstaat;
            //for(var prevMaand in voorgaandeLoonstaten) {
            for(var prevMaand = 0; prevMaand < voorgaandeLoonstaten.length; prevMaand++) {
                for(var kolom in voorgaandeLoonstaten[prevMaand]) {
                    if (!cumulatieven[kolom]) {
                        cumulatieven[kolom] = 0
                    }
                    cumulatieven[kolom]+= voorgaandeLoonstaten[prevMaand][kolom];
                }
            }

            var salaris = parseInt(inkomstenverhouding.brutoLoon);
            
            // Bereken het loon voor de werknemersverzekeringen, rekenind houdend met het maximum rekenbedrag
            // TODO: dit ondersteunen we helaas (nog) niet
            var kolom8 = inkomstenverhouding.codeLoon == 17 ? 0 : salaris;
            
            // Bereikt de werknemer dit jaar de AOW leeftijd?
            // TODO: we ondersteunen (vooralsnog) alleen een leeftijd jonger dan AOW
            var leeftijdEindeJaar = this.kalenderJaar - werknemer.geboorteDatum.substr(0,4),
                aowParameter = leeftijdEindeJaar > this.aowLeeftijd[0] ? 'voor' : (leeftijdEindeJaar == this.aowLeeftijd[0] ? 'in' : 'niet');
            
            // Over hoeveel maanden kunnen we het verwachtArbeidsInkomen berekenen
            var rekenMaandenInJaar = (13 - maand) + voorgaandeLoonstaten.length;
            // Het verwachte arbeidsinkomen gebruiken we om de juiste arbeidsKortingen toe te passen
            // Als we minder dan 12 voorgaande loonstaten hebben corrigeren we hiervoor met het huidige salaris
            // Op deze manier zal het minder snel voorkomen dat je te veel arbeidsKorting krijgt
            var verwachtArbeidsInkomen = cumulatieven.kolom3 || 0 + cumulatieven.kolom4 || 0 + cumulatieven.kolom5 || 0;
                verwachtArbeidsInkomen+= (13 - maand + 12 - rekenMaandenInJaar) * salaris;
            
            // Bereken de verschuldigde loonbelasting
            // kolom15
            var loonbelasting = API.tariefBerekeningCumulatief(verwachtArbeidsInkomen, this.box1[aowParameter]) / 12;

            // Bereken de Zvw premie, rekening houdend met het maximale bijdrage inkomen
            // kolom16
            var premieZvw = null, kolom12 = null;
            if(this.codes.codeZvw[inkomstenverhouding.codeZvw].match(/wel/i)) {
                premieZvw = 0;
                
                if(cumulatieven.kolom12 + salaris > this.premieZvw.maxBijdrageInkomen) {
                    kolom12 = this.premieZvw.maxBijdrageInkomen - cumulatieven.kolom12;
                }else{
                    kolom12 = salaris;
                }
                
                if(inkomstenverhouding.codeZvw == 'K' || inkomstenverhouding.codeZvw == 'M') {
                    var tariefZvw = this.premieZvw[inkomstenverhouding.codeZvw == 'K' ? 'werkgeversHeffing' : 'eigenBijdrage'];
                    premieZvw = API.tariefBerekening(salaris, tariefZvw);
                }
            }
            
            // Bereken de arbeidsKorting indien van toepassing
            // kolom18
            var loonheffingsKorting = 0;
            var arbeidsKorting = 0;
            if(inkomstenverhouding.korting === 'ja') {
                loonheffingsKorting = this.berekenTarief('heffingsKorting', verwachtArbeidsInkomen, aowParameter);
                arbeidsKorting = this.berekenTarief('arbeidsKorting', verwachtArbeidsInkomen, aowParameter);
                
                loonheffingsKorting = loonheffingsKorting / 12;
                arbeidsKorting = arbeidsKorting / 12;
            }
            
            // Bereken het aantal loon dagen in deze maand
            var dagVanDeWeek, loonDagen = 0;
            for(var dag = 1; dag <= (new Date(this.kalenderJaar, maand, 0)).getDate(); dag++) {
                dagVanDeWeek = (new Date(this.kalenderJaar, maand - 1, dag)).getDay()
                if(dagVanDeWeek && dagVanDeWeek < 6) 
                    loonDagen++;
            }
            
            // Bereken de reiskosten vergoeding indien van toepassing
            var reiskilometers = 0, reiskosten = 0;
            if(inkomstenverhouding.reiskostenOnbelast) {
                reiskilometers = inkomstenverhouding.reiskostenOnbelast * loonDagen;
                reiskosten = Math.floor(100 * reiskilometers * this.onbelasteKmVergoeding) / 100;
            }
            
            var uurloon = salaris / 174;
            var minimumloon = 0;
            var leeftijd = this.kalenderJaar - 1*werknemer.geboorteDatum.substr(0,4);
            if(maand < 1*werknemer.geboorteDatum.substr(5,2)) leeftijd--;
            
            var tijdvak = this.codes.tijdvakSoort[inkomstenverhouding.tijdvakSoort].replace('Loon per ', '');
            var sortedMinimums = Object.keys(this.minimum).sort().reverse();
            for(var i = 0; i < sortedMinimums.length; i++) {
                var beginDatum = sortedMinimums[i];
                if( 1*(this.kalenderJaar + ('0'+maand).slice(-2) + '01') >= beginDatum) {
                    minimumloon = this.minimum[beginDatum][(leeftijd > 23 ? 23 : leeftijd)][tijdvak];
                    break;
                }
            }
            
            var kolom3 = Math.floor(100 * salaris) / 100;
            var kolom15 = Math.floor(100 * (loonbelasting - loonheffingsKorting - arbeidsKorting)) / 100;
            var kolom17 = Math.floor(100 * (kolom3 - premieZvw - kolom15)) / 100;
            var kolom18 = Math.floor(100 * arbeidsKorting) / 100;
            var brutoLoon = Math.floor(100 * (salaris)) / 100;
            var nettoLoon = Math.floor(100 * (salaris - premieZvw - loonbelasting + loonheffingsKorting + arbeidsKorting)) / 100;
            var uitbetaald = Math.floor(100 * (nettoLoon + reiskosten)) / 100;
            
            return {
                jaar: 1*this.kalenderJaar,
                periode: 1*maand,
                kolom1: maanden[(maand-1)] + ' ' + this.kalenderJaar,
                kolom2: inkomstenverhouding.nummer,
                kolom3: kolom3,
                kolom4: 0,
                kolom5: 0,
                kolom7: 0,
                kolom8: kolom8,
                kolom12: kolom12,
                kolom14: salaris,
                kolom15: kolom15,
                kolom16: premieZvw,
                kolom17: kolom17,
                kolom18: kolom18,
                kolom19: 0,
                salaris: salaris,
                loonheffingsKorting: loonheffingsKorting,
                arbeidsKorting: arbeidsKorting,
                loonbelasting: loonbelasting,
                loonDagen: loonDagen,
                loonUren: loonDagen * 8,
                brutoLoon: brutoLoon,
                nettoLoon: nettoLoon,
                uitbetaald: uitbetaald,
                minimumLoon: minimumloon,
                uurLoon: uurloon,
                reiskilometers: reiskilometers,
                reiskosten: reiskosten,
                inkomstenverhouding: inkomstenverhouding,
                leeftijd: leeftijd,
                werknemer: werknemer,
                werkgever: werkgever,
            };
        },
    };
    
    $.fn.vrijLoon.tarieven = {};
    
    var API = {
        container: null,
        options: null,
        init: function() {
            this.tekenMenu('werkgever');
            this.tekenMenu('werknemer');
            
            this.laadCodes(gekozenJaar);
            this.tekenMenu('inkomstenverhouding');
            this.tekenMenu('loonuitdraai');
            
            // Add eventlisteners for elementen met vrijloon-action data attribuut
            API.container.find('[data-vrijloon-action]').on('click', function() {
                var el = $(this),
                    action = el.data('vrijloon-action'),
                    prevent = action[0] != "!";
                
                API.container.vrijLoon(action.replace(/^!?/, ''), el.data('vrijloon-parameter'));
                if(prevent) return false;
            });
            
            // Add eventlistener for restore input file
            API.container.find('input#restore').on('change', function(event) {
                API.restoreBestand(event.target.files[0]);
            });
            
            // Handle form submits
            API.container.find('.modal[data-for] form').on('submit', function() {
                var form = $(this),
                    modal = form.parents('.modal'),
                    type = modal.data('for'),
                    message, 
                    row = {};
                
                $.map(form.serializeArray(), function(n,i) {
                    if(typeof row[n['name']] != 'undefined') {
                        if(!(row[n['name']] instanceof Array)) row[n['name']] = [ row[n['name']] ];
                        
                        row[n['name']].push(n['value']);
                    }else{
                        row[n['name']] = n['value'];
                    }
                });
                
                var dbtype = db[type];
                
                // Valideer form values
                if(type == 'werkgever') {
                    // Controleer of loonheffings nummer uniek is
                    if(dbtype({nummer:{is:row.nummer}}).filter({___id:{"!is":row.id}}).count()) {
                        API.notification(false, 'Er bestaat al een werkgever met loonheffingsnummer ' + row.nummer, 'warning', form.find('.modal-body'))
                        return false;
                    }
                }else if(type == 'werknemer') {
                    if(!row.nummer) {
                        row.nummer = ('0000' +(1*dbtype().max('nummer') + 1)).slice(-4);
                    }
                    // Controleer of werknemer nummer uniek is
                    if(dbtype({nummer:{is:row.nummer}}).filter({___id:{"!is":row.id}}).count()) {
                        API.notification(false, 'Er bestaat al een werknemer met nummer ' + row.nummer, 'warning', form.find('.modal-body'))
                        return false;
                    }
                    // Controleer of BSN unique is
                    if(dbtype({bsn:{is:row.bsn}}).filter({___id:{"!is":row.id}}).count()) {
                        API.notification(false, 'Er bestaat al een werknemer met bsn ' + row.bsn, 'warning', form.find('.modal-body'))
                        return false;
                    }
                }else if(type == 'inkomstenverhouding') {
                    // Controleer of combinatie unique is
                    if(dbtype({nummer:{is:row.nummer}}).filter({werkgever:{is:row.werkgever}}).filter({werknemer:{is:row.werknemer}}).filter({___id:{"!is":row.id}}).count()) {
                        API.notification(false, 'De combinatie van werkgever, werknemer en nummer inkomstenverhouding moet uniek zijn', 'warning', form.find('.modal-body'))
                        return false;
                    }
                }else if(type == 'maak-loonuitdraai') {
                    if(!(row.inkomstenverhouding instanceof Array)) row.inkomstenverhouding = [ row.inkomstenverhouding ];
                    
                    var count = { nieuw: 0, update: 0 };
                    $.each(row.inkomstenverhouding, function(i, inkomstenverhoudingIndex) {
                        var jaarTarieven = API.tarievenVoorJaar(row.jaar);

                        var loonstaatVoor = inkomstenverhoudingIndex.split('|');
                        var werkgever = db.werkgever({nummer:loonstaatVoor[1]}).first();
                        var werknemer = db.werknemer({nummer:loonstaatVoor[2]}).first();
                        var inkomstenverhouding = db.inkomstenverhouding({nummer:loonstaatVoor[0]},{werkgever:loonstaatVoor[1]},{werknemer:loonstaatVoor[2]}).first();

                        var voorgaande = db.loonuitdraai(function() {
                            return this.inkomstenverhouding.id == inkomstenverhouding.id && this.jaar == row.jaar && this.periode != row.maand;
                        }).get();

                        var loonstaat = jaarTarieven.maakLoonstaat(row.maand, inkomstenverhouding, werkgever, werknemer, voorgaande);
                        loonstaat.inkomstenverhoudingIndex = inkomstenverhoudingIndex;
                        
                        var bestaat = db.loonuitdraai(  {inkomstenverhoudingIndex:loonstaat.inkomstenverhoudingIndex},
                                                        {jaar:loonstaat.jaar},
                                                        {periode:loonstaat.periode});
                        
                        if(bestaat.count()) {
                            db.loonuitdraai({inkomstenverhoudingIndex:loonstaat.inkomstenverhoudingIndex},{jaar:loonstaat.jaar},{periode:loonstaat.periode}).update(loonstaat);
                            count.update++;
                        }else{
                            db.loonuitdraai.insert(loonstaat);
                            count.nieuw++;
                        }
                    });
                    type = 'loonuitdraai';
                    message = '';
                    if(count.nieuw) message+= count.nieuw + ' loonuitdraaien gemaakt';
                    if(count.nieuw && count.update) message+= ' &amp; ';
                    if(count.update) message+= count.update + ' loonuitdraaien geupdate';
                }
                 
                if(type != 'loonuitdraai') {
                    if(!row.id) {
                        dbtype.insert(row);
                        
                        message = type + ' toegevoegd';
                    }else{
                        dbtype(row.id).update(row);
                        
                        message = type + ' aangepast';
                    }
                }
                API.tekenMenu(type);
                API.initDashboard();
                
                var notification = API.notification(false, message, 'success', API.container.find('.sidebar'))
                
                form.parents('.modal').data('modal-timeout', setTimeout(function() {
                    notification.hide('fast', function() {
                        notification.remove();
                    });
                }, 3000)).modal('hide');
                
                return false;
            }); // Einde Handle form
            
            API.container.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
                var tabId = $(e.target).attr('aria-controls'),
                    body = API.container.find('#' + tabId),
                    title = $('title'),
                    data = body.parents('.page').data('loonuitdraai');
                
                if(tabId == 'loonstaat') {
                    var tmpl = $.templates( $.fn.vrijLoon.tarieven[data.jaar].loonstaatTemplate );
                    
                    document.title = 'Vrij Loon - Loonstaat ' + data.jaar + '-' + ('00'+data.periode).slice(-2) + ' - ' + data.werknemer.nummer + ' ' + data.werknemer.naam;
                    body.html( tmpl.render(data) );
                }else if(tabId == 'loonstrook') {
                    var tmpl = $.templates('#tmpl-' + tabId);
                    
                    data['ibDitJaar'] = API.tarievenVoorJaar(data.jaar);
                    
                    var cumulatief = {}, value;
                    db.loonuitdraai({inkomstenverhoudingIndex:data.inkomstenverhouding.nummer+'|'+data.werkgever.nummer+'|'+data.werknemer.nummer},{jaar:data.jaar})
                        .each(function(row, rowInt) {
                        if(row.periode <= data.periode) {
                            for(var key in row) {
                                value = parseFloat(row[key]);
                                if(value) {
                                    if(!cumulatief[key]) cumulatief[key] = 0;
                                    cumulatief[key]+= value;
                                }
                            }
                        }
                    });
                    
                    data['cumulatief'] = {};
                    for(var key in cumulatief) {
                        data['cumulatief'][key] = cumulatief[key];
                    }
                    
                    var now = new Date();
                    data['vandaag'] = ('00'+now.getDate()).slice(-2) + '-' +
                                      ('00'+now.getMonth()).slice(-2) + '-' +
                                      now.getFullYear();

                    document.title = 'Vrij Loon - Loonstrook ' + data.jaar + '-' + ('00'+data.periode).slice(-2) + ' - ' + data.werknemer.nummer + ' ' + data.werknemer.naam;
                    body.html( tmpl.render(data) );
                } else {
                    
                }
            });
            
            this.initDashboard();
            
            setTimeout(function() {
                $('#splash').slideUp(400, function() {
                    $('body').removeClass('splash');
                });
            }, 250);
        },
        
        initDashboard: function() {
            var index,
                werknemerData = { datasets: [{ data: [], backgroundColor: colours } ], labels: [] },
                loonuitdraaiData;
            
            db.inkomstenverhouding().join(db.werkgever, ['werkgever', 'nummer']).each(function(row) {
                index = $.inArray(row.naam, werknemerData.labels);
                if(index === -1) {
                    werknemerData.labels.push(row.naam);
                    
                    index = $.inArray(row.naam, werknemerData.labels);
                    werknemerData.datasets[0].data[index] = 1;
                }else{
                    werknemerData.datasets[0].data[index]++;
                }
            });
            
            this.werknemersChart = new Chart($('#chart-werknemers canvas')[0].getContext('2d'), {
                type: 'doughnut',
                data: werknemerData,
                options: {
                    responsive: true,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        position: 'bottom',
                        text: 'Werknemers per werkgever',
                    }
                }
            });
            
            this.loonuitdraaiChart = new Chart($('#chart-salaris canvas')[0].getContext('2d'), {
                type: 'bar',
                data: this.createLoonuitdraaiDataset('salaris'),
                options: {
                    responsive: true,
                    legend: {
                        position: 'top',
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            }
                        }]
                    },
                    title: {
                        display: true,
                        position: 'bottom',
                        text: 'Salaris per maand',
                    }
                }
            });
            
            this.loonuitdraaiChart = new Chart($('#chart-aangifte canvas')[0].getContext('2d'), {
                type: 'bar',
                data: this.createLoonuitdraaiDataset(['kolom15', 'kolom16']),
                options: {
                    responsive: true,
                    legend: {
                        position: 'top',
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                            }
                        }]
                    },
                    title: {
                        display: true,
                        position: 'bottom',
                        text: 'Loonheffings aangifte per maand',
                    }
                }
            });
        },
        
        createLoonuitdraaiDataset: function(key) {
            var loonuitdraaiData = { datasets: [], labels: maanden },
                index, 
                periodeIndex, 
                datasets = [], 
                loonuitdraaiColours = colours.slice(0);
                
            db.loonuitdraai().each(function(row) {
                index = $.inArray(row.jaar, datasets);
                periodeIndex = $.inArray(maanden[(row.periode - 1)], loonuitdraaiData.labels);
                
                if(index === -1) {
                    datasets.push(row.jaar);
                    index = $.inArray(row.jaar, datasets);
                    
                    if(!loonuitdraaiData.datasets[index]) {
                        loonuitdraaiData.datasets[index] = { label: row.jaar, data: [], backgroundColor: loonuitdraaiColours.shift() };
                    }
                }
                
                if(!loonuitdraaiData.datasets[index].data[periodeIndex]) {
                    loonuitdraaiData.datasets[index].data[periodeIndex] = 0;
                }
                
                if(!(key instanceof Array)) {
                    key = [ key ];
                }
                
                for(var i = 0; i < key.length; i++) loonuitdraaiData.datasets[index].data[periodeIndex]+= row[ key[i] ];
            });
            
            return loonuitdraaiData;
        },
        
        notification: function(title, message, status, parent) {
            if(!parent) parent = API.container;
            var notification = $('.notification.alert', parent);
            
            var icon = (status == 'danger' ? 'ban' : (status == 'success' ? 'check' : status));
            
            if(!notification.length) {
                notification = $('<div/>').addClass('notification alert alert-dismissible' + (status ? ' alert-' + status : ''));
                notification.css('display', 'none');
                notification.html('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>');
                if(title) notification.title = $('<h4/>').appendTo(notification).append($('<i/>').addClass('icon fa fa-' + icon)).append($('<span/>').text(' '+title));
                if(message) notification.message = $('<p/>').html(message).appendTo(notification);
                parent.prepend(notification);
            } else {
                clearTimeout(notification.data('closeTimeout'));
                
                notification.removeClass('alert-danger alert-warning alert-success alert-info').addClass('alert-' + status);
                $('h4 i').removeClass('fa-ban fa-success fa-warning fa-info').addClass('fa-' + icon);
                if(title) $('h4 span', notification).text(title);
                if(message) $('p', notification).html(message);
                
            }
            notification.show('fast');
            return notification;
        },
        packDatabase: function() {
            var dbs = {};
            for(var dbname in db) {
                dbs[dbname] = db[dbname]().get();
            }
            return window.btoa(unescape(encodeURIComponent(JSON.stringify(dbs))));
        },
        unpackDatabase: function(dbs) {
            dbs = JSON.parse(decodeURIComponent(escape(window.atob(dbs))));
            
            if(dbs.werkgever && dbs.werknemer && dbs.inkomstenverhouding && dbs.loonuitdraai) {
                for(var dbname in dbs) {
                    db[dbname]().remove();
                    window.localStorage.setItem('taffy_vrij-loon.'+dbname, '');
                    
                    db[dbname] = TAFFY(dbs[dbname]);
                    db[dbname].store('vrij-loon.' + dbname);
                }
                return true;
            }else{
                return false;
            }
        },
        backup: function() {
            var zip = new JSZip(),
                now = new Date(),
                name = 'vrijloon-backup-'+now.getFullYear() + 
                                        ('00'+(now.getMonth()+1)).slice(-2) + 
                                        ('00'+now.getDate()).slice(-2) + 
                                        ('00'+now.getHours()).slice(-2) + 
                                        ('00'+now.getMinutes()).slice(-2) + 
                                        ('00'+now.getSeconds()).slice(-2);
                                        
            
            zip.file(name + '.backup', this.packDatabase() );
            zip.generateAsync({type:"blob"}).then(function(content) {
                // see FileSaver.js
                saveAs(content, name +'.zip');
            });
        },
        restore: function() {
            // Geef melding
        },
        restoreBestand: function(bestand) {
            JSZip.loadAsync(bestand).then(function(zip) {
                var foundFile = false;
                zip.forEach(function (relativePath, zipEntry) {
                    if(zipEntry.name.match(/^vrijloon-backup-/)) {
                        foundFile = true;
                        
                        zip.file(zipEntry.name).async("string")
                        .then(function success(data) {
                            if(!API.unpackDatabase(data)) {
                                API.notification('Backup restore mislukt!', 'Vermoedelijk bevat het bestand: '+zipEntry.name+' geen geldige VrijLoon databases', 'danger', API.container.find('.main'));
                            }else{
                                var notification = API.notification('Backup restored', 'van bestand: '+zipEntry.name, 'success', API.container.find('.main'));
                                setTimeout(function() {
                                    notification.hide('fast', function() {
                                        notification.remove();
                                    });
                                }, 3000)
                                
                                API.tekenMenu('werkgever');
                                API.tekenMenu('werknemer');
                                API.tekenMenu('inkomstenverhouding');
                                API.tekenMenu('loonuitdraai');
                                
                                API.initDashboard();
                            }
                        });
                    }
                });
                
                if(!foundFile) {
                    API.notification('Backup Restore warning', "Geen backup bestand gevonden in bestand: " + bestand.name, 'danger', API.container.find('.main'));
                }
            }, function (e) {
                API.notification('Backup Restore error', "Error reading " + bestand.name + " : " + e.message, 'danger', API.container.find('.main'));
            });
        },
        pagina: function(paginaId) {
            if(paginaId == 'dashboard') {
                // Redraw dashboard
                this.initDashboard();
            }
            if (paginaId != 'loonuitdraai') {
                document.title = 'Vrij Loon - ' + paginaId;
            }
            API.container.find('.main .page').hide('fast')
                .filter('[data-page="'+paginaId+'"]').show('fast');
        },
        print: function() {
            window.print();
        },
        nieuw: function(type) {
            var modal = API.container.find('.modal[data-for="' + type + '"]');
            
            if(modal.length) {
                var form = modal.find('form');
                form[0].reset();
                form.find('[name="id"]').val('');
                
                modal.find('.modal-title').text('Voeg een ' + type + ' toe');
                
                if(type == 'inkomstenverhouding') {
                    this.laadVanuitDatabase(modal, 'werkgever');
                    this.laadVanuitDatabase(modal, 'werknemer');
                    
                    this.laadCodes(gekozenJaar);
                }else if(type == 'maak-loonuitdraai') {
                    var now = new Date();
                    form.find('[name="maand"]').prop('checked', false).attr('checked', '').trigger('click')
                        .filter('[value="'+(now.getMonth() + 1)+'"]').prop('checked', true).attr('checked', 'checked').trigger('click');
                    
                    this.laadVanuitDatabase(modal, 'inkomstenverhouding');
                }
                modal.modal();
            }else{
                API.log('Unknown type received for adding record: ' + type);
            }
        },
        laadVanuitDatabase: function(modal, type) {
            var rows = {}, control;
        
            if(type == 'inkomstenverhouding') {
                var werkgever = {}, werknemer = {};
                db.werkgever().each(function(row, rowInt) {
                    werkgever[row.nummer] = row;
                });
                db.werknemer().each(function(row) {
                    werknemer[row.nummer] = row;
                });
            }
            
            var verbergKeyInWaarde = false;
            db[type]().order((type == 'werkgever' ? 'naam' : 'nummer')).each(function(row, rowInt) {
                if(type == 'werkgever') {
                    rows[row.nummer] = row.naam;
                }else if(type == 'werknemer') {
                    rows[row.nummer] = row.voorletters + ' ' + row.naam;
                }else if(type == 'inkomstenverhouding') {
                    verbergKeyInWaarde = true;
                    
                    rows[row.nummer+'|'+werkgever[row.werkgever].nummer+'|'+werknemer[row.werknemer].nummer] = row.nummer + ' '
                            + werkgever[row.werkgever].naam + ' - '
                            + werknemer[row.werknemer].voorletters + ' ' + werknemer[row.werknemer].naam;
                }
            });
            
            this.laadDropdown(modal.find('select[name="'+type+'"]'), rows, verbergKeyInWaarde);
        },
        
        laadCodes: function(jaar) {
            var jaarTarieven = this.tarievenVoorJaar(jaar),
                control;
            
            for(var key in jaarTarieven.codes) {
                control = API.container.find('[name="' + key + '"]');
                
                if(!control.length) {
                    API.log('Geen control gevonden voor code: ' + key);
                }else{
                    this.laadDropdown(control, jaarTarieven.codes[key]);
                }
            }
        },
        laadDropdown: function(control, object, verbergKeyInWaarde) {
            var required = control.prop('required'),
                defaultValue = control.data('default-value'),
                value = control.val(),
                option;
            
            control.find('option').remove();
            if(!required) control.append($('<option/>').attr('value', '').text('Geen'));
            for(var key in object) {
                option = $('<option/>').attr('value', key).text((!verbergKeyInWaarde ? key+' - ' : '') + object[key]);
                
                if((defaultValue && !value && defaultValue == key) || (value && value == key)) option.attr('selected','selected');
                
                control.append(option);
            }
        },
        

        tariefBerekening: function(bedrag, tarief) {
            return bereken(bedrag, tarief);
        },
        tariefBerekeningAfhankelijk: function(bedrag, tarieven) {
            var tarief, vorigeBovenGrens = 0;
            
            for(var i = 0; i < tarieven.length; i++) {
                tarief = tarieven[i];
                
                if(bedrag > vorigeBovenGrens && bedrag <= tarief.bovenGrens) {
                    return bereken(bedrag, tarief);
                }
                
                vorigeBovenGrens = tarief.bovenGrens;
            }
            
            return false;
        },
        tariefBerekeningCumulatief: function(bedrag, tarieven) {
            var tarief, 
                vorigeBovenGrens = 0,
                berekendTarief = 0;
            
            for(var i = 0; i < tarieven.length; i++) {
                tarief = tarieven[i];
                
                berekendTarief+= Math.ceil(bereken(Math.min(bedrag, tarief.bovenGrens) - vorigeBovenGrens, tarief));
                vorigeBovenGrens = tarief.bovenGrens;
                
                if( bedrag <= vorigeBovenGrens ) break;
            }
            
            return berekendTarief;
        },
        heeftTarievenVoorJaar: function(jaar) {
            return !$.isEmptyObject($.fn.vrijLoon.tarieven[jaar]);
        },
        tarievenVoorJaar: function(jaar) {
            if(this.heeftTarievenVoorJaar(jaar)) {
                return $.fn.vrijLoon.tarieven[jaar];
            }
        },

        tekenMenu: function(type) {
            var dbtype = db[type];
            if(dbtype().count()) {
                var ul = API.container.find('ul.' + type);
                
                if(type == 'loonuitdraai') {
                    ul.empty();
                
                    var menu = dbtype().order('jaar desc, periode desc').distinct('jaar', 'periode');
                    
                    var oldYear, 
                        label,
                        modal = API.container.find('.modal[data-for="' + type + '"]');
                    for(var i = 0; i < menu.length; i++) {
                        if(!oldYear || oldYear != menu[i][0]) {
                            ul.append($('<li/>').addClass('header').text(menu[i][0]));
                            
                            oldYear = menu[i][0];
                        }
                        ul.append($('<li/>').append( $('<span/>').text(maanden[(menu[i][1] - 1)]) ));
                        
                        dbtype({jaar: menu[i][0]}, {periode: menu[i][1]}).order('inkomstenverhoudingIndex asc').each(function(row, rowInt) {
                            label = row.werkgever.code + ' - ';
                            label+= row.inkomstenverhouding.nummer + ' ';
                            label+= row.werknemer.voorletters + ' ' +row.werknemer.naam;
                            
                            ul.append($('<li/>').append( $('<a/>').attr('href', '#').text(label).on('click', function() {
                                var page = API.container.find('.page[data-page="loonuitdraai"]');
                                
                                // Hang data aan pagina
                                page.data('loonuitdraai', row);
                                
                                // Vernieuw informatie op pagina
                                page.find('.nav-tabs .active a').trigger('shown.bs.tab');
                                
                                // Zet pagina ook al is die actief, zien we dat er iets veranderd
                                API.pagina('loonuitdraai');
                                
                                return false;
                            })));
                        });
                    }
                }else{
                    var foundSeparator = false;
                    ul.find('li').each(function() {
                        if($(this).hasClass('divider')) {
                            foundSeparator = true;
                        }else if(foundSeparator) {
                            $(this).remove();
                        }
                    });
                    
                    if(type == 'inkomstenverhouding') {
                        var werkgever = {}, werknemer = {};
                        db.werkgever().each(function(row, rowInt) {
                            werkgever[row.nummer] = row;
                        });
                        db.werknemer().each(function(row) {
                            werknemer[row.nummer] = row;
                        });
                    }
                    
                    var label, 
                        formTitle,
                        modal = API.container.find('.modal[data-for="' + type + '"]');
                    
                    dbtype().order((type == 'werkgever' ? 'naam' : 'nummer')).each(function(row, rowInt) {
                        if(type == 'werkgever') {
                            label = row.naam + ' ('+row.nummer+')';
                            formTitle = 'Bewerk deze ' + type;
                        }else if(type == 'werknemer') {
                            label = row.nummer+' ' + row.voorletters + ' ' + row.naam;
                            formTitle = 'Bewerk werknemer #' + row.nummer;
                        }else if(type == 'inkomstenverhouding') {
                            label = ""
                            
                            if(werkgever[row.werkgever]) label+= werkgever[row.werkgever].code + ' - ';
                            else    API.log('Onbekende werkgever "'+row.werkgever+'", vermoedelijk is het loonheffingsnummer aangepast');
                                
                            label+= row.nummer + ' ';
                            
                            if(werknemer[row.werknemer]) label+= werknemer[row.werknemer].voorletters + ' ' + werknemer[row.werknemer].naam;
                            else    API.log('Onbekende werkenemr "'+row.werkgever+'", vermoedelijk is het werknemersnummer aangepast');
                                
                            formTitle = 'Bewerk inkomstenverhouding #' + row.nummer;
                        }else if(type == 'loonuitdraai') {
                            label = row.jaar;
                        }
                        
                        ul.append($('<li/>').append($('<a/>').attr('href', '#').text(label).on('click', function() {
                            if(type == 'inkomstenverhouding') {
                                API.laadVanuitDatabase(modal, 'werkgever');
                                API.laadVanuitDatabase(modal, 'werknemer');
                                
                                API.laadCodes(gekozenJaar);
                            }else if(type == 'loonuitdraai') {
                                API.laadVanuitDatabase(modal, 'inkomstenverhouding');
                            }
                            
                            modal.find('.modal-title').text(formTitle);
                            
                            modal.find('form [name]').each(function() {
                                var el = $(this),
                                    name = el.attr('name');
                                
                                if(name == 'id') {
                                    el.val(row.___id);
                                }else if(row[name] !== 'undefined') {
                                    if(el.attr('type') == 'radio') {
                                        el.prop('checked', el.val() == row[name]);//.attr('checked', el.val() == row[name] ? 'checked' : '');
                                    }else if(el.attr('type') == 'checkbox') {
                                        el.prop('checked', el.val() == row[name]);//.attr('checked', el.val() == row[name] ? 'checked' : '');
                                    }else{
                                        el.val(row[el.attr('name')]);
                                    }
                                }else{
                                    API.log('Could not find value for named form element: ' + name);
                                }
                            });
                            
                            modal.modal();
                            
                            return false;
                        })));
                    });
                }
            }
        },
        log: function() {
            /*global console:true */
            if (window.console && console.log)
                console.log('[vrij-loon] ' + Array.prototype.join.call(arguments, ' ') );
        }
    };
    
    $(document).ready(function() {
        $('.vrij-loon').vrijLoon();
    });
}(jQuery));
