(() => {
  const nav = document.querySelector('#site-nav');
  const scriptPresent = [...document.scripts].some(script => script.src);
  const navigationVisible = nav.getBoundingClientRect().height > 0 && getComputedStyle(nav).display !== 'none';
  if (scriptPresent || document.documentElement.classList.contains('js') || !navigationVisible) throw new Error('Content/navigation depends on JavaScript');
  return { executableScriptOmitted: true, navigationVisible, h1: document.querySelector('h1').textContent, mainTextLength: document.querySelector('main').textContent.trim().length };
})()
