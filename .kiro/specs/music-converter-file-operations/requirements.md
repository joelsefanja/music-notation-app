# Requirements Document

## Introduction

Uitbreiding van de bestaande Music Notation Converter Next.js PWA met bestandsoperaties en GUI-functionaliteiten. De applicatie heeft al een solide basis met format detection, chord parsing, key transposition en auto-key detection. Deze spec voegt bestandsimport/export en een complete gebruikersinterface toe.

## Requirements

### Requirement 1

**User Story:** Als muzikant wil ik bestanden kunnen importeren en exporteren in de web applicatie, zodat ik mijn chord sheets kan opslaan en delen zonder handmatig kopiëren en plakken.

#### Acceptance Criteria

1. WHEN een gebruiker op "Bestand importeren" klikt THEN het systeem SHALL een bestandsdialoog tonen voor het selecteren van tekstbestanden (.txt, .pro, .chopro)
2. WHEN een gebruiker een bestand selecteert THEN het systeem SHALL het bestand inladen en automatisch het formaat detecteren met de bestaande FormatDetector
3. WHEN het bestand geladen is THEN het systeem SHALL de inhoud tonen in de input editor en het gedetecteerde formaat weergeven
4. WHEN een gebruiker op "Exporteren" klikt THEN het systeem SHALL een download starten van het geconverteerde bestand
5. WHEN het systeem exporteert THEN het systeem SHALL de juiste bestandsextensie gebruiken (.txt voor alle formaten, .pro voor ChordPro)
6. WHEN het systeem exporteert THEN het systeem SHALL metadata gebruiken voor de bestandsnaam (titel-artiest.extensie)
7. WHEN er geen metadata beschikbaar is THEN het systeem SHALL een standaard bestandsnaam gebruiken (chord-sheet-YYYY-MM-DD.txt)

### Requirement 2

**User Story:** Als muzikant wil ik een complete gebruikersinterface hebben met real-time preview en controles, zodat ik efficiënt chord sheets kan converteren en bewerken.

#### Acceptance Criteria

1. WHEN de applicatie laadt THEN het systeem SHALL een split-screen interface tonen met input editor links en output preview rechts
2. WHEN een gebruiker tekst intypt of plakt THEN het systeem SHALL real-time format detection uitvoeren en het resultaat tonen
3. WHEN het formaat gedetecteerd is THEN het systeem SHALL automatisch key detection uitvoeren met de bestaande AutoKeyDetection service
4. WHEN een gebruiker een doelformaat selecteert THEN het systeem SHALL real-time conversie uitvoeren en het resultaat tonen in de preview
5. WHEN een gebruiker een andere key selecteert THEN het systeem SHALL transposition uitvoeren met de bestaande KeyTransposer
6. WHEN de conversie compleet is THEN het systeem SHALL een "Kopieer naar klembord" knop tonen
7. WHEN er conversie-fouten optreden THEN het systeem SHALL duidelijke foutmeldingen tonen met suggesties voor oplossing
8. WHEN de applicatie gebruikt wordt THEN het systeem SHALL een monospace font gebruiken voor juiste chord alignment