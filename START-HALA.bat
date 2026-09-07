@echo off
setlocal EnableDelayedExpansion
title HALA 2034 - launcher
cd /d "%~dp0"

set "PORT=3100"
set "URL=http://localhost:%PORT%"
set "LOG=logs\hala-dev.log"

rem /quiet is used by the scheduled task: no browser, no pause, no banner.
set "QUIET="
if /i "%~1"=="/quiet" set "QUIET=1"

if not defined QUIET (
  echo ==================================================
  echo   HALA 2034
  echo   Port: %PORT%
  echo ==================================================
  echo.
)

if not exist "logs" mkdir "logs"

rem ---- keep-alive back on: starting by hand means "stay running" ----
if exist "logs\autostart-off.flag" del "logs\autostart-off.flag" >nul 2>&1

rem ---- already up? then just open the browser ----
call :findpid
if defined FOUNDPID (
  if not defined QUIET (
    echo Already running as PID !FOUNDPID! - opening the browser.
    start "" "%URL%"
  )
  goto :done
)

rem ---- dependencies: first run only, never on every start ----
if not exist "node_modules" (
  echo First run: installing dependencies. This takes a few minutes...
  echo ---- npm install %DATE% %TIME% ---->> "%LOG%"
  call npm install >> "%LOG%" 2>&1
  if errorlevel 1 (
    echo.
    echo npm install FAILED. Open this file to see why:
    echo   %CD%\%LOG%
    echo.
    if not defined QUIET pause
    exit /b 1
  )
)

if not defined QUIET (
  echo Starting the server...
  echo Log file: %CD%\%LOG%
)
echo.>> "%LOG%"
echo ==== start %DATE% %TIME% ====>> "%LOG%"
start "HALA 2034 server" /min cmd /c "npm run dev >> logs\hala-dev.log 2>&1"

rem ---- wait for the port to answer ----
if not defined QUIET echo Waiting for it to come up...
set /a tries=0
:wait
ping -n 3 127.0.0.1 >nul
call :findpid
if defined FOUNDPID goto ready
set /a tries+=1
if !tries! lss 60 goto wait

echo.
echo The server did not come up in time.
echo Open this file to see why:
echo   %CD%\%LOG%
echo.
if not defined QUIET pause
exit /b 1

:ready
if not defined QUIET echo Ready. Server PID is !FOUNDPID!.
>"logs\hala.pid" echo !FOUNDPID!
if not defined QUIET start "" "%URL%"
goto :done

rem ---- which process owns our port? that one, and only that one ----
:findpid
set "FOUNDPID="
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /c:"LISTENING" ^| findstr /c:":%PORT% "') do (
  if not defined FOUNDPID set "FOUNDPID=%%p"
)
exit /b

:done
if defined QUIET exit /b 0
echo.
echo HALA 2034 is running at %URL%
echo It now starts by itself every time you sign in to Windows.
echo You can close this window - the server keeps running.
echo To stop it, double-click STOP-HALA.bat
echo.
timeout /t 8 >nul
