# Una cita contigo

Invitación romántica con estética original de fantasía: una portada de cartel con castillo bajo el cielo nocturno, cuatro estandartes de colores y tipografía dorada. La invitada puede elegir una fecha, escoger entre CDMX y Toluca y seleccionar uno de tres planes en cada ciudad. La respuesta se guarda en SQLite y aparece en una página de agradecimiento.

## Tecnologías

- Laravel 13 y PHP 8.5
- React, TypeScript e Inertia
- Material UI
- SQLite

## Puesta en marcha en Windows

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
$phpHome = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\PHP.PHP.8.5_Microsoft.Winget.Source_8wekyb3d8bbwe'
$nodeHome = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64'
$env:PATH = "$phpHome;$nodeHome;$env:PATH"
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
if (-not (Test-Path .\database\database.sqlite)) {
    New-Item -ItemType File -Path .\database\database.sqlite | Out-Null
}
php C:\composer\composer.phar install
php artisan key:generate
php artisan migrate
npm.cmd install
npm.cmd run build
.\dev.cmd
```

La aplicación queda en <http://localhost:8000>. `dev.cmd` configura PHP y Node para esta terminal sin reemplazar el PHP de WAMP.

## Personalización

- Edita `INVITATION_NAME` en `.env` para poner su nombre.
- Edita `config/invitacion.php` para cambiar los textos y los tres planes de cada ciudad.
- El diseño utiliza motivos originales de fantasía; no incluye logotipos, personajes ni material oficial de ninguna saga.
- Las respuestas guardan solo la fecha, la ciudad y el plan elegido en `database/database.sqlite`.

## Validación

```powershell
php artisan test
npm.cmd run build
```
