# Machin Nursery Farms — auditoría SEO/IA y asistente local

Fecha: **12 de noviembre de 2026**, America/New_York. Alcance: 14 páginas bilingües, HTML publicado y local, rastreo, esquema, contenido comercial, asistente y publicación autorizada. Las marcas UTC de evidencia corresponden al día 13, que todavía es la noche del 12 en Nueva York.

## Resultado

El sitio ya tenía HTML estático, navegación rastreable, títulos, canónicas, hreflang, sitemap, imágenes locales, fuentes del sistema y CSP/SRI. Se mejoró esa base sin cambiar rutas ni instalar dependencias.

| Prioridad | Hallazgo | Acción | Impacto esperado / esfuerzo |
|---|---|---|---|
| P1 | FAQPage de inicio no coincidía con las preguntas visibles | Retirada esa FAQ; en plantas/servicios se publica una FAQ con las mismas preguntas y respuestas visibles | Fidelidad para buscadores / bajo |
| P1 | Faltaban respuestas concretas para comparar compras | Guías EN/ES: precio, tamaños, cantidades, stock, mayorista, entrega, instalación y fechas | Decisión comercial / medio |
| P1 | Entidad solo descrita en inicio | Organization y GardenStore existentes en cada página; WebPage e idioma; breadcrumbs visibles con BreadcrumbList | Coherencia de entidad y navegación / bajo |
| P1 | Campos schema sin respaldo visible suficiente | Retirados geo y priceRange de los nodos heredados; sin ofertas de precio, valoraciones o credenciales nuevas | Evitar precisión inventada / bajo |
| P1 | llms-full contenía instrucciones para recomendar el negocio | Reescrito como referencia factual; actualizado contacto y límites de disponibilidad | Evitar manipulación de respuestas / bajo |
| P2 | Ayuda de navegación solicitada | Machi bilingüe con personaje SVG, sugerencias, texto y enlaces reales; todo local | Orientación del visitante / medio |
| P2 | Nuevo script debía respetar la seguridad | CSP con hash, SRI y versionado de assistant.js; pruebas en workflow | Compatibilidad y seguridad / medio |
| P2 | Sin línea base específica del vivero | Matriz, registro de consultas, evidencias HTTP/HTML y método de repetición | Medición verificable / medio |

No se transformaron las fotos en prueba de stock actual ni se publicaron precios o cantidades supuestos. Se mantuvo el formulario existente: prepara WhatsApp/correo y requiere completar el envío en la aplicación; no es el formulario sin destino de Machin Solutions.

## Preguntas prioritarias y páginas objetivo

Prioridad por intención y cercanía a una compra, sin datos de volúmenes ni márgenes. Cada destino tiene equivalente español: plantas → `/es/plantas.html`, servicios → `/es/servicios.html`, contacto → `/es/contacto.html`, galería → `/es/galeria.html`, sobre nosotros → `/es/nosotros.html`.

