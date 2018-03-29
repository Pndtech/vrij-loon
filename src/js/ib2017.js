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
    var tarief;
        
    // Handboek Loonheffingen 2016
    // https://www.belastingdienst.nl/bibliotheek/handboeken/html/boeken/HL/index.html
    
    $.fn.vrijLoon.tarieven['2017'] = tarief = $.extend( {}, $.fn.vrijLoon.basisTarief, {
        kalenderJaar: 2017,
        aowLeeftijd: [65, 9],
        // Alle (zeker) niet ondersteunde codes staan uitgecommentarieerd
        codes: {
            // https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/themaoverstijgend/brochures_en_publicaties/codes-voor-de-aangifte-loonheffingen-2017
            codeLoon: {
                //11: 'Loon of salaris ambtenaren in de zin van de Ambtenarenwet 1929',
                13: 'Loon of salaris directeuren van een nv of bv, wel verzekerd voor de werknemersverzekeringen',
                15: 'Loon of salaris niet onder te brengen onder 11, 13 of 17',
                17: 'Loon of salaris directeuren-grootaandeelhouders van een nv of bv, niet verzekerd voor de werknemersverzekeringen',
                //18: 'Wachtgeld van een overheidsinstelling',
                //22: 'Uitkering in het kader van de Algemene ouderdomswet (AOW)',
                //23: 'Oorlogs- en verzetspensioenen',
                //24: 'Uitkering in het kader van de Algemene nabestaandenwet (Anw)',
                //31: 'Uitkering in het kader van de Ziektewet (ZW) en vrijwillige verzekering Ziektewet',
                //32: 'Uitkering in het kader van de Wet op de arbeidsongeschiktheidsverzekering (WAO) en particuliere verzekering ziekte, invaliditeit en ongeval',
                //33: 'Uitkering in het kader van de Nieuwe Werkloosheidswet (nWW)',
                //34: 'Uitkering in het kader van de Wet inkomensvoorziening oudere en gedeeltelijk arbeidsongeschikte werkloze werknemers (IOAW)',
                //35: 'Vervolguitkering in het kader van de Nieuwe Werkloosheidswet (nWW)',
                //36: 'Uitkering in het kader van de Wet arbeidsongeschiktheidsverzekering zelfstandigen (Waz)',
                //37: 'Wet werk en arbeidsongeschiktheidsvoorziening jonggehandicapten (Wet Wajong)',
                //38: 'Samenloop (gelijktijdig of volgtijdelijk) van uitkeringen van Wet Wajong met Waz, WAO/IVA of WGA',
                //39: 'Uitkering in het kader van de Regeling inkomensvoorziening volledig arbeidsongeschikten (IVA)',
                //40: 'Uitkering in het kader van de Regeling werkhervatting gedeeltelijk arbeidsgeschikten (WGA)',
                //42: 'Uitkering in het kader van het bijstandsbesluit Zelfstandigen (Bbz)',
                //43: 'Uitkering in het kader van de Participatiewet (voorheen Wwb)',
                //45: 'Uitkering in het kader van de Wet inkomensvoorziening oudere en gedeeltelijk arbeidsongeschikte gewezen zelfstandigen (IOAZ)',
                //46: 'Uitkering uit hoofde van de Toeslagenwet',
                //50: 'Uitkeringen in het kader van overige socialeverzekeringswetten; hieronder vallen ook de Ongevallenwet 1921, de Land- en tuinbouwongevallenwet 1922 en de Zeeongevallenwet 1919 (niet 22, 24 tot en met 45 of 52)',
                //52: 'Uitkering in het kader van de Wet inkomensvoorziening oudere werklozen (IOW)',
                //54: 'Opname levenslooptegoed door een werknemer die op 1 januari 61 jaar of ouder is',
                //55: 'Uitkering in het kader van de Algemene Pensioenwet Politieke Ambtsdragers (APPA)',
                //56: 'Ouderdomspensioen dat via de werkgever is opgebouwd',
                //57: 'Nabestaandenpensioen dat via de werkgever is opgebouwd',
                //58: 'Arbeidsongeschiktheidspensioen dat via de werkgever is opgebouwd',
                //59: 'Lijfrenten die zijn afgesloten in het kader van een individuele of collectieve arbeidsovereenkomst',
                //60: 'Lijfrenten die niet zijn afgesloten in het kader van een individuele of collectieve arbeidsovereenkomst',
                //61: 'Aanvulling van de werkgever aan een werknemer op een uitkering werknemersverzekeringen, terwijl de dienstbetrekking is beëindigd',
                //62: 'Ontslagvergoeding/transitievergoeding',
                //63: 'Overige, niet hiervoor aangegeven, pensioenen of samenloop van meerdere pensioenen/lijfrenten (al dan niet hiervoor aangegeven) of een betaling op grond van een afspraak na einde dienstbetrekking',
            },
            codeZvw: {
                A: 'Niet verzekeringsplichtig omdat persoon ook niet verzekerd is voor de Wlz',
                B: 'Niet verzekeringsplichtig omdat persoon ook militair ambtenaar is in werkelijke dienst of met buitengewoon verlof',
                G: 'Niet verzekeringsplichtig omdat persoon buitenlands artiest of buitenlands beroepssporter is waarbij code loonbelastingtabel 221, 224 of 225 is toegepast',
                H: 'Wel verzekeringsplichtig, geen tarief toegepast omdat persoon binnenlands artiest is waarbij code loonbelastingtabel 220 is toegepast',
                I: 'Niet verzekeringsplichtig omdat persoon niet verzekerd is voor de Wlz; maar wel pseudobijdrage verschuldigd is, omdat in het woonland recht bestaat op zorg ten laste van Nederland (artikel 69 Zvw).',
                K: 'Wel verzekeringsplichtig, normaal tarief werkgeversheffing',
                L: 'Wel verzekeringsplichtig, 0%-tarief werkgeversheffing (zeelieden)',
                M: 'Wel verzekeringsplichtig, ingehouden bijdrage',
                N: 'Wel verzekeringsplichtig, meer tarieven werkgeversheffing (K en L)',
            },
            codeIvp: {
                A: 'Echtgenoot of familie van de eigenaar of van de DGA',
                B: 'Vorige eigenaar',
                D: 'Oproep-/invalkracht zonder verplichting om te komen',
                E: 'Oproep-/invalkracht met verplichting om te komen',
            },
            tabelSoort: {
                0: 'Tabel zonder herleidingsregels, werknemer is zowel belasting- als premieplichtig',
                3: 'Werknemer alleen premieplichtig voor de volksverzekeringen (AOW/Anw/Wlz)',
                5: 'Werknemer alleen belastingplichtig',
                6: 'Werknemer belastingplichtig en niet premieplichtig voor de Wlz',
                7: 'Werknemer belastingplichtig en alleen premieplichtig voor de Wlz',
            },
            tabelKleur: {
                1: 'Wit',
                2: 'Groen',
            },
            tijdvakSoort: {
                //1: 'Loon per kwartaal',
                2: 'Loon per maand',
                //3: 'Loon per week',
                //4: 'Loon per 4 weken',
                //5: 'Loon per dag',
                //0: 'Uitsluitend tabel voor bijzondere beloningen toegepast',
            },
        },
        // https://www.rijksoverheid.nl/onderwerpen/minimumloon/inhoud/bedragen-minimumloon-2017
        minimum: { 
            20170701: {
                23: { dag: 72.25, week: 361.25, maand: 1565.40 },
            },
            20170101: {
                23: { dag: 71.61, week: 358.05, maand: 1551.60 },
            }
        },
        // https://www.belastingdienst.nl/bibliotheek/handboeken/html/boeken/HL/thema_s-vervoer_en_reiskosten.html
        onbelasteKmVergoeding: 0.19,
        // https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/boxen_en_tarieven/overzicht_tarieven_en_schijven/
        box1: {
            niet: [
                { naam: 'Schijf 1', bovenGrens: 19981, percentage: 36.55 },
                { naam: 'Schijf 2', bovenGrens: 33790, percentage: 40.8 },
                { naam: 'Schijf 3', bovenGrens: 67071, percentage: 40.8 },
                { naam: 'Schijf 4', percentage: 52 },
            ],
            in: [], // TODO?
            voor: [
                { naam: 'Schijf 1', bovenGrens: 19981, percentage: 18.65 },
                { naam: 'Schijf 2', bovenGrens: 33790, percentage: 22.9 },
                { naam: 'Schijf 3', bovenGrens: 67071, percentage: 40.8 },
                { naam: 'Schijf 4', percentage: 52 },
            ],
        },
        // https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/bijdrage_zorgverzekeringswet/hoe_wordt_de_inkomensafhankelijke_bijdrage_zvw_betaald/tabel_werkgeversheffing_zvw_of_bijdrage_zvw/tabel_werkgeversheffing_zvw_of_bijdrage_zvw
        premieZvw: {
            maxBijdrageInkomen: 52763,
            eigenBijdrage: {
                percentage: 5.4,
                minimum: 45,
            },
            werkgeversHeffing: {
                percentage: 6.65,
                minimum: 45,
            },
        },
        /* / https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/sociale_verzekeringen/premies_volks_en_werknemersverzekeringen/volksverzekeringen/hoeveel_moet_u_betalen
        volksVerzekeringen: {
            bovenGrens: 33791,
            maximum: 9343,
            premieAow: {
                percentage: 17.90,
            },
            premieAnw: {
                percentage: 0.10,
            },
            premieWlz: {
                percentage: 9.65,
            },
        },/**/
        // https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/sociale_verzekeringen/premies_volks_en_werknemersverzekeringen/werknemersverzekeringen/
        // https://www.belastingdienst.nl/bibliotheek/handboeken/html/boeken/HL/stappenplan-stap_5_premies_werknemersverzekeringen_berekenen.html
        werknemersVerzekeringen: null,
        // https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/
        heffingsKorting: {
            niet: [
                { bovenGrens: 19982, bedrag: 2254 },
                { bovenGrens: 67068, bedrag: function(inkomen) { return tarief.heffingsKorting.niet[0].bedrag - 0.04787 * (inkomen - tarief.heffingsKorting.niet[0].bovenGrens); } },
                { bedrag: 0 },
            ],
            in: false,
            voor: [
                { bovenGrens: 19982, bedrag: 1151 },
                { bovenGrens: 67068, bedrag: function(inkomen) { return tarief.heffingsKorting.voor[0].bedrag - 0.02443 * (inkomen - tarief.heffingsKorting.voor[0].bovenGrens); } },
                { bedrag: 0 },
            ],
        },
        
        arbeidsKorting: {
            niet: [
                { bovenGrens: 9309, percentage: 1.772 },
                { bovenGrens: 20108, bedrag: function(inkomen) { return 165 + 0.28317 * (inkomen - tarief.heffingsKorting.niet[0].bovenGrens); } },
                { bovenGrens: 32444, bedrag: 3223 },
                { bovenGrens: 121972, bedrag: function(inkomen) { return tarief.heffingsKorting.niet[2].bedrag - 0.036 * (inkomen - tarief.heffingsKorting.niet[2].bovenGrens); } },
                { bedrag: 0 },
            ],
            in: false,
            voor: [
                { bovenGrens: 9309, percentage: 0.904 },
                { bovenGrens: 20108, bedrag: function(inkomen) { return 86 + 0.14449 * (inkomen - tarief.heffingsKorting.voor[0].bovenGrens); } },
                { bovenGrens: 32444, bedrag: 1645 },
                { bovenGrens: 121972, bedrag: function(inkomen) { return tarief.heffingsKorting.voor[2].bedrag - 0.01837 * (inkomen - tarief.heffingsKorting.voor[2].bovenGrens); } },
                { bedrag: 0 },
            ],
        },
        
        // Would have preferred string literals, but IE doesnt get that (Edge does)
        loonstaatTemplate: (function () {
            var i= 1;
            /* @preserve 
            <h1>Loonstaat 2017 <small>periode {{:periode}}, werknemer {{: werknemer.nummer }} / {{: inkomstenverhouding.nummer}}</small></h1>
            <p>Kalenderjaar: {{:jaar}}</p>
            
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-6">
                    <h3>Werknemer</h3>
                    
                    <div class="row">
                        <div class="col-xs-7">Naam en voorletters:</div>
                        <div class="col-xs-5">{{: werknemer.voorletters }} {{: werknemer.naam }}</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-7">Burgerservicenummer (BSN):</div>
                        <div class="col-xs-5">{{: werknemer.bsn }}</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-7">Adres:</div>
                        <div class="col-xs-5">{{: werknemer.straat }} {{: werknemer.huisnummer }} {{: werknemer.toevoeging }}</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-7">Postcode:</div>
                        <div class="col-xs-5">{{: werknemer.postcode }}</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-7">Woonplaats:</div>
                        <div class="col-xs-5">{{: werknemer.plaats }}</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-7">Land:</div>
                        <div class="col-xs-5">{{: werknemer.land }}</div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <h3>Inhoudingsplichtige/werkgever</h3>
                    
                    <div class="row">
                        <div class="col-xs-6">Naam:</div>
                        <div class="col-xs-6">{{: werkgever.naam }}</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-6">Adres:</div>
                        <div class="col-xs-6">{{: werkgever.adres }}</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-6">Postcode:</div>
                        <div class="col-xs-6">{{: werkgever.postcode }}</div>
                    </div>
                    <div class="row">
                        <div class="col-xs-6">Woonplaats:</div>
                        <div class="col-xs-6">{{: werkgever.plaats }}</div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-7">Geboortedatum:</div>
                        <div class="col-xs-5">{{: werknemer.geboorteDatum }}</div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-6">Loonheffingennummer</div>
                        <div class="col-xs-6">{{: werkgever.nummer }}</div>
                    </div>
                </div>
            </div>
            
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-12">
                    <h3>Gegevens voor de tabeltoepassing</h3>
                </div>
            </div>
            
            <div class="row">
                <div class="col-xs-4">
                    Loonheffingskorting
                </div>
                <div class="col-xs-8">
                    {{if inkomstenverhouding.loonheffingsKorting }}Ja{{else}}Nee{{/if}}
                </div>
            </div>
            <br/>
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Loontijdvak<br/>
                            <small>kolom 1</small>
                        </div>
                        <div class="col-xs-4">
                            {{: kolom1 }}
                        </div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Loon voor de Zorgverzekeringswet<br/>
                            <small>kolom 12</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom12 /}}
                        </div>
                    </div>
                </div>
            </div>
            
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Nummer inkomstenverhouding<br/>
                            <small>kolom 2</small>
                        </div>
                        <div class="col-xs-4">
                            {{: kolom2 }}
                        </div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Loon voor de loonbelasting/ volksverzekeringen<br/>
                            <small>kolom 14</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom14 /}}
                        </div>
                    </div>
                </div>
            </div>
            
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Loon in geld<br/>
                            <small>kolom 3</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom3 /}}
                        </div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Ingehouden loonbelasting/ premie volksverzekeringen<br/>
                            <small>kolom 15</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom15 /}}
                        </div>
                    </div>
                </div>
            </div>
            
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Loon anders dan in geld<br/>
                            <small>kolom 4</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom4 /}}
                        </div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Ingehouden bijdrage Zvw<br/>
                            <small>kolom 16</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom16 /}}
                        </div>
                    </div>
                </div>
            </div>
            
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Fooien en uitkeringen uit fondsen<br/>
                            <small>kolom 5</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom5 /}}
                        </div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Uitbetaald bedrag (kolom 3-7-15-16)<br/>
                            <small>kolom 17</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom17 /}}
                        </div>
                    </div>
                </div>
            </div>
            
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Aftrekposten voor alle heffingen<br/>
                            <small>kolom 7</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom7 /}}
                        </div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Verrekende arbeidskorting<br/>
                            <small>kolom 18</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom18 /}}
                        </div>
                    </div>
                </div>
            </div>
            
            <hr class="divider">
            
            <div class="row">
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Loon voor de werknemersverzekeringen<br/>
                            <small>kolom 8</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom8 /}}
                        </div>
                    </div>
                </div>
                <div class="col-xs-6">
                    <div class="row">
                        <div class="col-xs-8">
                            Levensloop verlofkorting<br/>
                            <small>kolom 19</small>
                        </div>
                        <div class="col-xs-4">
                            {{nf kolom19 /}}
                        </div>
                    </div>
                </div>
            </div>*/ return i; }).toString().match(/[^]*\/\*\s(@preserve)?([^]*)\*\/[^]*\}$/)[2],
    });
    
})(jQuery);