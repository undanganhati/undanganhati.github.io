const $ = (selector) => document.querySelector(selector);
const invitation = $('#invitation');
const music = $('#bgMusic');
const musicControl = $('#musicControl');

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

$('#guestbookForm').addEventListener('submit', (event) => {
  event.preventDefault(); const data = new FormData(event.currentTarget);
  const item = document.createElement('article'); item.className = 'wish';
  const name = document.createElement('strong'); name.textContent = data.get('name');
  const text = document.createElement('p'); text.textContent = data.get('wish');
  item.append(name, text); const list = $('#wishList'); list.querySelector('.empty-wishes')?.remove(); list.prepend(item); event.currentTarget.reset();
  $('#guestbookMessage').textContent = 'Terima kasih. Konfirmasi dan ucapan Anda sudah dicatat di perangkat ini.';
});
