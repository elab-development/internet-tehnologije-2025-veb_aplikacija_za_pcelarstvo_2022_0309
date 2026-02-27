# 🐝 HoneyFlow – Web aplikacija za upravljanje pčelinjacima

[![CI](https://github.com/elab-development/internet-tehnologije-2025-veb_aplikacija_za_pcelarstvo_2022_0309/actions/workflows/ci.yml/badge.svg)](https://github.com/elab-development/internet-tehnologije-2025-veb_aplikacija_za_pcelarstvo_2022_0309/actions)
![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?logo=render&logoColor=white)

HoneyFlow je full-stack web aplikacija razvijena u okviru predmeta **Internet tehnologije 2025** na Fakultetu organizacionih nauka.  
Aplikacija je namenjena pčelarima za evidenciju, organizaciju i upravljanje pčelinjacima i košnicama, uz integraciju eksternih servisa i primenu savremenih DevOps i bezbednosnih praksi.

---

# ✨ Ključne funkcionalnosti

- Registracija i prijava korisnika (JWT autentifikacija)
- Role-based pristup (ADMIN / BEEKEEPER)
- CRUD operacije nad košnicama
- Komentarisanje košnica
- Prikaz lokacija košnica na interaktivnoj mapi (Leaflet)
- Integracija eksternih API-ja
- Automatizovani testovi
- CI/CD pipeline
- Docker podrška
- Swagger (OpenAPI) dokumentacija

---

# 🌍 Eksterni API-ji

Aplikacija koristi najmanje dva eksterna API-ja:

### 1️⃣ Open-Meteo API  
Koristi se za prikaz vremenske prognoze za lokaciju pčelinjaka.  
https://open-meteo.com/

### 2️⃣ OpenStreetMap / Nominatim API  
Koristi se za geokodiranje i dobijanje koordinata na osnovu unete adrese.  
https://nominatim.openstreetmap.org/

---

# 🗺 Vizualizacija podataka

Za prikaz geografskih podataka koristi se:

- Leaflet mapa
- OpenStreetMap tile slojevi
- Dinamičko dodavanje markera
- Interaktivni popup elementi

Ovim je ispunjen zahtev za napredno korišćenje Map API-ja.

---

# 🛠 Tehnologije

### Frontend / Backend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Baza podataka i ORM
- PostgreSQL
- Prisma ORM

### Autentifikacija
- JSON Web Token (jsonwebtoken)

### Testiranje
- Jest
- React Testing Library

### DevOps
- Docker
- Docker Compose
- GitHub Actions (CI/CD)
- Render (Cloud deploy)

---

# 🔒 Bezbednost

Implementirana zaštita od najčešćih bezbednosnih napada:

- ✅ IDOR zaštita – provera vlasništva nad resursima
- ✅ CORS kontrola – allowlist origin-a
- ✅ CSRF zaštita (Origin check)
- ✅ Content Security Policy (CSP)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ Referrer-Policy
- ✅ Prisma ORM zaštita od SQL Injection napada

---

# 🔄 CI/CD Pipeline

Projekat koristi GitHub Actions za:

- Automatsko pokretanje testova na svaki push i pull request
- Build aplikacije
- Build Docker image-a
- Push Docker image-a na registry
- Deploy na cloud platformu

Pipeline se izvršava za grane:

- `develop`
- `main` / `master`

Workflow fajl se nalazi u:


.github/workflows/ci.yml


---

# 🌳 Git struktura grana


Repozitorijum koristi sledeću strategiju grananja:

- `master` – stabilna (produkcijska) verzija aplikacije
- `develop` – integraciona grana za spajanje funkcionalnosti
- `feature/cd-ci` – implementacija CI/CD pipeline-a
- `feature/swagger` – implementacija Swagger (OpenAPI) dokumentacije

Feature grane se razvijaju od `develop` grane i nakon završetka se spajaju nazad u `develop`.  
Stabilne verzije se potom merguju u `master`.

---

# ☁️ Produkciona verzija (Cloud Deployment)

Aplikacija je deploy-ovana na cloud platformu **Render** kao Docker Web Service.

Deploy se vrši automatski putem CI/CD pipeline-a nakon push-a na `develop` granu.

## 🔗 Live aplikacija

https://internet-tehnologije-2025-veb-aplikacija.onrender.com

### Deploy konfiguracija:

- Platforma: Render
- Tip servisa: Docker Web Service
- Deploy grana: `develop`
- Build metod: Dockerfile
- Environment varijable:
  - DATABASE_URL
  - JWT_SECRET
  - NODE_ENV=production

---

# ⚙️ Pokretanje projekta

## 🔹 Lokalno (development)

### 1️⃣ Kloniranje repozitorijuma

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-veb_aplikacija_za_pcelarstvo_2022_0309
cd internet-tehnologije-2025-veb_aplikacija_za_pcelarstvo_2022_0309
```

### 2️⃣ Instalacija zavisnosti

```bash
npm install
```

### 3️⃣ Kreiranje `.env` fajla

U root folderu projekta kreirati `.env` fajl sa sledećim vrednostima:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/honeyflow
JWT_SECRET=your_super_secret_key
```

### 4️⃣ Migracije baze

```bash
npx prisma migrate dev
```

### 5️⃣ Pokretanje aplikacije

```bash
npm run dev
```

Aplikacija će biti dostupna na:

👉 http://localhost:3000

---

## 🐳 Pokretanje pomoću Docker-a

```bash
docker compose up --build
```

Aplikacija i PostgreSQL baza će se pokrenuti kroz Docker Compose konfiguraciju.

---

## 📘 API dokumentacija

Swagger (OpenAPI) dokumentacija dostupna je na:

```
/api/docs
```

OpenAPI JSON specifikacija:

```
/api/openapi
```

---

## 🧪 Testovi

Pokretanje testova:

```bash
npm test
```

---

# 👩‍💻 Autori

- Glorija  
- Katarina  
- Nađa  

---

**Fakultet organizacionih nauka**  
Predmet: *Internet tehnologije 2025*