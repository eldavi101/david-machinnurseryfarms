# Contador propio de visitas

Implementado en Python y SQLite, sin servicios de medición externos, cuentas, tokens ni paquetes de terceros. El navegador solo consulta `/api/visits` en el mismo dominio.

## Ejecutarlo

```powershell
python scripts/package_site.py
python scripts/serve.py --port 8002
```

Abrir http://127.0.0.1:8002. El contador del pie incrementa al iniciar una sesión de pestaña. Recargar o cambiar de página/idioma conserva el identificador y no vuelve a sumar. Una nueva sesión suma otra visita. `GET /api/visits` devuelve el total sin modificarlo. `POST /api/visits` registra una sesión y devuelve el total.

La base de datos se guarda en `.data/visits.sqlite3`, fuera de los archivos públicos y excluida de Git. El total sobrevive a reinicios. No borrar esa carpeta al actualizar el sitio. Para cambiar su ubicación, usar `--database RUTA_ABSOLUTA`. Hacer copias de seguridad con la API de backup de SQLite; no copiar únicamente el archivo principal mientras está abierto en modo WAL.

## Alojamiento del dominio

**GitHub Pages no ejecuta Python ni guarda bases de datos. Hacer push o publicar allí no activa este contador.** Para usarlo en el dominio hay que alojar el sitio y esta API en un servidor propio con Python 3, almacenamiento persistente y HTTPS. Este cambio no migra DNS ni toca un VPS.

El proceso escucha solo en loopback. Un proxy HTTPS del mismo servidor debe enviar las peticiones a `127.0.0.1:8002`. Iniciar detrás de ese proxy con:

```powershell
python scripts/serve.py --port 8002 --database /ruta/persistente/visits.sqlite3 --origin https://www.machinnurseryfarms.com
```

No exponer directamente el servidor HTTP de desarrollo a Internet. El proxy debe gestionar TLS, límites de peticiones/cuerpo y conexiones, y servir los archivos de `dist/` o reenviarlos al proceso. No cachear `/api/visits`. Mantener una sola base de datos compartida por los procesos del servidor; no usar copias independientes en varios servidores.

El host opcional de `edge/` tampoco ejecuta esta API Python. Sin el backend el pie muestra «No disponible», nunca un total simulado o un contador exclusivo del navegador.

## Privacidad y límites

- Identificador UUID aleatorio por sesión en `sessionStorage`, sin cookies ni datos del formulario. El servidor guarda solamente su hash, durante un máximo de 30 días, y un total agregado permanente. La limpieza se realiza al registrar visitas nuevas.
- No se guardan IPs en la base de datos. Los registros HTTP del servidor/proxy pueden contenerlas y deben gestionarse por separado.
- Las escrituras y la deduplicación son transacciones atómicas: solicitudes simultáneas y reintentos con el mismo identificador no duplican visitas.
- Si se bloquea `sessionStorage`, cada carga puede contar otra visita. Una sesión abierta más de 30 días puede volver a contar.
- Mide sesiones aproximadas, no personas únicas. Los bots con JavaScript y las peticiones fabricadas pueden aumentar el total. La validación de origen limita peticiones desde otros sitios, pero no sustituye protección contra abuso.
- No recupera visitas anteriores. Las pruebas y vistas locales usan su propia base de datos.

## Verificación

```powershell
node --test tests/visits.test.cjs
python -m unittest discover -s tests -p 'test_*.py'
```
