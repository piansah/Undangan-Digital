import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSzmS_9ibublchwQdJRBAbHQNe6dFPljHlf-mKmcado9_zFsgvc-P1vsQ1VTLj34M/exec';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload.name || !payload.attendance) {
      return NextResponse.json({ ok: false, error: 'Nama dan status kehadiran wajib diisi.' }, { status: 400 });
    }

    const upstream = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      cache: 'no-store'
    });
    const responseText = await upstream.text();

    let result: { ok?: boolean; error?: string };
    try {
      result = JSON.parse(responseText);
    } catch {
      return NextResponse.json({ ok: false, error: `Balasan Apps Script tidak terbaca (HTTP ${upstream.status}). Periksa deployment Web App.` }, { status: 502 });
    }

    if (!upstream.ok || !result.ok) {
      return NextResponse.json({ ok: false, error: result.error || `Apps Script gagal (HTTP ${upstream.status}).` }, { status: 502 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kesalahan server saat mengirim RSVP.';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
