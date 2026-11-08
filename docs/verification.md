# Verificación — 8 de noviembre de 2026

Rama: `improvements/site-maintenance`. Base: `origin/main` actualizado mediante `git fetch` (`e8e9c9f`). Se recuperó la arquitectura bilingüe de `9b84865`, integrando fotografías y destinos de contacto de la versión remota.

## Comprobaciones completadas

- Generación de 14 páginas desde contenido y plantilla compartida.
- Enlaces locales y anclas existentes, imágenes con texto alternativo y dimensiones, una cabecera H1 por página.
- Canónicas, alternancias de idioma, JSON-LD y sitemap coherentes.
- Generación reproducible y empaquetado de archivos públicos en `dist/`.
- Sintaxis JavaScript y tres pruebas del formulario: WhatsApp, correo español e información inválida.
- gstack `/browse`: 14 páginas HTTP 200 a 320 px, sin desbordamiento horizontal ni imágenes rotas.
- Menú móvil: apertura y cierre mediante Escape.
- Formulario español probado en navegador, interceptando `window.open`: no se abrió una aplicación externa ni se enviaron consultas.
- Capturas revisadas de inicio móvil, contacto móvil y galería de escritorio.
- Consola limpia tras reiniciar el registro y recorrer las páginas locales.

## Límites

El formulario prepara mensajes; no confirma recepción ni almacena leads. Se reutiliza el correo Gmail del código remoto anterior, sin probar entrega al buzón. Analytics y Bing quedan desactivados hasta disponer de sus identificadores reales. No se han configurado MX, CRM, pagos, cambios DNS ni publicación de producción.

El workflow de validación se ejecuta en GitHub cuando la rama se sube; el resultado remoto debe comprobarse después del push. El workflow de publicación es manual y requiere configurar GitHub Pages para Actions. El artefacto público excluye fuentes, configuración de desarrollo, tests e informes.
