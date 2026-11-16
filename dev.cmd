@echo off
setlocal
set "PHP_HOME=%LOCALAPPDATA%\Microsoft\WinGet\Packages\PHP.PHP.8.5_Microsoft.Winget.Source_8wekyb3d8bbwe"
set "NODE_HOME=%LOCALAPPDATA%\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64"
if not exist "%PHP_HOME%\php.exe" (
    echo No se encontro PHP 8.5. Vuelve a instalarlo con winget.
    exit /b 1
)
if not exist "%NODE_HOME%\node.exe" (
    echo No se encontro Node.js. Vuelve a instalarlo con winget.
    exit /b 1
)
set "PATH=%PHP_HOME%;%NODE_HOME%;%PATH%"
set "INERTIA_SSR_ENABLED=false"
php artisan dev
