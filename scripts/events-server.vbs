' Foray events server — hidden launcher (lives in the Startup folder so the
' endpoint is always up when the workstation is logged in).
Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = "C:\Users\wjduv\Desktop\Vibe Coding\commute-curator"
shell.Run "cmd /c node tools\events-server.mjs >> data-local\events-server.log 2>&1", 0, False
