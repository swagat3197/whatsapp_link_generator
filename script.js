// script.js - logic for WhatsApp link generator
const phoneInput = document.getElementById('phone');
const genBtn = document.getElementById('gen');
const copyBtn = document.getElementById('copy');
const resetBtn = document.getElementById('reset');
const resultArea = document.getElementById('result-area');
const resultLink = document.getElementById('result-link');
const resultStatus = document.getElementById('result-status');
const messageEl = document.getElementById('message');

function sanitizeInput(raw){
  if (!raw) return '';
  raw = raw.trim();
  raw = raw.replace(/[\u2013\u2014()]/g, '');
  if (raw.startsWith('+')) {
    const digits = raw.slice(1).replace(/\D/g, '');
    return '+' + digits;
  } else {
    return raw.replace(/\D/g, '');
  }
}

function buildWhatsappLink(sanitized){
  if (!sanitized) return { ok:false, reason:'empty' };
  if (sanitized.startsWith('+')) {
    const rest = sanitized.slice(1);
    if (rest.length < 6) return { ok:false, reason:'too-short' };
    return { ok:true, link: `https://wa.me/+${rest}`, display: `+${rest}` };
  }
  const digits = sanitized;
  if (digits.length === 10) {
    return { ok:true, link: `https://wa.me/+91${digits}`, display: `+91${digits}` };
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    const trimmed = digits.slice(1);
    return { ok:true, link: `https://wa.me/+91${trimmed}`, display: `+91${trimmed}` };
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return { ok:true, link: `https://wa.me/+${digits}`, display: `+${digits}` };
  }
  if (digits.length > 10) {
    return { ok:true, link: `https://wa.me/+${digits}`, display: `+${digits}` };
  }
  return { ok:false, reason:'invalid' };
}

function showMessage(text, type){
  messageEl.textContent = text || '';
  messageEl.className = '';
  if (type === 'error') messageEl.classList.add('error');
  if (type === 'success') messageEl.classList.add('success');
}

function generate(){
  const raw = phoneInput.value;
  const sanitized = sanitizeInput(raw);
  if (!sanitized) {
    showMessage('Please enter a phone number.', 'error');
    resultArea.style.display = 'none';
    return;
  }
  const result = buildWhatsappLink(sanitized);
  if (!result.ok) {
    if (result.reason === 'too-short' || result.reason === 'invalid') {
      showMessage('Could not generate link — number looks invalid.', 'error');
    } else {
      showMessage('Invalid input.', 'error');
    }
    resultArea.style.display = 'none';
    return;
  }
  resultLink.href = result.link;
  resultLink.textContent = result.link.replace('https://', '');
  resultStatus.textContent = 'Ready';
  resultStatus.className = 'success';
  resultArea.style.display = 'flex';
  showMessage('Link generated — click or copy.', 'success');
}

function copyLink(){
  if (!resultArea.style.display || resultArea.style.display === 'none') {
    showMessage('Nothing to copy. Generate a link first.', 'error');
    return;
  }
  const text = resultLink.href;
  navigator.clipboard?.writeText(text).then(()=>{
    showMessage('Link copied to clipboard ✅', 'success');
  }).catch(()=> {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showMessage('Link copied to clipboard ✅', 'success');
    } catch (e) {
      showMessage('Could not copy automatically — select and copy the link manually.', 'error');
    }
    ta.remove();
  });
}

function resetForm(){
  phoneInput.value = '';
  resultArea.style.display = 'none';
  showMessage('', '');
}

genBtn.addEventListener('click', generate);
copyBtn.addEventListener('click', copyLink);
resetBtn.addEventListener('click', resetForm);
phoneInput.addEventListener('keydown', (e)=>{ if (e.key === 'Enter') { e.preventDefault(); generate(); } });
phoneInput.addEventListener('paste', (e)=>{ setTimeout(()=> { phoneInput.value = phoneInput.value.replace(/\s+/g,' ').trim(); }, 10); });
phoneInput.addEventListener('input', ()=>{
  const s = sanitizeInput(phoneInput.value);
  if (!s) { messageEl.textContent = ''; return; }
  const preview = buildWhatsappLink(s);
  if (preview.ok){ messageEl.textContent = `Preview: ${preview.display}`; messageEl.className = 'success'; }
  else { messageEl.textContent = ''; messageEl.className = ''; }
});
resetForm();
