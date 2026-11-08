# Capa HTTP de seguridad preparada, pendiente de conexión

**Este directorio no está desplegado en el dominio. GitHub Pages no ejecuta el Worker y no interpreta `dist/_headers`.** La CSP y la política de referrer en HTML sí funcionan en Pages; las demás cabeceras necesitan control del servidor/proxy.

`worker.mjs` sirve únicamente el artefacto público mediante el binding ASSETS de Cloudflare Workers y añade las nueve cabeceras de `policy.mjs`, también en errores y redirecciones. Rechaza POST y otros métodos sin pasar datos al servicio de archivos, conserva 404 reales y normaliza HTTP, dominio raíz y `/index.html` en un solo 308. No contiene credenciales, bases de datos, WAF ni limitación de peticiones.

## Requisitos para activarlo

1. Cuenta Cloudflare con control de la zona `machinnurseryfarms.com` y acceso a sus DNS. La zona observada actualmente usa nameservers de GoDaddy; no se han modificado.
2. Revisar todos los registros de DNS, correo y certificados antes de cualquier migración. El Worker está configurado para los dominios raíz y www; conserva la URL canónica www.
3. Revisar el plan y sus límites antes de activar cualquier servicio con cobro. No se ha contratado ni activado ningún servicio.
4. Autenticarse por OAuth o proporcionar un token de despliegue mediante el gestor de secretos del proveedor, nunca en Git ni en el chat.

Con esos requisitos satisfechos, regenerar y probar el artefacto:

```powershell
python scripts/build.py
python scripts/check_site.py
python scripts/package_site.py
node --test tests/security.test.mjs
python -m unittest discover -s tests -p 'test_*.py'
```

Después de revisar la zona y el acceso, un administrador puede publicar con Wrangler usando `edge/wrangler.jsonc`. El archivo declara dominios personalizados; publicarlo modificaría el alojamiento/DNS asociado. Este paso no se ejecutó porque no existe acceso conectado a Cloudflare/DNS.

## Decisiones

- HSTS dura un año y se limita al host: no se añaden `includeSubDomains` o `preload` sin comprobar todos los subdominios.
- `frame-ancestors 'none'` y X-Frame-Options DENY impiden framing cuando las cabeceras se sirven realmente; una meta CSP no puede hacer esto.
- COEP require-corp, COOP same-origin y CORP same-origin son compatibles con los recursos locales actuales. Revisar de nuevo antes de habilitar Analytics o cualquier tercero.
- Se elimina CORS permisivo en la capa configurable. El CORS `*` de Pages no equivale por sí mismo a una vulnerabilidad en este sitio de recursos públicos, que no ofrece una API autenticada.
- La protección de ataques volumétricos y la seguridad de las cuentas de GitHub/DNS se gestionan en sus proveedores; estas cabeceras no sustituyen esos controles.

Referencia: [cabeceras en Cloudflare Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/headers/).
