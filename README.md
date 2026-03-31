# Andreas Gotzler – KI-Visitenkarte

Interaktive Web-Visitenkarte mit eingebettetem Voice-KI-Assistenten via [Retell AI](https://www.retellai.com).
Besucher klicken einen Button, sprechen direkt im Browser mit dem Agenten und erhalten sofort Antworten auf alle Fragen zu Werdegang, Projekten und Qualifikationen.

---

## Deploy in 3 Schritten

### 1. Klonen & installieren
```bash
git clone <deine-repo-url>
cd gotzler-card
npm install
```

### 2. Environment Variables setzen
```bash
cp .env.example .env.local
```

`.env.local` öffnen und die Werte aus dem [Retell Dashboard](https://dashboard.retellai.com) eintragen:

| Variable         | Wo finden                                          |
|------------------|----------------------------------------------------|
| `RETELL_API_KEY`  | Retell Dashboard → API Keys                       |
| `RETELL_AGENT_ID` | Retell Dashboard → Agents → dein Agent → Agent ID |

### 3. Auf Vercel deployen
```bash
npx vercel
```

Beim ersten Deployment wirst du nach den Environment Variables gefragt.
Alternativ: Repository in [Vercel](https://vercel.com) importieren und Variables unter **Settings → Environment Variables** eintragen.

---

## Lokale Entwicklung

```bash
npm run dev
# → http://localhost:3000
```

> **Hinweis:** Mikrofon-Zugriff funktioniert nur über HTTPS oder `localhost`.
> Lokal ist `localhost` automatisch erlaubt.

---

## Projektstruktur

```
gotzler-card/
├── app/
│   ├── layout.tsx              # HTML-Shell, Fonts, Metadata
│   ├── globals.css             # Gesamtes Styling
│   ├── page.tsx                # Hauptseite (Client Component)
│   └── api/
│       └── create-call/
│           └── route.ts        # Serverless Function: Retell Access Token
├── .env.example                # Vorlage für Environment Variables
└── README.md
```

---

## Wie es funktioniert

```
Browser (page.tsx)
  │  klickt Button
  ▼
/api/create-call (route.ts)
  │  POST https://api.retellai.com/v2/create-web-call
  │  mit RETELL_API_KEY (serverseitig, nie im Browser)
  ▼
Retell API gibt access_token zurück
  │
  ▼
retellWebClient.startCall({ accessToken })
  │  WebRTC Audio-Stream startet
  ▼
KI-Agent spricht – nach Ende des Gesprächs:
  Retell Webhook → Langdock → Jira-Ticket (bereits konfiguriert)
```

Der API-Key verlässt nie den Server. Das Frontend sieht nur das kurzlebige `access_token`.
