# 🚀 Guida Setup Eatlyst - Nuovo Dispositivo

## 📋 Prerequisiti

### 1. Software da installare
- **Node.js** (versione LTS): https://nodejs.org/
- **Git**: https://git-scm.com/
- **Editor**: Visual Studio Code (consigliato)

### 2. CLI Globali
```bash
# Ionic CLI
npm install -g @ionic/cli

# Angular CLI (opzionale ma consigliato)
npm install -g @angular/cli

# Firebase CLI (per deploy futuro)
npm install -g firebase-tools
```

## 🔧 Setup Progetto

### 1. Clona Repository
```bash
git clone https://github.com/Yamino00/Eatlyst.git
cd Eatlyst
```

### 2. Installa Dipendenze
```bash
npm install
```

### 3. Configurazione Firebase - IMPORTANTE! 🔐
⚠️ **NUOVO SISTEMA DI CONFIGURAZIONE SICURA**

Il progetto ora utilizza un sistema che mantiene le chiavi Firebase fuori dal controllo versione per sicurezza.

#### Opzione A: Primi Passi
```bash
# Crea i file locali con credenziali reali
cp src/environments/environment.ts src/environments/environment.local.ts
cp src/environments/environment.prod.ts src/environments/environment.prod.local.ts
```

Modifica i file `.local.ts` con le vere credenziali Firebase ricevute dal team.

#### Opzione B: File Esistenti
Se hai già i file `.local.ts` configurati, salta questo passaggio.

**Dettagli completi**: Vedi `FIREBASE_SETUP.md` per istruzioni complete.

### 4. Test Ambiente di Sviluppo
```bash
# Usa configurazione con credenziali reali
npm run serve:local
# oppure per sviluppo senza credenziali reali
ionic serve
```
L'app dovrebbe aprirsi su `http://localhost:8100`

## 📱 Setup Mobile (Capacitor)

### 1. Sincronizza Capacitor
```bash
npx cap sync
```

### 2. Per iOS (solo su macOS)
```bash
npx cap open ios
```

### 3. Per Android
```bash
npx cap open android
```

## 🔥 Configurazione Firebase

### 1. Accesso al Progetto
- Vai su https://console.firebase.google.com
- Seleziona il progetto "Eatlyst"
- Controlla che le configurazioni siano corrette

### 2. Domini Autorizzati (Authentication)
Se deploy su hosting esterno, aggiungi domini in:
**Authentication → Settings → Authorized domains**

Domini attuali configurati:
- `localhost`
- `127.0.0.1`
- `e1x0m018sf.appflowapp.com` (Ionic Dashboard)

## 🛠️ Comandi Utili

### Sviluppo
```bash
# Avvia server di sviluppo
ionic serve

# Build per produzione
ionic build

# Lint e controllo codice
ng lint

# Test
ng test
```

### Capacitor
```bash
# Sincronizza modifiche
npx cap sync

# Build e sincronizza
ionic build && npx cap sync

# Live reload su dispositivo
ionic cap run android -l --external
ionic cap run ios -l --external
```

### Firebase
```bash
# Login Firebase
firebase login

# Deploy hosting (futuro)
firebase deploy --only hosting

# Deploy functions (futuro)
firebase deploy --only functions
```

## 📁 Struttura File Ignorati da Git

I seguenti file/cartelle NON sono nel repository e si generano automaticamente:
- `/node_modules` - Dipendenze npm
- `/www` - Build Ionic
- `/platforms` - Piattaforme Capacitor
- `/plugins` - Plugin Capacitor
- `/.ionic` - Cache Ionic
- `/.angular` - Cache Angular

## 🔐 File Sensibili

### File di Configurazione Importanti
- `src/environments/firebase.config.ts` - Template configurazione Firebase (safe to commit)
- `src/environments/*.local.ts` - Configurazioni con credenziali reali (NON committare)
- `capacitor.config.ts` - Configurazione Capacitor
- `firebase.json` - Configurazione Firebase CLI
- `FIREBASE_SETUP.md` - Guida dettagliata setup Firebase

### Sicurezza
⚠️ **IMPORTANTE**: Non committare mai:
- Chiavi API private (ora gestite via file `.local.ts`)
- Certificati di sviluppo
- File con credenziali personali
- File `src/environments/*.local.ts` (automaticamente esclusi da .gitignore)

## 🎨 Tema e Design

Il progetto usa la palette colori Eatlyst:
- **Bianco**: #FFFFFF
- **Rosso**: #FF4444  
- **Arancione**: #FF8800
- **Giallo**: #FFCC00

Variabili CSS definite in `src/theme/variables.scss`

## 🔧 Troubleshooting Comuni

### Errore "Firebase: Error (auth/unauthorized-domain)"
- Aggiungi il dominio a Firebase Console → Authentication → Authorized domains

### Errore "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Capacitor non funziona
```bash
npx cap clean
npx cap sync
```

### Ionic serve non parte
- Verifica porta 8100 libera
- Controlla versione Node.js compatibile

## 📞 Supporto

- **Documentazione Ionic**: https://ionicframework.com/docs
- **Documentazione Firebase**: https://firebase.google.com/docs
- **Documentazione Angular**: https://angular.io/docs

---

## 🏗️ Architettura App

### Tab1 - Gestione Ricette
- CRUD ricette
- Ricerca e filtri
- Gestione ingredienti

### Tab2 - Pianificazione Settimanale  
- Calendario drag-and-drop
- Assegnazione ricette ai pasti
- Vista settimanale

### Tab3 - Lista Spesa
- Generazione automatica da ricette
- Aggregazione ingredienti
- Gestione quantità

---

*Ultima modifica: Settembre 2025*