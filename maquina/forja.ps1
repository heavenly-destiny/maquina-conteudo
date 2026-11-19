# Liga o servidor da Forja no Windows (o atalho "Forja" chama este arquivo escondido).
# Quando a Forja se atualiza sozinha ela sai com 3: aí liga de novo com o código novo.
$env:PYTHONUTF8 = "1"
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
Set-Location $PSScriptRoot
$PY = (py -3.11 -c "import sys; print(sys.executable)").Trim()
$log = Join-Path $PSScriptRoot "painel.log"
do {
  & $PY -X utf8 painel.py *>> $log
  $code = $LASTEXITCODE
  Start-Sleep 1
} while ($code -eq 3)
