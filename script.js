const $ = (selector) => document.querySelector(selector);
const invitation = $('#invitation');
const music = $('#bgMusic');
const musicControl = $('#musicControl');

// Tempel URL Web App Google Apps Script di antara tanda kutip setelah deploy.
// Contoh: 'https://script.google.com/macros/s/AKfycb.../exec'
const GUESTBOOK_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwVlLY9RmnAIIXAMWgXpVCcO8H7FZtyqrtNR8YBKofJEQAgs2333Gvt6I5p5zdbhKAuBg/exec';

function safeGuestName() {
  const name = new URLSearchParams(window.location.search).get('to');
  return name ? name.replace(/[<>]/g, '').trim().slice(0, 80) : 'Bapak/Ibu/Saudara/i';
}
$('#guestName').textContent = safeGuestName();

$('#openInvitation').addEventListener('click', async () => {
  document.body.classList.remove('is-locked');
  invitation.setAttribute('aria-hidden', 'false');
  invitation.scrollIntoView({ behavior: 'smooth' });
  try { await music.play(); musicControl.classList.add('is-playing'); } catch (_) { /* Music waits for a user gesture if the browser blocks it. */ }
});

musicControl.addEventListener('click', async () => {
  if (music.paused) { try { await music.play(); musicControl.classList.add('is-playing'); } catch (_) {} }
  else { music.pause(); musicControl.classList.remove('is-playing'); }
});
music.addEventListener('pause', () => musicControl.classList.remove('is-playing'));
music.addEventListener('play', () => musicControl.classList.add('is-playing'));

const target = new Date('2026-12-14T09:00:00+07:00').getTime();
function updateCountdown() {
  let seconds = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const values = [Math.floor(seconds / 86400), Math.floor(seconds % 86400 / 3600), Math.floor(seconds % 3600 / 60), seconds % 60];
  ['days', 'hours', 'minutes', 'seconds'].forEach((id, index) => {
    document.getElementById(id).textContent = String(values[index]).padStart(index ? 2 : 3, '0');
  });
}
updateCountdown(); setInterval(updateCountdown, 1000);

const giftModal = $('#giftModal');
$('#showGift').addEventListener('click', () => giftModal.showModal());
$('.close-modal').addEventListener('click', () => giftModal.close());
giftModal.addEventListener('click', (event) => { if (event.target === giftModal) giftModal.close(); });
document.querySelectorAll('.copy-btn').forEach((button) => button.addEventListener('click', async () => {
  const original = button.textContent;
  try { await navigator.clipboard.writeText(button.dataset.copy); button.textContent = 'Nomor berhasil disalin'; }
  catch (_) { button.textContent = 'Salin: ' + button.dataset.copy; }
  setTimeout(() => { button.textContent = original; }, 1800);
}));

const wishList = $('#wishList');

function showWish(entry, prepend = false) {
  const item = document.createElement('article');
  item.className = 'wish';
  const name = document.createElement('strong');
  name.textContent = entry.name;
  const text = document.createElement('p');
  text.textContent = entry.wish;
  item.append(name, text);
  wishList.querySelector('.empty-wishes')?.remove();
  if (prepend) wishList.prepend(item); else wishList.append(item);
}

// Mengambil ucapan semua tamu menggunakan JSONP agar kompatibel dengan GitHub Pages.
function loadRemoteWishes() {
  if (!GUESTBOOK_ENDPOINT) return;
  const callbackName = `guestbookCallback_${Date.now()}`;
  const script = document.createElement('script');
  window[callbackName] = (response) => {
    if (response?.ok && Array.isArray(response.entries)) response.entries.forEach((entry) => showWish(entry));
    script.remove();
    delete window[callbackName];
  };
  script.onerror = () => { script.remove(); delete window[callbackName]; };
  script.src = `${GUESTBOOK_ENDPOINT}?action=list&callback=${callbackName}`;
  document.head.append(script);
}

$('#guestbookForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const entry = {
    name: String(formData.get('name') || '').trim(),
    guests: String(formData.get('guests') || '1'),
    attendance: String(formData.get('attendance') || ''),
    wish: String(formData.get('wish') || '').trim(),
  };

  showWish(entry, true);
  form.reset();

  if (!GUESTBOOK_ENDPOINT) {
    $('#guestbookMessage').textContent = 'Google Sheets belum dihubungkan. Ucapan hanya tampil sementara di perangkat ini.';
    return;
  }

  // no-cors diperlukan karena website GitHub Pages dan Apps Script memiliki alamat berbeda.
  fetch(GUESTBOOK_ENDPOINT, { method: 'POST', mode: 'no-cors', body: JSON.stringify(entry) })
    .then(() => { $('#guestbookMessage').textContent = 'Terima kasih. Konfirmasi dan ucapan Anda berhasil dikirim.'; })
    .catch(() => { $('#guestbookMessage').textContent = 'Ucapan tampil di halaman ini, tetapi belum berhasil tersimpan. Silakan coba lagi.'; });
});

loadRemoteWishes();
