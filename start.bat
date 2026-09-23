@echo off
title muskan-sky launcher
echo ===================================================
echo   Starting muskan-sky: Ghibli Starry Sanctuary...
echo ===================================================
echo.

where python >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching with Python on http://localhost:3000 ...
    start http://localhost:3000
    python -m http.server 3000
    goto end
)

where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo Launching with npx serve on http://localhost:3000 ...
    start http://localhost:3000
    npx serve -l 3000
    goto end
)

echo Notice: Neither Python nor Node was found in PATH.
echo Opening index.html directly in browser...
start index.html

:end
pause
