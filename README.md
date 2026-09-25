# ✨ BGRemove — AI Achtergrond Verwijderaar voor `bgremove.schoolnaam.nl`

> **100% Client-side AI Background Removal** • **Privacy & AVG/GDPR Conform** • **Gehost op Cloudflare Pages**

Een moderne, razendsnelle webtool waarmee leerlingen, docenten en medewerkers met één klik automatisch de achtergrond van afbeeldingen kunnen verwijderen.

---

## 🔒 Waarom 100% Client-side AI & AVG-proof?

Voor scholen en onderwijsinstellingen is privacy van cruciaal belang. In tegenstelling tot online tools zoals *remove.bg* of *photoroom* worden er bij deze tool **geen foto's naar externe servers of clouddiensten gestuurd**.
- Alle berekeningen gebeuren **100% lokaal in de webbrowser van de bezoeker** via **WebAssembly / WebGPU**.
- Volledig in overeenstemming met de **AVG (Algemene Verordening Gegevensbescherming) / GDPR**.
- Geen datalekken, geen serverkosten en geen limieten op het aantal verwerkte afbeeldingen.

---

## 🚀 Belangrijkste Functies

- ✂️ **State-of-the-Art AI Uitsnijding**: Haarscherpe detectie van personen, schoolportretten, objecten en dieren.
- 📦 **Batchverwerking**: Upload tientallen foto's tegelijk en download alle uitsnedes met 1 klik als **ZIP** (`bgremove-schoolnaam-fotos.zip`).
- ↔️ **Interactieve Vergelijker**:
  - Schuifbalk (Before & After split view).
  - Alleen uitsnede weergave op dambordpatroon.
  - Naast elkaar (Side-by-side).
- 🎨 **Achtergrond Aanpassen**:
  - Transparant (PNG).
  - Effen kleur (presets voor schoolkleuren + HEX kleurkiezer).
  - Moderne kleurverlopen (gradients).
  - Vervaagde achtergrond (**DSLR Portret Bokeh** met instelbare vervaging).
  - Eigen achtergrondfoto uploaden.
- 🖌️ **Handmatig Bijwerken (Retouch Tool)**:
  - **Gum (Erase)**: Verwijder achtergebleven achtergronddetails.
  - **Penseel (Restore)**: Herstel per ongeluk weggehaalde delen direct vanaf het origineel (bijv. fijne haarlokken of brillen).
  - Penseelgrootte, zoomen en meervoudig ongedaan maken (Undo).
- 📋 **Klembord & Drag-and-Drop**:
  - Sleep bestanden direct in het venster.
  - Plak een schermafbeelding direct met `Ctrl+V` (of `Cmd+V`).
  - Kopieer uitsnede direct naar het klembord om te plakken in Word, PowerPoint, Google Slides of Canva.
- 🌐 **Tweetalig**: Nederlands (standaard) en Engels via 1 klik.
- 🌓 **Donkere & Lichte Modus**: Volledige Dark Mode ondersteuning.

---

## 💻 Lokale Ontwikkeling

```bash
# Ga naar de map
cd C:\Projects\bgremove

# Afhankelijkheden installeren
npm install

# Start de lokale ontwikkelserver
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

---

## 🚀 Publiceren naar GitHub Pages

### Stap 1: GitHub Pages inschakelen in je repository

1. Ga op GitHub naar je repository: [https://github.com/RatelSlop/bgremove](https://github.com/RatelSlop/bgremove).
2. Klik op **Settings** (tabblad bovenaan) > **Pages** (in het linkermenu).
3. Onder **Build and deployment** > **Source**:
   - Wijzig dit van *Deploy from a branch* naar **GitHub Actions**.
4. Zodra je nu naar `main` pusht, bouwt de workflow in `.github/workflows/deploy.yml` het project automatisch en zet het live op GitHub Pages!

---

### Stap 2: Eigen domein koppelen (`bgremove.schoolnaam.nl`)

Het bestand `public/CNAME` staat al in het project met de inhoud `bgremove.schoolnaam.nl`.
1. Ga in je DNS-beheer (bijv. Cloudflare DNS of je domeinregistrar van `schoolnaam.nl`).
2. Voeg een **CNAME-record** toe:
   - **Name**: `bgremove`
   - **Target / Content**: `RatelSlop.github.io`
   - **Proxy status**: DNS only (of Proxied indien via Cloudflare).
3. Ga op GitHub naar **Settings** > **Pages** > **Custom domain** en vink eventueel **Enforce HTTPS** aan zodra het certificaat is gegenereerd.

---

## ⚡ Prestaties & WebAssembly (Cross-Origin Isolation)

Omdat GitHub Pages geen aangepaste HTTP-headers ondersteunt, maakt deze applicatie gebruik van `coi-serviceworker.js`. Dit service worker script injecteert lokaal in de browser de benodigde beveiligingsheaders:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Hierdoor blijft **Multi-threaded WebAssembly & WebGPU** volledig werken op GitHub Pages voor maximale rekensnelheid!

---

## 📄 Licentie

Gemaakt voor educatief gebruik op scholen.