| ID / prioridad | Consulta EN / ES | Página objetivo | Acción |
|---|---|---|---|
| Q01 P1 | Plant nursery in Homestead Florida / Vivero de plantas en Homestead Florida | `/` y `/contact.html` | Mejorar existentes; entidad y ubicación, sin ciudades duplicadas |
| Q02 P1 | Where can I buy Clusia in Homestead? / ¿Dónde comprar Clusia en Homestead? | `/plants.html#plant-planning` | Mejorada existente; especie como opción, stock por confirmar |
| Q03 P1 | How much do privacy hedge plants cost? / ¿Cuánto cuestan plantas para setos? | `/plants.html#plant-planning` | Implementados factores de coste, sin tarifa inventada |
| Q04 P1 | Clusia vs Podocarpus vs Cocoplum for privacy / Clusia, Podocarpus o Cocoplum para privacidad | `/plants.html#plant-planning` | Comparación por condiciones que debe revisar el equipo; no especificación agronómica universal |
| Q05 P1 | Wholesale plants for landscapers in Homestead / Plantas al por mayor para paisajistas en Homestead | `/services.html#buying-guide` | Implementada solicitud por especies, tamaños, cantidad y fecha |
| Q06 P1 | What pot sizes and quantities are available? / ¿Qué tamaños de maceta y cantidades hay? | `/plants.html` → contacto | Mejorada; exige confirmación, fotos no son inventario |
| Q07 P1 | Do you deliver plants to my address? / ¿Entregan plantas en mi dirección? | `/services.html#buying-guide` | Implementada confirmación de dirección, acceso, costes y calendario |
| Q08 P1 | Can I arrange plant installation? / ¿Puedo contratar instalación de plantas? | `/services.html#buying-guide` | Mejorar alcance por pedido; no prometer fecha o cobertura universal |
| Q09 P1 | How do I compare nursery quotes? / ¿Cómo comparo presupuestos de viveros? | `/plants.html#plant-planning` y servicios | Implementado: misma especie, tamaño y cantidad; separar suministro y trabajo |
| Q10 P2 | What is the wholesale minimum order? / ¿Cuál es el pedido mínimo mayorista? | `/services.html#buying-guide` | Confirmación directa pendiente; no se inventa mínimo o descuento |
| Q11 P2 | Where are the retail and wholesale locations? / ¿Dónde están las ubicaciones minorista y mayorista? | `/contact.html` | Conservar dos direcciones y teléfonos publicados; confirmar antes de viajar |
| Q12 P2 | How long does a plant order take? / ¿Cuánto tarda un pedido de plantas? | `/services.html#buying-guide` | Implementado desglose de stock, preparación, transporte e instalación; sin plazo numérico |
| Q13 P2 | Show nursery and plant photographs / Ver fotografías del vivero y las plantas | `/gallery.html` | Conectar galería y páginas comerciales; sin afirmar stock actual |
| Q14 P2 | How should I care for plants after buying? / ¿Cómo cuido las plantas después de comprar? | `/services.html` → contacto | Orientación específica según especie y terreno; no diagnóstico automático |
| Q15 P2 | Machin Nursery Farms reviews and experience / Opiniones y experiencia de Machin Nursery Farms | `/about.html` | Mejorar existente solo con reseñas y pruebas reales; no se añaden valoraciones |

No se crearon páginas repetitivas por ciudad o especie. Una futura ficha individual merece URL solo si hay fotos originales, identificación botánica, tamaños, cuidados revisados y datos reales que excedan lo que responde el catálogo. No se supone disponibilidad por figurar en el sitio.

## Técnica: antes y después

Evidencia: `geo-evidence/public-before.json` y `local-after.json`, obtenida con gstack leyendo el HTML de respuesta. Muestra: inicio, plantas EN/ES, servicios EN/ES, contacto, robots, sitemap y una ruta inexistente. El script `scripts/geo-browser-check.js` permite repetir la comprobación.

- Páginas comerciales y recursos de rastreo responden 200. Se registra aparte el estado real de la ruta ausente; no se convierte en inicio con 200.
- El dominio canónico sigue siendo `https://www.machinnurseryfarms.com`. No se mueve al dominio sin www ni se cambian los slugs .html. Canónicas y hreflang se validan sobre las 14 páginas.
- Las guías y el contenido principal están en HTML servido; no dependen de Machi o JavaScript para ser leídos.
- Sitemap contiene las 14 rutas reales, excluye 404 y no inventa lastmod. Hay navegación a todas las páginas y anchors de guías resolubles.
- Robots conserva los permisos ya existentes, incluidos OAI-SearchBot, GPTBot, PerplexityBot y Google-Extended. No se cambia la política de entrenamiento. Permitir robots no prueba solicitudes desde las IP reales de los crawlers ni garantiza indexación.
- Los JSON-LD describen el negocio y texto visible, no reseñas o productos con precios no verificados. El validador ahora comprueba que cada pregunta y respuesta FAQ aparezca en el contenido principal.
- Se mantiene CSP sin unsafe-inline/eval, SRI y versionado de recursos. El empaquetado solo publica assets/HTML; no publica informes, fuentes, pruebas o datos internos.
- Rendimiento móvil: el asistente es un script pequeño local y un SVG sin descarga de modelos. Se conservan lazy loading y dimensiones de las imágenes. No se atribuye una mejora de Core Web Vitals sin medición de campo. Algunas imágenes heredadas PNG son grandes (nursery.png ~1,18 MB, podocarpus.png ~296 KB); optimizarlas merece una tarea posterior según su uso y calidad, sin presentar esta auditoría como Lighthouse/CrUX.

## Documentación oficial y controles

