(() => {
  const script = document.createElement('script');
  script.textContent = 'window.__inlineSecurityProbe = true';
  document.body.append(script);
  const blocked = window.__inlineSecurityProbe !== true;
  script.remove();
  if (!blocked) throw new Error('Inline script injection was not blocked');
  return { inlineScriptBlocked: blocked, referrerPolicy: document.querySelector('meta[name="referrer"]').content, mainScriptLoaded: document.documentElement.classList.contains('js') };
})()
