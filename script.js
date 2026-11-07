// UBAH DATA CONTOH DI BAWAH INI untuk menyesuaikan undangan.
const weddingDate = new Date('2026-12-20T08:00:00+07:00');

// Personalisasi nama penerima lewat tautan: ?untuk=Nama%20Tamu
const params = new URLSearchParams(window.location.search);
const guestName = params.get('untuk');
if (guestName) document.querySelector('#guest-name').textContent = guestName;

function updateCountdown() {
  const remaining = Math.max(0, weddingDate.getTime() - Date.now());
  const units = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining / 3600000) % 24),
    minutes: Math.floor((remaining / 60000) % 60),
    seconds: Math.floor((remaining / 1000) % 60)
  };
  for (const [id, value] of Object.entries(units)) {
    document.querySelector(`#${id}`).textContent = String(value).padStart(2, '0');
  }
}
updateCountdown();
setInterval(updateCountdown, 1000);

// Formulir demo: belum mengirim atau menyimpan data.
document.querySelector('#rsvp-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#form-note').textContent = 'Terima kasih! Hubungkan formulir ini ke database untuk menyimpan RSVP.';
});
