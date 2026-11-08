# SEO técnico y seguridad — 8 de noviembre de 2026

Fuente solicitada: [freeCodeCamp — How to Find and Fix Common Technical SEO Issues](https://www.freecodecamp.org/news/fix-common-technical-seo-issues).

## Las ocho comprobaciones del artículo

| Recomendación | Aplicación al proyecto |
| --- | --- |
| Estados HTTP y soft 404 | Página 404 bilingüe con noindex, sin redirección ni contenido de inicio. Pruebas HTTP GET y HEAD que exigen 404 en URLs inexistentes. |
| Cadenas de redirecciones | Todos los enlaces internos apuntan a las rutas canónicas. No se generan redirecciones de JavaScript. El Worker opcional normaliza host, protocolo y `/index.html` en un salto; los redirects del servidor de Pages no son configurables aquí. |
| robots.txt | Directivas estándar, sitemap absoluto y comprobación de acceso de Googlebot, Bingbot y GPTBot a cada página pública. |
| noindex accidental | Las 14 páginas públicas se comprueban como indexables. Solo la página de error lleva noindex. Se verifica X-Robots-Tag en la revisión HTTP pública. |
| Canónicas | Una canónica HTTPS propia por página, independiente de parámetros de seguimiento, y alternancias en/es recíprocas. |
| Títulos y descripciones | Se exigen valores únicos y no vacíos en todas las páginas; se ajusta la descripción de galería al contenido fotográfico disponible. |
| Enlaces rastreables | Enlaces HTML reales con href, comprobación de anclas y archivos locales y recorrido desde inicio para detectar páginas huérfanas. |
| Contenido sin JavaScript | Cuerpo, catálogo, navegación y contactos están en HTML. Menú visible también en móvil sin JS; JavaScript mejora la interacción. No se depende de fetch para contenido indexable. |

Además: sitemap derivado de rutas, datos JSON-LD comprobados, texto alternativo/dimensiones de imágenes, CSS/JS con integridad SRI y versiones de caché.

## Capturas de seguridad: estado real

| Control del informe | Publicable en GitHub Pages desde este repositorio | Capa HTTP preparada |
| --- | --- | --- |
| Content-Security-Policy | Meta CSP con hashes, sin unsafe-inline/unsafe-eval. Bloquea inyección de script, handlers inline, frames, objetos y envíos nativos de formulario. No equivale a una cabecera HTTP. | Cabecera CSP y frame-ancestors none. |
| Referrer-Policy | Meta referrer no-referrer, efectiva para el documento. | Cabecera no-referrer. |
| Strict-Transport-Security | HTTPS de Pages está activo, pero este repositorio no controla HSTS. | max-age=31536000, sin asumir otros subdominios. |
| X-Frame-Options | No hay sustituto meta válido. | DENY, además de frame-ancestors. |
| X-Content-Type-Options | No hay sustituto meta válido. | nosniff. |
| Permissions-Policy | No hay sustituto meta válido para estas restricciones. | Cámara, micrófono, ubicación, pagos, USB y sensores desactivados. |
| Cross-Origin-Embedder-Policy | Requiere cabecera. | require-corp. |
| Cross-Origin-Opener-Policy | Requiere cabecera. | same-origin. |
| Cross-Origin-Resource-Policy | Requiere cabecera. | same-origin. |

El banner `Server: GitHub.com` identifica al proveedor y no incluye una versión del servidor. `Access-Control-Allow-Origin: *` permite leer recursos públicos desde otros sitios; no permite escribir en GitHub ni acceder a cuentas. El Worker preparado lo elimina. No se ocultan estos hallazgos con etiquetas que el navegador ignora.

**Límite pendiente:** no existe acceso conectado al DNS/proxy o a un alojamiento con cabeceras configurables. La publicación de este repositorio no activa las nueve cabeceras HTTP en Pages; por ello un escáner de cabeceras puede seguir mostrando una nota baja. La configuración de `edge/` está implementada y probada, pero no desplegada. No se ha migrado el dominio, contratado servicios ni modificado DNS.

## Verificación

- `python scripts/check_site.py`: 14 páginas; generación reproducible y reglas de SEO/CSP/SRI.
- `node --test tests/contact.test.cjs`: preparación de consultas y validación sin envío real.
- `node --test tests/security.test.mjs`: nueve cabeceras, redirects, defensa de open redirect, 404, rechazo de POST y errores del servicio de archivos.
- `python -m unittest discover -s tests -p 'test_*.py'`: cabeceras por HTTP real, 404/HEAD, robots/sitemap/contenido HTML y ausencia de fuentes privadas en el artefacto.
- gstack `/browse`: comprobación del funcionamiento legítimo y bloqueo de una inyección inline de prueba. Las comprobaciones públicas se realizan después del despliegue.

No se garantiza posición en Google, indexación, ausencia total de ataques ni una puntuación de escáner; los controles se verifican por su comportamiento.

Fuentes técnicas: [MDN — CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP), [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages), [Cloudflare — cabeceras](https://developers.cloudflare.com/workers/static-assets/headers/).
