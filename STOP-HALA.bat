@echo off
setlocal EnableDelayedExpansion
title Stop HALA 2034
cd /d "%~dp0"

set "PORT=3100"

echo ==================================================
echo   Stopping HALA 2034 (port %PORT%)
echo ==================================================
echo.

rem HALA restarts itself by design, so stopping it must also switch the
rem keep-alive off - otherwise the watchdog would bring it back within a
rem minute and "stop" would not mean stop. START-HALA.bat removes the flag.
if not exist "logs" mkdir "logs"
echo stopped by STOP-HALA.bat on %DATE% %TIME%>"logs\autostart-off.flag"
echo Auto-restart switched off until you run START-HALA.bat again.

rem Only the process listening on THIS project's port is touched.
rem There is no blanket taskkill on node.exe, so other projects keep running.
set "FOUNDPID="
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /c:"LISTENING" ^| findstr /c:":%PORT% "') do (
  if not defined FOUNDPID set "FOUNDPID=%%p"
)

if not defined FOUNDPID (
  echo HALA 2034 is not running on port %PORT%. Nothing to stop.
  goto :end
)

echo Stopping PID !FOUNDPID! and its child processes...
taskkill /PID !FOUNDPID! /T /F
if exist "logs\hala.pid" del "logs\hala.pid"
echo.
echo Stopped. Other projects were not touched.

:end
echo.
timeout /t 7 >nul
