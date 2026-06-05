# D&A Gestão Financeira - Dev Helper Script
# Run this if npm/node are not in PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")

param(
  [string]$Command = "dev"
)

switch ($Command) {
  "install" { & "C:\Program Files\nodejs\npm.cmd" install }
  "dev"     { & "C:\Program Files\nodejs\npm.cmd" run dev }
  "build"   { & "C:\Program Files\nodejs\npm.cmd" run build }
  "preview" { & "C:\Program Files\nodejs\npm.cmd" run preview }
  default   { & "C:\Program Files\nodejs\npm.cmd" $Command }
}
