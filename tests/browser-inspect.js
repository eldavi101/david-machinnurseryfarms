(() => ({
  title: document.title,
  language: document.documentElement.lang,
  overflow: document.documentElement.scrollWidth > innerWidth,
  failedImages: [...document.images].filter(image => !image.complete || !image.naturalWidth).map(image => image.src),
  h1Count: document.querySelectorAll('h1').length,
  form: Boolean(document.querySelector('#inquiry-form')),
}))()
