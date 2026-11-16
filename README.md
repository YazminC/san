# Una cita contigo

Invitación romántica con una estética original de fantasía: una portada ilustrada bajo el cielo nocturno, estandartes y detalles dorados. Incluye una versión Laravel y una versión estática para publicar gratis en GitHub Pages, sin base de datos.

## Tecnologías

- Laravel 13 y PHP 8.5
- React, TypeScript e Inertia
- Material UI
- Laravel guarda invitaciones como JSON privado en `storage/app/private/invitations`
- GitHub Pages comparte la elección mediante un enlace con los detalles seleccionados

## Puesta en marcha en Windows

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
$phpHome = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\PHP.PHP.8.5_Microsoft.Winget.Source_8wekyb3d8bbwe'
$nodeHome = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64'
$env:PATH = "$phpHome;$nodeHome;$env:PATH"
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
composer install
php artisan key:generate
npm.cmd install
npm.cmd run build
.\dev.cmd
```

La aplicación queda en <http://localhost:8000>. `dev.cmd` configura PHP y Node para esta terminal sin reemplazar el PHP de WAMP.

## Personalización

- Edita `INVITATION_NAME` en `.env` para poner su nombre.
- Para la versión estática, establece `VITE_INVITATION_NAME` durante la compilación; si no, se usa “Sandy”.
- Edita `resources/data/invitacion.json` para agregar ciudades o lugares y cambiar las fechas bloqueadas; tanto Laravel como GitHub Pages leen este archivo.
- Usa identificadores únicos para cada ciudad y lugar; `otro` está reservado para el lugar personalizado.
- La versión Laravel guarda las invitaciones en `storage/app/private/invitations`, fuera del directorio público. En su hosting, conserva esa carpeta en almacenamiento persistente.
- GitHub Pages no ejecuta PHP ni ofrece almacenamiento compartido. Su versión estática incluye los detalles en el enlace de agradecimiento; cualquier persona que reciba ese enlace podrá ver la fecha y el lugar seleccionados.
- El diseño utiliza motivos originales de fantasía; no incluye logotipos, personajes ni material oficial de ninguna saga.

## Publicar en GitHub Pages

El workflow de GitHub Actions compila y publica la versión estática automáticamente al subir cambios a `main`.

1. Sube el proyecto a GitHub.
2. En el repositorio, abre **Settings → Pages** y elige **GitHub Actions** como fuente de publicación.
3. Espera a que termine el workflow **Deploy static invitation to GitHub Pages** en la pestaña **Actions**.
4. Comparte `https://yazminc.github.io/san/` con Sandy.

La compilación de Pages se puede probar localmente en Windows:

```powershell
$env:GITHUB_PAGES = 'true'
npm.cmd run build:pages
Remove-Item Env:GITHUB_PAGES
```

Los archivos publicados se generan en `dist/`. No subas esa carpeta al repositorio; GitHub Actions crea y publica el artefacto.

## Validación

```powershell
php artisan test
npm.cmd run build
$env:GITHUB_PAGES = 'true'
npm.cmd run build:pages
Remove-Item Env:GITHUB_PAGES
```
