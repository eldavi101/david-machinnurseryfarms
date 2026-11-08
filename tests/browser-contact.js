(() => {
  const form = document.querySelector('#inquiry-form');
  if (!form) throw new Error('Contact form is missing');
  form.elements.name.value = 'Local QA';
  form.elements.email.value = 'qa@example.com';
  form.elements.message.value = 'Local verification only';
  const originalOpen = window.open;
  let captured;
  window.open = url => { captured = url; return null; };
  try {
    form.requestSubmit();
    if (!captured || new URL(captured).hostname !== 'wa.me') throw new Error('WhatsApp handoff failed');
    const status = document.querySelector('#inquiry-status').textContent;
    if (!status.includes('no ha enviado ni guardado')) throw new Error('Incorrect delivery status');
    return { passed: true, openedExternalApp: false, status };
  } finally {
    window.open = originalOpen;
  }
})()
