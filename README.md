# Vrij Loon

*   [Wat is Vrij Loon?](#wat)
*   [Hoe werkt dit, wat moet ik doen?](#hoe)
*   [Waar worden mijn gegevens opslagen?](#database)
*   [Hoe veilig zijn de opgeslagen gegevens?](#veilig)
*   [Hoe maak ik een backup?](#backup)
*   [Wat is mijn loonheffingsnummer?](#loonnummer)
*   [Wat is een inkomstenverhouding?](#inkverh)
*   [Hoe doe ik aangifte bij de belastingdienst?](#aangifte)
*   [Nog te doen](#todo)
*   [Licentie](#license)

<a name="wat"></a>

### Wat is Vrij Loon?

Vrij Loon is een open programma dat door iedereen vrij gebruikt kan worden om loonstaten en loonstroken te maken die je moet bijhouden als je een eigen loonadministratie beheert. Alhoewel het project begon als een test om nieuwe technieken uit te proberen, is het wel de bedoeling dat Vrij Loon een correct (maar vooralsnog beperkt) alternatief bied voor betaalde diensten.

Vooralsnog wordt eigenlijk alleen een DGA loon zonder werknemersverzekeringen, zonder aftrekposten en zonder bijtelling ondersteund. Hulp bij het implementeren van missende berekeningen wordt zeer op prijsgesteld.



<a name="hoe"></a>

### Hoe werkt Vrij Loon, wat moet ik doen?

Download het `vrij-loon.single.html` bestand uit de dist folder of van de laatste release en bewaar het op uw computer. Dubbelklik vervolgens op dit html bestand om Vrij Loon te starten

Volg de volgende stappen:
- Stap 1: Voeg een werkgever toe
- Stap 2: Voeg een werknemer toe <small>_Let wel, werknemers zijn niet uniek per werkgever maar uniek binnen de app_</small>
- Stap 3: Voeg een inkomstenverhouding toe <small>_Dit is meestal gelijk aan een arbeidsovereenkomst_</small>
- Stap 4: Maak een loonuitdraai!

Voor een volledige uitleg van de invoervelden bij de inkomstenverhouding verwijzen wij u naar het [Handboek Loonheffingen](https://www.belastingdienst.nl/bibliotheek/handboeken/html/boeken/HL/stappenplan.html) van de belastingdienst.



<a name="database"></a>

### Waar worden mijn gegevens opslagen?

Deze app functioneert als een op zichzelf staande html pagina, er worden dan ook geen enkele gegevens verstuurd of opgeslagen anders dan op uw eigen computer.



<a name="veilig"></a>

### Hoe veilig zijn de opgeslagen gegevens?

Op dit moment worden de gegevens als platte tekst opgeslagen in de localStorage van uw browser. Het sandbox beveiligings model van uw browser zorgt ervoor dat deze gegevens niet door derde partijen (bv andere websites) kunnen worden ingezien. Zelf kunt u de opgeslagen gegevens in de meeste browsers inzien via de Developers Toolbox. Raadpleeg hiervoor de Help van uw browser.

<div class="alert alert-warning" role="alert">**Let op!**
De gegevens in de localStorage worden (meestal) verwijderd als u de 'Tijdelijke Internetbestanden' leegt. Het wordt dus ten zeerste aangeraden om aan het eind van elke sessie een backup te maken van de gegevens.



<a name="backup"></a>

### Hoe maak ik een backup?

Om een backup te maken klikt u in de bovenste menu balk op ' Backup', vervolgens op 'Download Database'. Er wordt automatisch een zip bestand met daarin de gehele database gedownload.

Om een database terug te zetten klikt u weer op ' Backup' en vervolgens klikt u op 'Kies Bestand' onder 'Restore Database'. In de popup die verschijnt selecteert u een eerder gedownload zip bestand met daarin de backup van de database. De backup wordt na selectie direct teruggezet.

<div class="alert alert-warning" role="alert">**Let op!**
Het wordt ten zeerste aangeraden om aan het eind van elke sessie een backup te maken van de gegevens. Zie ook [Hoe veilig zijn de opgeslagen gegevens?](#veilig).



<a name="loonnummer"></a>

### Wat is mijn loonheffingsnummer?

Als u loon gaat uitbetalen moet u zich aanmelden bij de belastingdienst als werkgever. Dit kunt u met behulp van dit formulier doen: [Melding Loonheffingen Aanmelding Werkgever](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/themaoverstijgend/programmas_en_formulieren/melding_loonheffingen_aanmelding_werkgever)

Het is ook aan te raden om het Handboek Loonheffingen door te nemen, zie hier voor het [stappenplan](https://www.belastingdienst.nl/bibliotheek/handboeken/html/boeken/HL/stappenplan.html). Met name Stap 3 is belangrijk aandachtig door te nemen.



<a name="inkverh"></a>

### Wat is een inkomstenverhouding?

Simpel gezegd, een inkomstenverhouding is meestal gelijk aan de dienstbetrekking. De combinatie van loonheffingsnummer, burger service nummer van de werknemer en het nummer inkomstenverhouding moet uniek zijn. U kunt dus meerdere inkomstenverhoudingen met een werknemer hebben.

Voor meer informatie zie het Handboek Loonheffingen [Stap 3.4](https://www.belastingdienst.nl/bibliotheek/handboeken/html/boeken/HL/stappenplan-stap_3_loonadministratie_aanleggen.html#HL-03.4)



<a name="aangifte"></a>

### Hoe doe ik aangifte bij de belastingdienst?

U kunt gebruik maken van het Aangifte programma loonheffingen van de belastingdienst. Dit programma kunt u downloaden op www.belastingdienst.nl nadat u bent ingelogd op 'Inloggen voor ondernemers'.

Voor meer informatie zie het Handboek Loonheffingen [Stap 11.2.1](https://www.belastingdienst.nl/bibliotheek/handboeken/html/boeken/HL/stappenplan-stap_11_loonheffingen_aangeven_en_betalen.html#HL-d108e303)



<a name="todo"></a>

### Nog te doen

De volgende punten staan nog op onze verlanglijst om te implementeren, suggesties en/of hulp hierbij zijn welkom!

☐ Unit tests
☐ Mogelijkheid toevoegen om bedragen op een loonuitdraai aan te passen (bv eenmalige uitbetaling toevoegen)
☐ Kilometervergoeding aanpassen, rekening houdend met de onbelaste grondslag
☐ Bijtelling van leaseauto toevoegen
☐ Aftrekposten toevoegen
☐ Berekeningen voor werknemersverzekeringen toevoegen?
☐ Encrypt de backups
☐ Encrypt de database
☐ Mogelijkheid toevoegen om (encrypted) database op te slaan in een remote object store
☐ Automatische versie check toevoegen
☐ Automatisch aangite doen via Digipoort, zie oa stap 11.2.1 in het handboek loonheffingen



<a name="license"></a>

### Licentie

Door gebruik te maken van deze tool gaat u akkoord met de licentie

VrijLoon
Copyright (C) 2017 Pndtech BV

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.

