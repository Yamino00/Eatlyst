# 🔐 Firebase Configuration Setup - Eatlyst

## 🎯 Panoramica

Questo progetto utilizza un sistema di configurazione Firebase sicuro che mantiene le chiavi API sensibili fuori dal controllo versione Git, proteggendo al tempo stesso la funzionalità completa dell'applicazione.

## 📁 Struttura File di Configurazione

### File Template (Committed to Git)
Questi file contengono valori placeholder e sono sicuri da committare:
- `src/environments/environment.ts` - Ambiente sviluppo template  
- `src/environments/environment.prod.ts` - Ambiente produzione template
- `src/environments/firebase.config.ts` - Configurazione Firebase template

### File Locali (NON Committed to Git)  
Questi file contengono le vere credenziali Firebase e sono ignorati da Git:
- `src/environments/environment.local.ts` - Ambiente sviluppo con credenziali reali
- `src/environments/environment.prod.local.ts` - Ambiente produzione con credenziali reali
- `src/environments/firebase.config.local.ts` - Configurazione Firebase con credenziali reali

## 🚀 Setup Iniziale per Nuovo Sviluppatore

### 1. Clona il Repository
```bash
git clone https://github.com/Yamino00/Eatlyst.git
cd Eatlyst
npm install
```

### 2. Configura Firebase - Opzione A: Usa i File Locali Esistenti
Se i file locali esistono già sul tuo sistema (perché li hai creati precedentemente):
```bash
# I file locali dovrebbero essere già presenti:
# - src/environments/environment.local.ts
# - src/environments/environment.prod.local.ts
# - src/environments/firebase.config.local.ts
```

### 3. Configura Firebase - Opzione B: Crea Nuovi File Locali
Se è la prima volta che lavori sul progetto, crea i file locali:

```bash
# Copia i template e sostituisci con le tue credenziali Firebase
cp src/environments/environment.ts src/environments/environment.local.ts
cp src/environments/environment.prod.ts src/environments/environment.prod.local.ts  
cp src/environments/firebase.config.ts src/environments/firebase.config.local.ts
```

Quindi modifica i file `.local.ts` con le vere credenziali Firebase:
```typescript
// In environment.local.ts e environment.prod.local.ts
export const environment = {
  production: false, // o true per prod
  firebase: {
    apiKey: "TUA_VERA_API_KEY",
    authDomain: "tuo-progetto.firebaseapp.com",
    projectId: "tuo-project-id",
    storageBucket: "tuo-progetto.firebasestorage.app", 
    messagingSenderId: "tuo-sender-id",
    appId: "tua-app-id",
    measurementId: "tuo-measurement-id"
  }
};
```

## 🛠️ Comandi di Sviluppo

### Sviluppo Locale (con credenziali reali)
```bash
# Usa la configurazione locale con credenziali reali
npm run serve:local
# oppure
ionic serve --configuration=local
```

### Build di Produzione (con credenziali reali)
```bash
# Build di produzione con credenziali reali
npm run build:prod-local
# oppure  
ng build --configuration=production
```

### Sviluppo con Template (senza credenziali reali)
```bash
# Usa i template senza credenziali (per test di compatibilità)
ionic serve --configuration=development
```

## 📋 Scripts NPM Consigliati

Aggiungi questi script al tuo `package.json`:

```json
{
  "scripts": {
    "serve:local": "ionic serve --configuration=local",
    "build:local": "ng build --configuration=local", 
    "build:prod-local": "ng build --configuration=production"
  }
}
```

## 🔒 Sicurezza

### ✅ DO - Cosa Fare
- ✅ Usa sempre i file `.local.ts` per lo sviluppo reale
- ✅ Mantieni i file template aggiornati con la struttura corretta
- ✅ Verifica che `.gitignore` escluda i file `*.local.ts`
- ✅ Documenta qualsiasi modifica alla struttura di configurazione

### ❌ DON'T - Cosa NON Fare  
- ❌ NON committare mai file con credenziali reali
- ❌ NON modificare i file template con credenziali reali
- ❌ NON rimuovere i file `.local.ts` dal .gitignore
- ❌ NON condividere credenziali Firebase via chat/email

## 🐛 Troubleshooting

### Problema: "Firebase not configured" o errori di autenticazione
**Soluzione**: Verifica che i file `.local.ts` esistano e contengano le credenziali corrette.

### Problema: "File environment.local.ts not found"
**Soluzione**: Crea il file locale seguendo la sezione "Setup Iniziale".

### Problema: Build fallisce per file mancanti
**Soluzione**: Assicurati che tutti i file template esistano e abbiano la struttura corretta.

## 🌐 Deploy in Produzione

Per il deploy in produzione, considera di utilizzare variabili d'ambiente:

```bash
# Esempio per hosting Firebase
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_AUTH_DOMAIN="your-auth-domain"
# ... altre variabili

# Poi modifica environment.prod.local.ts per usare process.env
```

## 📞 Supporto

Per domande sulla configurazione Firebase:
1. Controlla questa documentazione
2. Verifica che tutti i file siano nella posizione corretta
3. Controlla il file `.gitignore` per confermare l'esclusione dei file locali