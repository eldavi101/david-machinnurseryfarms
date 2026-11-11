# Machin Nursery Farms

Web estática bilingüe: HTML, CSS y JavaScript, con generación mediante Python estándar. Sin paquetes de producción ni backend.

## Desarrollo

```powershell
python scripts/build.py
python scripts/check_site.py
node --check main.js
node --test tests/contact.test.cjs
python scripts/package_site.py
node --test tests/security.test.mjs
python -m unittest discover -s tests -p 'test_*.py'
python scripts/serve.py --port 8001
```

Abrir http://localhost:8001. El servidor local sirve únicamente `dist/`, con respuestas 404 y cabeceras reales. Las rutas parten de `/`; abrir los HTML como archivos no reproduce el hosting.

## Estructura y edición

- `src/pages/`: contenido, títulos, descripciones y JSON-LD de las 14 páginas; `main` contiene el cuerpo HTML.
- `src/layout.html`: plantilla compartida de cabecera, navegación y pie.
- `config/site.json`: dominio, correo, WhatsApp y medición opcional.
- `main.css`, `main.js`: estilos y comportamiento compartidos.
- `assets/images/`: fotografías recuperadas de la versión anterior; `sources.json` registra las URLs de origen.
- `scripts/`: generación, validación y empaquetado.
- `tests/`: pruebas del formulario.
- `robots.txt`, `llms.txt`, `llms-full.txt`: información de rastreo y negocio.

Editar las fuentes y regenerar con `python scripts/build.py`. Guardar también los HTML y sitemap generados. No editar directamente los HTML generados. El sitemap deriva de las rutas, sin fechas de modificación inventadas.

## Consultas y privacidad

El formulario valida datos y prepara el mensaje para WhatsApp o correo. El visitante debe completar el envío en su aplicación. No hay envío automático, confirmación de entrega, almacenamiento de leads, CRM ni IA generativa.

El correo configurado es `machindavid2@gmail.com`, el destino ya utilizado en la versión remota anterior. Los buzones del dominio no están verificados. Si se cambia el correo, actualizar `config/site.json`, los datos estructurados y el contenido editorial.

Las fotografías se sirven localmente y las fuentes son del sistema. Las aplicaciones de WhatsApp y correo tienen sus propias políticas. No guardar contraseñas, tokens privados ni datos de clientes en Git.

## Analytics y Bing

Desactivados por defecto. Configurar `analytics_id` con un ID GA4 real y `bing_verification` con el token público real de verificación. Regenerar y revisar la política de privacidad y requisitos de consentimiento antes de publicar. No se incluyen identificadores ficticios.

## GitHub y hosting

- Remoto: https://github.com/eldavi101/david-machinnurseryfarms.git
- Dominio: www.machinnurseryfarms.com, declarado en CNAME.
- DNS observado: www apunta a eldavi101.github.io; alojamiento en GitHub Pages.
- `.github/workflows/validate.yml` valida pushes y PRs; no despliega.
- `python scripts/package_site.py` crea `dist/` con archivos públicos únicamente.
- El workflow manual `deploy.yml` permite publicar ese artefacto después de configurar Pages para Actions y aprobar el despliegue. El modo de Pages que sirve la raíz de una rama también puede exponer fuentes y utilidades públicas.
- Guardar archivos en el editor no hace push automático. Trabajar en una rama, revisar y enviar cambios aprobados.
- Si GitHub CLI pierde acceso: `gh auth login --hostname github.com --web`. Autenticarse en el navegador; no compartir contraseñas o tokens por chat.

## Pendientes del propietario

- Crear/verificar buzones del dominio y registros MX.
- Obtener ID GA4 y token Bing reales si se desea medición.
- Conectar un receptor/CRM si se requiere almacenamiento de leads.
- Conectar un proxy o alojamiento configurable para activar todas las cabeceras HTTP; GitHub Pages no aplica `_headers` ni configuración de servidor del repositorio.

La rama de mejoras parte del último origin/main leído y recupera las rutas bilingües de la copia local, integrando galería y contacto de la versión anterior. No instala sincronización automática.

## SEO técnico y seguridad

La plantilla publica CSP con hashes y una política de referrer en HTML, además de integridad SRI y versiones de CSS/JS para evitar caché obsoleta. Los enlaces y el contenido principal existen sin JavaScript. `404.html` devuelve una página bilingüe de error cuando Pages responde 404, sin redirigir a inicio.

Las pruebas comprueban títulos/descripciones únicos, robots/noindex, canónicas, hreflang, páginas huérfanas, enlaces, contenido estático, sitemap, JSON-LD e integridad de recursos. Ver [informe técnico](docs/seo-security.md) para el alcance y los límites de las capturas.

`edge/` contiene una capa opcional de alojamiento con las nueve cabeceras HTTP solicitadas. Está probada localmente; no se activa al hacer push a GitHub Pages. Ver [activación de la capa de seguridad](edge/README.md). Pages ya está configurado para publicar mediante Actions; el despliegue sigue siendo manual.

## Contador de visitas

Integraci?n de CounterAPI V2 en el pie biling?e. Pendiente de crear el contador p?blico en la cuenta del propietario y configurar `visit_counter_url`; no hay peticiones externas mientras est? vac?o. Ver [activaci?n, privacidad y limitaciones](docs/visit-counter.md). Pruebas: `node --test tests/visits.test.cjs`.
