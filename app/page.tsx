'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

type Status = 'idle' | 'loading' | 'active' | 'ended' | 'error';

const SKILLS = ['AI Integration', 'Process Automation', 'UX Design', 'Frontend Development'];

const WAVE_BARS = 9;

export default function Home() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const clientRef = useRef<any>(null);

  // Initialise Retell client browser-side only
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { RetellWebClient } = await import('retell-client-js-sdk');
      if (!mounted) return;

      const client = new RetellWebClient();

      client.on('call_started', () => setStatus('active'));
      client.on('call_ended', () => setStatus('ended'));
      client.on('error', (err: unknown) => {
        console.error('Retell error:', err);
        setStatus('error');
        setError('Verbindungsfehler. Bitte versuche es erneut.');
      });

      clientRef.current = client;
      setReady(true);
    })();

    return () => {
      mounted = false;
      clientRef.current?.stopCall();
    };
  }, []);

  const startCall = useCallback(async () => {
    if (!ready) return;
    setStatus('loading');
    setError('');

    // 1 – Microphone permission
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err: any) {
      const name: string = err?.name ?? '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setError(
          'Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in deinen Browser-Einstellungen.',
        );
      } else if (name === 'NotFoundError') {
        setError('Kein Mikrofon gefunden. Bitte schließe ein Mikrofon an.');
      } else {
        setError('Mikrofon nicht verfügbar. Bitte prüfe deine Geräteeinstellungen.');
      }
      setStatus('error');
      return;
    }

    // 2 – Fetch access token from backend
    try {
      const res = await fetch('/api/create-call', { method: 'POST' });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? `Serverfehler (${res.status})`);
      }

      const { access_token } = await res.json();

      // 3 – Start call
      await clientRef.current.startCall({ accessToken: access_token });
    } catch (err: any) {
      setError(err?.message ?? 'Verbindung fehlgeschlagen. Bitte versuche es erneut.');
      setStatus('error');
    }
  }, [ready]);

  const stopCall = useCallback(() => {
    clientRef.current?.stopCall();
    setStatus('ended'); // optimistic – call_ended event will fire too
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError('');
  }, []);

  const handleClick = () => {
    if (status === 'active') return stopCall();
    if (status === 'idle' || status === 'ended' || status === 'error') return startCall();
  };

  return (
    <main className="page">
      <div className="card">
        {/* ── Header ── */}
        <header className="header">
          <div className="avatar">AG</div>
          <div className="identity">
            <h1 className="name">Andreas Gotzler</h1>
            <p className="title">
              Senior Frontend Dev &amp; UX Designer
              <span className="title-arrow">→</span>
              <span className="title-new">IT Automation &amp; KI-Manager</span>
            </p>
          </div>
        </header>

        <div className="divider" />

        {/* ── Skills ── */}
        <div className="skills">
          {SKILLS.map((s) => (
            <span key={s} className="tag">
              {s}
            </span>
          ))}
        </div>

        {/* ── Intro ── */}
        <p className="intro">
          Klick auf den Button und frag meinen KI-Assistenten alles über meinen Werdegang,
          meine Projekte und meine Qualifikationen.
        </p>

        {/* ── Call Section ── */}
        <div className="call-section">
          {/* Waveform – visible only during active call */}
          {status === 'active' && (
            <div className="waveform" aria-hidden="true">
              {Array.from({ length: WAVE_BARS }).map((_, i) => (
                <div key={i} className="bar" style={{ '--i': i } as React.CSSProperties} />
              ))}
            </div>
          )}

          {/* Live indicator */}
          {status === 'active' && (
            <div className="status-dot">
              <span className="dot" />
              Gespräch läuft
            </div>
          )}

          {/* Main button */}
          <button
            className={`btn btn-${status}`}
            onClick={handleClick}
            disabled={status === 'loading' || !ready}
            aria-label={buttonLabel(status)}
          >
            {status === 'idle' && (
              <>
                <MicIcon />
                Mit KI-Assistenten sprechen
              </>
            )}
            {status === 'loading' && (
              <>
                <SpinnerIcon />
                Verbinde...
              </>
            )}
            {status === 'active' && (
              <>
                <StopIcon />
                Gespräch beenden
              </>
            )}
            {status === 'ended' && (
              <>
                <MicIcon />
                Nochmal starten
              </>
            )}
            {status === 'error' && (
              <>
                <MicIcon />
                Erneut versuchen
              </>
            )}
          </button>

          {/* Status messages */}
          {status === 'ended' && (
            <p className="msg msg-success">
              Gespräch beendet – danke für dein Interesse!
            </p>
          )}
          {status === 'error' && error && (
            <p className="msg msg-error">{error}</p>
          )}
        </div>

        {/* ── Footer ── */}
        <p className="footer">
          <LockIcon />
          Nach dem Gespräch wird automatisch eine Anfrage für einen Rückruf dokumentiert.
        </p>
      </div>
    </main>
  );
}

function buttonLabel(s: Status): string {
  const map: Record<Status, string> = {
    idle:    'KI-Assistenten anrufen',
    loading: 'Verbinde...',
    active:  'Gespräch beenden',
    ended:   'Erneut starten',
    error:   'Erneut versuchen',
  };
  return map[s];
}

/* ── Icons ─────────────────────────────────────────────────── */

function MicIcon() {
  return (
    <svg
      width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="spinner"
      width="17" height="17" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.2"
      strokeLinecap="round" aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="footer-icon"
      width="12" height="12" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
