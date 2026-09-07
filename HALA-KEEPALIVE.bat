@echo off
rem ==================================================================
rem  HALA 2034 - keep-alive watchdog
rem
rem  Started hidden at sign-in by HALA-AUTOSTART.vbs. Every minute it
rem  asks one question: is anything listening on port 3100? If not, it
rem  starts the server again. If yes, it does nothing at all.
rem
rem  STOP-HALA.bat drops logs\autostart-off.flag to switch this off, and
rem  START-HALA.bat removes it. So "stop" means stop, and "start" means
rem  stay running.
rem ==================================================================
setlocal EnableDelayedExpansion
cd /d "%~dp0"

set "PORT=3100"
set "LOG=logs\hala-keepalive.log"

if not exist "logs" mkdir "logs"
echo [%DATE% %TIME%] watchdog started>> "%LOG%"

:loop
if exist "logs\autostart-off.flag" goto sleep

set "FOUNDPID="
for /f "tokens=5" %%p in ('netstat -aon ^| findstr /c:"LISTENING" ^| findstr /c:":%PORT% "') do (
  if not defined FOUNDPID set "FOUNDPID=%%p"
)

if not defined FOUNDPID (
  echo [%DATE% %TIME%] port %PORT% is down - starting HALA>> "%LOG%"
  call "%~dp0START-HALA.bat" /quiet >> "%LOG%" 2>&1
  echo [%DATE% %TIME%] start attempt finished>> "%LOG%"
)

:sleep
rem about 60 seconds between checks
ping -n 61 127.0.0.1 >nul
goto loop
