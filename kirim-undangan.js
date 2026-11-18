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
const contactPicker = document.querySelector('#contactPicker');

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

// Pemilih kontak hanya tersedia di sejumlah browser HP (misalnya Chrome Android).
const canPickContacts = 'contacts' in navigator && 'ContactsManager' in window;
contactPicker.addEventListener('click', async () => {
  if (!canPickContacts) {
    statusMessage.textContent = 'Browser ini belum mendukung pemilih kontak. Silakan isi nama dan nomor secara manual.';
    return;
  }

  try {
    const available = await navigator.contacts.getProperties();
    const properties = ['name', 'tel'].filter((property) => available.includes(property));
    const contacts = await navigator.contacts.select(properties, { multiple: false });
    const contact = contacts[0];
    if (!contact) return;
    if (contact.name?.[0]) nameInput.value = contact.name[0];
    if (contact.tel?.[0]) phoneInput.value = contact.tel[0];
    updatePreview();
    statusMessage.textContent = 'Kontak sudah dimasukkan. Periksa nomor dan pesan sebelum membuka WhatsApp.';
  } catch (_) {
    // Pengguna bisa menutup pemilih kontak tanpa memilih siapa pun.
  }
});

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
