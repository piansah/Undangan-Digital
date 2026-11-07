'use client';

import { useEffect, useRef, useState, type FormEvent, type JSX } from 'react';

const weddingDate = new Date('2026-11-22T08:00:00+07:00').getTime();
type Countdown = { days: string; hours: string; minutes: string; seconds: string };
const PROMO_AUTHOR = 'Alif Alpian';
const PROMO_WHATSAPP = '6285793571194';

export default function Home(): JSX.Element {
  const [guestName, setGuestName] = useState('Tamu Undangan');
  const [countdown, setCountdown] = useState<Countdown>({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const [formNote, setFormNote] = useState('Konfirmasi akan dikirim ke Google Sheets.');
  const [attendance, setAttendance] = useState('Hadir');
  const [proofName, setProofName] = useState('');
  const [activePhoto, setActivePhoto] = useState<{ src: string; alt: string } | null>(null);
  const [showHeader, setShowHeader] = useState(false);
  const [invitationOpened, setInvitationOpened] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const musicRef = useRef<HTMLAudioElement>(null);
  const [revealedItems, setRevealedItems] = useState<Set<string>>(() => new Set());
  const [promoOpen, setPromoOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setInvitationOpened(true), 120);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasEntered) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
    document.body.style.overflow = '';
  }, [hasEntered]);

  useEffect(() => {
    if (!hasEntered) return;
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
      setRevealedItems((current) => {
        const next = new Set(current);
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-reveal');
            if (id) next.add(id);
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
        return next;
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -35px 0px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [hasEntered]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setGuestName(params.get('untuk') || 'Tamu Undangan');
    const updateCountdown = () => {
      const remaining = Math.max(0, weddingDate - Date.now());
      setCountdown({
        days: String(Math.floor(remaining / 86400000)).padStart(2, '0'),
        hours: String(Math.floor((remaining / 3600000) % 24)).padStart(2, '0'),
        minutes: String(Math.floor((remaining / 60000) % 60)).padStart(2, '0'),
        seconds: String(Math.floor((remaining / 1000) % 60)).padStart(2, '0')
      });
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!hasEntered) {
      setShowHeader(false);
      return;
    }
    const welcome = document.querySelector('#undangan');
    if (!welcome) return;
    const observer = new IntersectionObserver(([entry]) => setShowHeader(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(welcome);
    return () => observer.disconnect();
  }, [hasEntered]);

  function enterInvitation(): void {
    if (hasEntered) return;
    const playback = musicRef.current?.play();
    if (playback) playback.then(() => setMusicPlaying(true)).catch(() => setMusicPlaying(false));
    setInvitationOpened(false);
    window.setTimeout(() => {
      setHasEntered(true);
      document.querySelector('#undangan')?.scrollIntoView({ behavior: 'smooth' });
      window.setTimeout(() => setInvitationOpened(true), 650);
    }, 1050);
  }

  async function toggleMusic(): Promise<void> {
    const audio = musicRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
        setMusicPlaying(true);
      } catch {
        setMusicPlaying(false);
      }
    } else {
      audio.pause();
      setMusicPlaying(false);
    }
  }

  useEffect(() => {
    if (!activePhoto) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActivePhoto(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [activePhoto]);

  useEffect(() => {
    if (!promoOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPromoOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [promoOpen]);

  async function submitRsvp(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormNote('Mengirim konfirmasi…');
    const form = event.currentTarget;
    const data = new FormData(form);
    const proof = data.get('proof');
    let proofFile: { name: string; mimeType: string; base64: string } | null = null;
    if (proof instanceof File && proof.size > 0) {
      if (proof.size > 3 * 1024 * 1024) {
        setFormNote('Ukuran bukti maksimal 3 MB.');
        return;
      }
      let dataUrl: string;
      try {
        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('File tidak dapat dibaca.'));
          reader.readAsDataURL(proof);
        });
      } catch {
        setFormNote('Bukti tidak dapat dibaca. Pilih file lain lalu coba lagi.');
        return;
      }
      proofFile = { name: proof.name, mimeType: proof.type || 'application/octet-stream', base64: dataUrl.split(',')[1] || '' };
    }
    const payload = {
      name: String(data.get('name') || '').trim(),
      attendance: String(data.get('attendance') || ''),
      message: String(data.get('message') || '').trim(),
      guest: guestName,
      proof: proofFile
    };
    try {
      const response = await fetch('/api/rsvp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'Google Sheets menolak kiriman.');
      setFormNote('Konfirmasi berhasil disimpan. Terima kasih!');
      form.reset();
      setAttendance('Hadir');
      setProofName('');
    } catch (error) {
      setFormNote(error instanceof Error ? `Konfirmasi gagal disimpan: ${error.message}` : 'Konfirmasi gagal disimpan. Periksa koneksi lalu coba lagi.');
    }
  }

  return (
    <>
      <div className={`entry-curtain${invitationOpened ? ' entry-curtain-open' : ''}`} aria-hidden="true"><span /><span /></div>
      <header className={`topbar${showHeader ? ' topbar-visible' : ''}`}><a className="brand" href="#home">A<span>&</span>M</a><a className="nav-cta" href="#acara">Lihat detail <span>↗</span></a></header>
      <audio ref={musicRef} src="/music/ivan_luzan-the-wedding-piano-151055.mp3" loop preload="none" />
      <main className={hasEntered ? 'invitation-opened' : 'invitation-closed'}>
        <section className={`hero${invitationOpened ? ' hero-opened' : ''}`} id="home">
          <div className="hero-card">
            <div className="hero-photo" role="img" aria-label="Foto pasangan pengantin" />
            <div className="hero-copy"><p className="eyebrow light">THE WEDDING OF</p><h1>Alya <i>&</i><br />Ismail</h1><p className="hero-date">MINGGU, 22 NOVEMBER 2026</p><button className="button button-light" type="button" onClick={enterInvitation}>Buka Undangan</button></div>
          </div>
          <div className="hero-caption"><span>22 · 11 · 2026</span><span>RAJAGALUH</span></div>
        </section>

        <section className="welcome section" id="undangan"><div className="section-label"><span>01</span> UNDANGAN</div><div className="welcome-content" data-reveal="welcome"><p className="eyebrow">DENGAN PENUH SUKACITA</p><h2>Hari bahagia kami,<br /><i>akan lebih berarti</i><br />dengan kehadiranmu.</h2><p className="body-copy">Dengan memohon rahmat dan ridho Tuhan Yang Maha Esa, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada pernikahan kami.</p><div className="recipient"><span>Kepada Yth.</span><strong>{guestName}</strong></div></div><div className="welcome-mark">A<span>&</span>M</div></section>

        <section className="couple section" id="pasangan"><div className="section-label"><span>02</span> KEDUA MEMPELAI</div><div className="couple-illustration" data-reveal="couple-art"><img src="/image-ilustrasi-nikah.png" alt="Ilustrasi pengantin Alya Aulia dan Muhammad Ismail Marzuki" /></div><div className="couple-details"><article className="person" data-reveal="bride"><p className="eyebrow">MEMPELAI WANITA</p><h2>Alya Aulia</h2><p className="body-copy">Putri kedua dari<br />Bapak Babay Sobari &amp; Ibu Ida Rohyani</p></article><div className="ampersand" data-reveal="couple-mark">&amp;</div><article className="person person-right" data-reveal="groom"><p className="eyebrow">MEMPELAI PRIA</p><h2>Muhammad Ismail<br /><i>Marzuki</i></h2><p className="body-copy">Putra pertama dari<br />Bapak Aminuddin &amp; Ibu Encup Supriah</p></article></div></section>

        <section className="story section" id="kisah"><div className="section-label"><span>03</span> KISAH KAMI</div><div className="story-heading" data-reveal="story-heading"><p className="eyebrow">SETIAP CERITA PUNYA AWAL</p><h2>Perjalanan kecil<br /><i>menuju selamanya.</i></h2></div><div className="story-timeline">
          <article className={`story-item reveal-item${revealedItems.has('story-1') ? ' is-revealed' : ''}`} data-reveal="story-1"><span className="story-number">01</span><div><h3>Pertama Bertemu</h3><p>Semua berawal dari sebuah perkenalan sederhana yang tak pernah direncanakan. Dari sapaan pertama yang canggung, perlahan tumbuh rasa nyaman yang sulit dijelaskan dengan kata-kata.</p></div></article>
          <article className={`story-item reveal-item${revealedItems.has('story-2') ? ' is-revealed' : ''}`} data-reveal="story-2"><span className="story-number">02</span><div><h3>Mulai Dekat</h3><p>Dari percakapan ringan menjadi cerita yang tak pernah habis. Kami mulai menyadari bahwa kehadiran satu sama lain adalah sesuatu yang selalu dinanti di setiap hari.</p></div></article>
          <article className={`story-item reveal-item${revealedItems.has('story-3') ? ' is-revealed' : ''}`} data-reveal="story-3"><span className="story-number">03</span><div><h3>Lamaran</h3><p>Dengan niat yang tulus dan restu dari kedua keluarga, sebuah janji diikat. Satu langkah lebih dekat menuju ikatan suci yang selama ini kami impikan bersama.</p></div></article>
          <article className={`story-item reveal-item${revealedItems.has('story-4') ? ' is-revealed' : ''}`} data-reveal="story-4"><span className="story-number">04</span><div><h3>Menuju Hari Bahagia</h3><p>Kini, dengan penuh rasa syukur, kami bersiap menyempurnakan perjalanan ini. Dan kami ingin Anda menjadi bagian dari hari bahagia yang akan selalu kami kenang.</p></div></article>
        </div></section>

        <section className="event section" id="acara"><div className="section-label"><span>03</span> RANGKAIAN ACARA</div><div className="event-heading" data-reveal="event-heading"><p className="eyebrow">CATAT TANGGALNYA</p><h2>Merayakan cinta,<br /><i>bersama orang terkasih.</i></h2></div><div className="event-grid"><article className="event-card" data-reveal="event-1"><span className="event-no">01 / AKAD</span><h3>Akad Nikah</h3><p className="event-date">Minggu, 22 November 2026</p><div className="event-rule" /><p>08.00 WIB – Selesai</p><p className="address">Kediaman Mempelai Wanita<br />Desa Cisetut RT.02 RW.05<br />Kecamatan Rajagaluh</p><a className="text-link" href="https://maps.google.com/?q=Desa+Cisetut+RT.02+RW.05+Kecamatan+Rajagaluh" target="_blank" rel="noreferrer">Buka peta ↗</a></article><article className="event-card event-card-dark" data-reveal="event-2"><span className="event-no">02 / RESEPSI</span><h3>Resepsi</h3><p className="event-date">Minggu, 22 November 2026</p><div className="event-rule" /><p>09.00 WIB – Selesai</p><p className="address">Kediaman Mempelai Wanita<br />Desa Cisetut RT.02 RW.05<br />Kecamatan Rajagaluh<br />Blok Satu (Cimaya)</p><a className="text-link" href="https://maps.google.com/?q=Desa+Cisetut+RT.02+RW.05+Kecamatan+Rajagaluh" target="_blank" rel="noreferrer">Buka peta ↗</a></article></div></section>

        <section className="countdown section"><div data-reveal="countdown-title"><p className="eyebrow">MENUJU HARI BAHAGIA</p><h2>Tak sabar bertemu<br /><i>di hari istimewa.</i></h2></div><div className="timer" aria-label="Hitung mundur" data-reveal="countdown-timer">{Object.entries({ HARI: countdown.days, JAM: countdown.hours, MENIT: countdown.minutes, DETIK: countdown.seconds }).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div></section>

        <section className="gift section" id="tanda-kasih"><div className="gift-heading" data-reveal="gift-heading"><p className="eyebrow">AMPLOP DIGITAL</p><h2>Tanda Kasih</h2><div className="gallery-divider"><span /></div><p>Doa dan kehadiran Anda adalah hadiah terindah bagi kami.<br />Jika berkenan, tanda kasih dapat disampaikan melalui rekening berikut:</p></div><div className="gift-card" data-reveal="gift-card"><p className="bank-name">BANK</p><div className="bank-rule" /><p className="account-number">00000000</p><p className="account-owner">NOMOR REKENING CONTOH</p></div></section>

    <section className="rsvp section" id="rsvp"><div className="rsvp-art" data-reveal="rsvp-art"><span>WITH LOVE</span><strong>A<i>&amp;</i>M</strong></div><div className="rsvp-content" data-reveal="rsvp-form"><div className="section-label"><span>04</span> KONFIRMASI</div><p className="eyebrow">KEHADIRANMU BERARTI</p><h2>Bisakah kami<br /><i>menghitungmu hadir?</i></h2><p className="body-copy">Mohon konfirmasi kehadiran dan tinggalkan doa terbaik untuk kami.</p><form onSubmit={submitRsvp}><label htmlFor="name">Nama</label><input id="name" name="name" placeholder="Nama lengkap" required /><label htmlFor="attendance">Konfirmasi kehadiran</label><select id="attendance" name="attendance" value={attendance} onChange={(event) => setAttendance(event.target.value)}><option value="Hadir">Dengan senang hati, hadir</option><option value="Tidak hadir">Maaf, belum bisa hadir</option></select>{attendance === 'Tidak hadir' && <div className="proof-field"><label htmlFor="proof">Bukti tanda kasih <span>(opsional)</span></label><p>Jika Anda telah mengirimkan tanda kasih melalui rekening, silakan lampirkan bukti transfer.</p><input id="proof" name="proof" type="file" accept="image/*,.pdf,application/pdf" onChange={(event) => setProofName(event.target.files?.[0]?.name || '')} /><span className="proof-file-name">{proofName || 'Pilih gambar atau PDF'}</span></div>}<label htmlFor="message">Ucapan &amp; doa</label><textarea id="message" name="message" rows={3} placeholder="Tuliskan ucapan untuk kedua mempelai" /><button className="button button-dark" type="submit">Kirim konfirmasi <span>↗</span></button><p className="form-note">{formNote}</p></form></div></section>
      <section className="closing" data-reveal="closing"><img className="closing-flower" src="/ornaments/floral-divider.svg" alt="" /><p className="eyebrow light">SAMPAI JUMPA</p><h2>Dengan cinta,<br /><i>Alya &amp; Ismail</i></h2><p>Terima kasih atas doa dan restunya.</p></section>
      </main>
      <footer><span>© 2026 ALYA &amp; ISMAIL</span><button className="promo-trigger" type="button" onClick={() => setPromoOpen(true)}>DIBUAT DENGAN CINTA <b>♥</b></button></footer>
      {hasEntered && <button className="music-toggle" type="button" onClick={toggleMusic} aria-label={musicPlaying ? 'Jeda musik' : 'Putar musik'}><span className={musicPlaying ? 'music-bars music-bars-playing' : 'music-bars'}><i /><i /><i /><i /></span><span>{musicPlaying ? 'Musik aktif' : 'Putar musik'}</span></button>}
      {promoOpen && <div className="promo-backdrop" role="presentation" onClick={() => setPromoOpen(false)}><section className="promo-modal" role="dialog" aria-modal="true" aria-labelledby="promo-title" onClick={(event) => event.stopPropagation()}><p className="eyebrow">UNDANGAN DIGITAL</p><h2 id="promo-title">Dibuat dengan cinta<br /><i>oleh {PROMO_AUTHOR}</i></h2><p className="promo-copy">Ingin membuat undangan digital seperti ini? Hubungi saya untuk informasi lebih lanjut.</p>{PROMO_WHATSAPP ? <a className="promo-contact" href={`https://wa.me/${PROMO_WHATSAPP}?text=${encodeURIComponent('Halo, saya tertarik membuat undangan digital.')}`} target="_blank" rel="noreferrer">HUBUNGI VIA WHATSAPP</a> : <p className="promo-contact-missing">Nomor WhatsApp akan ditambahkan.</p>}<button className="promo-close" type="button" onClick={() => setPromoOpen(false)}>Tutup</button></section></div>}
      {activePhoto && <div className="lightbox" role="dialog" aria-modal="true" aria-label="Foto galeri" onClick={() => setActivePhoto(null)}><img className="lightbox-image" src={activePhoto.src} alt={activePhoto.alt} onClick={() => setActivePhoto(null)} /></div>}
    </>
  );
}
