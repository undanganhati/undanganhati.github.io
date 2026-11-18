// Ganti alamat ini jika domain undangan Anda berubah di masa depan.
const INVITATION_URL = 'https://undanganhati.github.io/';

const defaultMessage = `Assalamu'alaikum Warahmatullahi Wabarakatuh,

Kepada Yth. Bapak/Ibu/Saudara/i {nama}

Dengan segala kerendahan hati, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.

Berikut link undangan kami:
{link}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

const form = document.querySelector('#senderForm');
const nameInput = document.querySelector('#recipientName');
const phoneInput = document.querySelector('#recipientPhone');
const messageInput = document.querySelector('#messageTemplate');
const linkPreview = document.querySelector('#invitationLink');
const statusMessage = document.querySelector('#statusMessage');

messageInput.value = defaultMessage;

function personalizedLink() {
  const name = nameInput.value.trim();
  return `${INVITATION_URL}?to=${encodeURIComponent(name)}`;
}

function updatePreview() {
  const link = personalizedLink();
  linkPreview.href = link;
  linkPreview.textContent = link;
}

function whatsappNumber(value) {
  let number = value.replace(/\D/g, '');
  if (number.startsWith('0')) number = `62${number.slice(1)}`;
  if (number.startsWith('8')) number = `62${number}`;
  return number;
}

nameInput.addEventListener('input', updatePreview);
updatePreview();

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const number = whatsappNumber(phoneInput.value);
  const name = nameInput.value.trim();
  if (number.length < 10) {
    statusMessage.textContent = 'Masukkan nomor WhatsApp yang valid, misalnya 081234567890.';
    phoneInput.focus();
    return;
  }

  const message = messageInput.value
    .replaceAll('{nama}', name)
    .replaceAll('{link}', personalizedLink());
  const whatsappUrl = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  statusMessage.textContent = '';
  window.open(whatsappUrl, '_blank', 'noopener');
});