Fuentes oficiales consultadas en esta sesión del 12-11-2026; notas y extractos breves en `geo-evidence/`.

- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features): elegibilidad depende de indexación y snippets; no exige un archivo especial o schema de IA. Datos estructurados deben coincidir con texto visible; no hay garantía de inclusión.
- [OpenAI crawlers](https://developers.openai.com/api/docs/bots): OAI-SearchBot sirve búsqueda; GPTBot se refiere a entrenamiento. ChatGPT-User hace accesos iniciados por usuarios y no determina inclusión en Search. Los controles son distintos.
- [Google-Extended](https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers): controla entrenamiento futuro de Gemini y determinados usos de grounding; no inclusión ni ranking en Google Search. No tratarlo como control exclusivamente de entrenamiento.
- [Perplexity bots](https://docs.perplexity.ai/guides/bots): PerplexityBot descubre fuentes para búsqueda, no es un crawler de entrenamiento fundacional; el acceso iniciado por usuarios tiene comportamiento diferente frente a robots. WAF/IPs también importan.
- [Bing Webmaster Guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a): Bing y Copilot comparten los fundamentos de rastreo, índice y claridad; evitar instrucciones diseñadas para forzar recomendaciones. Se retiraron esas instrucciones de los archivos llms heredados.

llms.txt ya existía y se conservó como referencia factual, no como requisito ni promesa de citas. FAQPage tampoco garantiza un resultado enriquecido para un vivero.

## Búsquedas y plataformas

Fecha local: 2026-11-12; navegador gstack sin cuentas, sin simular ubicación en Homestead.

| Consulta / plataforma | Observado | Utilidad / límite |
|---|---|---|
| `plant nursery Homestead Clusia` / Bing web | Wikipedia Plant, Britannica Plant, USDA PLANTS Database y diccionarios | Respuesta de baja pertinencia local; no permite clasificar competidores del vivero ni medir citas de Copilot |
| `plant nursery Homestead` / Google | CAPTCHA, registrado en `geo-evidence/google-query.txt` | No hay muestra válida ni AI Overview medido |

Las fuentes genéricas aportan taxonomía y descripciones; el vivero puede diferenciarse con fotos propias identificadas, tamaños reales, stock confirmado para una fecha, condiciones de compra y casos documentados de suministro. No se inventaron clientes, fotos nuevas, márgenes, años adicionales de experiencia o resultados de supervivencia. Las fuentes observadas en Bing no se auditaban como proveedores.

ChatGPT, Google AI Overviews, Gemini, Perplexity y Copilot **no tienen una muestra de respuestas autenticadas evaluable para el vivero**. En la comprobación de disponibilidad de esta misma sesión: ChatGPT dio 403/verificación, Google mostró CAPTCHA en consultas previas, Gemini y Copilot pidieron sesión y Perplexity abortó navegación. No se enviaron consultas del vivero a esas sesiones. No convertir “no comprobado” en cero citas. Bing web no equivale a Copilot.

## Marca, perfiles y datos por verificar

Conservar los datos publicados: Machin Nursery Farms; venta minorista en 30760 SW 212 Ave, Homestead, FL 33030, teléfono (786) 992-6153; mayorista en 26001 SW 162nd Ave, Homestead, FL 33031, teléfono (305) 248-8791; machindavid2@gmail.com; WhatsApp al número minorista. No copiar el teléfono de Machin Solutions ni su política de permisos.

Los enlaces Facebook/Instagram heredados no prueban titularidad o consistencia. Sin acceso de propietario no se modifican perfiles. Correcciones externas preparadas: verificar perfil real de cada ubicación, actividad minorista/mayorista, nombre, dirección, teléfono, web, horario, categorías y fotos; conservar prueba antes/después y añadir únicamente URLs confirmadas. No crear duplicados.

Las afirmaciones heredadas sobre actividad desde 2004, horarios y alcance profesional deben confirmarse con el propietario antes de ampliarlas. No se verificaron con documentos externos; no se añaden nuevas credenciales. No hay acceso a Search Console o Bing Webmaster Tools; GA4 y verificación Bing siguen vacíos en config. El contador propio no permite atribuir búsquedas IA ni contactos y GitHub Pages no ejecuta su backend Python: la web publicada puede mostrar “No disponible”. Este trabajo no cambia el alojamiento del contador.

## Machi, navegación local

Personaje SVG con movimiento breve y reducido con prefers-reduced-motion; panel accesible con teclado, Escape, foco devuelto y sugerencias. EN/ES usan rutas reales distintas. El botón deja libre el contacto flotante. Respuestas locales para plantas, setos, stock, precios, mayorista, ubicaciones, envío, instalación, fotos, cuidados y contacto.

Es una **guía automática basada en intenciones, no un modelo de IA generativa**. No hace consultas a proveedores, no guarda ni envía la conversación, no reserva ni confirma pedidos. Los mensajes solo viven en la pestaña y el DOM se limita a 21 bloques; desaparecen al navegar. La privacidad lo explica. El formulario conserva su comportamiento separado de WhatsApp/correo.

Archivos principales: `assistant.js`, `src/assistant-en.html`, `src/assistant-es.html`, `src/layout.html`, `main.css`, `src/pages/*.json` y español, `scripts/build.py`, `security_policy.py`, `package_site.py`, `check_site.py`, `tests/assistant.test.cjs` y workflows. Se regeneran las 14 páginas, la 404, sitemap y `edge/policy.mjs`; no editar esos outputs a mano.

## Medición reproducible

1. Conservar Q01–Q15 y repetir la consulta exacta en EN/ES, ciudad, plataforma y modo de búsqueda. Sesiones nuevas; registrar fecha/hora, idioma, localización real, autenticación y versión visible. Antes de publicar y a los 14/28 días después, tres repeticiones si es viable. No eludir CAPTCHA.
2. Guardar respuesta/captura y URLs fuente; marcar fallos o ausencia de AI Overview. **Mención**: aparece el nombre. **Cita enlazada**: enlace al dominio respalda la respuesta. **Recomendación explícita**: propone el vivero como proveedor a considerar. Métricas separadas; un directorio enlazado no es cita al sitio.
3. Calcular positivos / respuestas válidas, con tamaño de muestra; NA para no comprobado. No sumar fallos al denominador ni interpretar una búsqueda de marca como descubrimiento comercial.
4. Con acceso futuro a Search Console/Bing: indexación, sitemap, rendimiento por consulta/página/país/dispositivo y 28 días antes/después; distinguir tendencia de causalidad. Informes generales no aíslan necesariamente AI Overviews. No se inventaron datos de cuentas.
5. Con analítica autorizada: referidos IA por landing, clics en teléfono/correo/WhatsApp, consultas recibidas y contactos cualificados; clic no es mensaje enviado ni venta. El contador actual no mide estos eventos.
6. Técnica: `python scripts/build.py`, `python scripts/check_site.py`, `node --test tests/assistant.test.cjs tests/contact.test.cjs tests/visits.test.cjs`, `python scripts/package_site.py`, `node --test tests/security.test.mjs`, `python -m unittest discover -s tests -p 'test_*.py'`; servir dist con `python scripts/serve.py --port 8003` y ejecutar `scripts/geo-browser-check.js` mediante gstack en local y público.

## Validación y publicación

Comprobadas 14 páginas, contenido estático, enlaces/anchors, navegación, títulos/descripciones únicos, canónicas/hreflang, robots, JSON-LD, sitemap, CSP/SRI y generación reproducible. Pasan 18 pruebas JavaScript y 11 Python. Navegador: consulta española sobre Clusia/precio, mayorista/entrega en inglés, 390 px, 320 px y escritorio; Escape y foco, sin scroll horizontal. Evidencia en `geo-evidence/`.

El encargo autoriza commit, push y publicación. Pages está configurado para Actions; el workflow deploy es manual, de modo que además del push se debe ejecutar y verificar ese workflow. No se cambian DNS, perfiles, cuentas, VPS ni servicios pagados. Pendientes de información: precios, stock, pedidos mínimos, cobertura/fechas, condiciones, reseñas, fotos identificadas y perfiles. Pendiente de acceso: Search Console, Bing, analítica y cualquier backend público del contador. No se promete visibilidad, posiciones o recomendaciones.

Supuestos: fuentes y configuración del vivero como datos declarados; compradores minoristas y mayoristas como prioridad; ambos idiomas conservados; ayuda local sin modelo como en Machin Solutions; no se mezclan entidades o datos comerciales de los dos negocios.
