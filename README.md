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

## 🚀 Publiceren naar GitHub & Cloudflare Pages

### Stap 1: Git repository initialiseren en naar GitHub pushen

1. Maak een nieuwe repository aan op GitHub (bijv. `bgremove`).
2. Voer in de terminal van `C:\Projects\bgremove` uit:

```bash
git init
git add .
git commit -m "feat: initial commit for bgremove.schoolnaam.nl"
git branch -M main
git remote add origin https://github.com/<jouw-gebruikersnaam>/bgremove.git
git push -u origin main
```

---

### Stap 2: Koppelen aan Cloudflare Pages

1. Log in op het [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Ga naar **Workers & Pages** > **Create application** > tabblad **Pages** > **Connect to Git**.
3. Selecteer je GitHub repository (`bgremove`).
4. Stel de **Build settings** in:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Klik op **Save and Deploy**. Cloudflare bouwt en publiceert de site binnen 1 minuut op een gratis `*.pages.dev` URL.

---

### Stap 3: Eigen domein koppelen (`bgremove.schoolnaam.nl`)

1. Klik in je Cloudflare Pages project op het tabblad **Custom domains**.
2. Klik op **Set up a custom domain**.
3. Vul in: `bgremove.schoolnaam.nl`.
4. Cloudflare regelt automatisch:
   - Het DNS CNAME record.
   - Het gratis SSL/TLS HTTPS-certificaat.
5. Zodra de DNS actief is, is je tool live bereikbaar op **`https://bgremove.schoolnaam.nl`**!

---

## ⚡ Prestaties & WebAssembly Headers

De applicatie bevat een `public/_headers` configuratiebestand dat automatisch door Cloudflare Pages wordt uitgelezen. Dit levert de volgende beveiligingsheaders:

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Hierdoor kan de browser **Multi-threaded WebAssembly en WebGPU** gebruiken, wat resulteert in uitsnijdingsnelheden tot 5x sneller!

---

## 📄 Licentie

Gemaakt voor educatief gebruik op scholen.
