import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey  = process.env.RETELL_API_KEY;
  const agentId = process.env.RETELL_AGENT_ID;

  if (!apiKey || !agentId) {
    console.error('Missing RETELL_API_KEY or RETELL_AGENT_ID environment variables');
    return NextResponse.json(
      { error: 'Server-Konfigurationsfehler. Bitte Administrator kontaktieren.' },
      { status: 500 },
    );
  }

  try {
    const retellRes = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agent_id: agentId }),
    });

    if (!retellRes.ok) {
      const body = await retellRes.json().catch(() => ({}));
      console.error('Retell API error:', retellRes.status, body);
      return NextResponse.json(
        { error: 'KI-Assistent momentan nicht erreichbar. Bitte versuche es später.' },
        { status: retellRes.status },
      );
    }

    const data = await retellRes.json();

    // Return only the access token – never expose the API key
    return NextResponse.json({ access_token: data.access_token });
  } catch (err) {
    console.error('create-call error:', err);
    return NextResponse.json(
      { error: 'Interner Serverfehler.' },
      { status: 500 },
    );
  }
}
