# Contador de visitas

El pie de todas las páginas muestra el total compartido de sesiones registrado por CounterAPI V2. No identifica personas únicas: una sesión nueva puede ser la misma persona; los bots con JavaScript y los bloqueadores afectan el total. No recupera visitas anteriores a la activación.

## Activación pendiente

El propietario autorizó CounterAPI. Su panel devolvió HTTP 403 al intentar acceder durante esta implementación. No se creó una cuenta ni un contador, y `visit_counter_url` permanece vacío: el sitio muestra «Pendiente de activación» y no envía peticiones al proveedor.

1. Acceder a https://app.counterapi.dev/ con una cuenta del propietario.
2. Crear un workspace y un contador **público**, por ejemplo `website-visits`. Revisar las condiciones y límites del plan gratuito, sin contratar un plan de pago.
3. Poner la URL pública real `https://api.counterapi.dev/v2/WORKSPACE/COUNTER` en `config/site.json`, campo `visit_counter_url`. Sin `/up`, sin barra final y sin tokens. La URL no crea el contador automáticamente.
4. Ejecutar `python scripts/build.py`, `python scripts/check_site.py`, `node --test tests/visits.test.cjs` y `python scripts/package_site.py`. Publicar los cambios y ejecutar el workflow `deploy.yml`.
5. Abrir el dominio público y comprobar la petición `/up`. Recargar y navegar a español debe consultar el total sin incrementarlo otra vez. Las actualizaciones del proveedor pueden tardar por su caché interna.

Nunca guardar una clave privada en HTML, JavaScript o Git. Si el proveedor requiere autenticación para incrementar el contador elegido, hace falta un backend que guarde el secreto; no publicar esa clave para sortearlo.

## Funcionamiento

- Una petición de incremento por sesión de pestaña, compartida entre páginas e idiomas mediante `sessionStorage`. Al cerrar la pestaña termina normalmente la sesión; algunos navegadores restauran sesiones.
- Sin cookies, nombres, correos, ubicación solicitada ni datos del formulario. El proveedor recibe la IP y metadatos normales de red. Las peticiones omiten credenciales y referrer.
- Si el navegador bloquea `sessionStorage`, se contará una visita por página cargada.
- Las vistas locales y otros hosts no incrementan el contador de producción.
- Los errores muestran «No disponible» sin bloquear el sitio, reintentar incrementos ni inventar un cero.
- Un contador público puede ser consultado o manipulado por terceros que conozcan su URL. Es una métrica orientativa, no un registro de auditoría o identificación de personas.

Documentación: https://docs.counterapi.dev/api/endpoints/v2/ y https://docs.counterapi.dev/javascript/browser/. La V1 fue retirada el 7 de agosto de 2026 y no debe utilizarse.
