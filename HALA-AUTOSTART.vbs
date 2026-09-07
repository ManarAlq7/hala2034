' ==================================================================
'  HALA 2034 - hidden launcher
'
'  A copy of this file sits in the Windows Startup folder, so it runs
'  every time you sign in. It starts the keep-alive watchdog with no
'  console window, and the watchdog keeps HALA up from then on.
'
'  Nothing here needs administrator rights.
' ==================================================================

Dim shell, fso, root, watchdog

root = "C:\Users\96653\hala2034"
watchdog = root & "\HALA-KEEPALIVE.bat"

Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FileExists(watchdog) Then
  ' The project moved or was renamed - stay quiet rather than pop errors
  ' at every sign-in.
  WScript.Quit 0
End If

Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = root
' 0 = hidden window, False = do not wait for it to finish
shell.Run """" & watchdog & """", 0, False
