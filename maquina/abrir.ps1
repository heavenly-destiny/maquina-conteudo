# Atalho "Forja" da Área de Trabalho: liga o servidor se estiver desligado e abre no navegador.
function NoAr { try { Invoke-WebRequest "http://127.0.0.1:4747/api/estado" -UseBasicParsing -TimeoutSec 1 | Out-Null; $true } catch { $false } }
if (-not (NoAr)) {
  Start-Process powershell -WindowStyle Hidden -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSScriptRoot\forja.ps1`""
  for ($i = 0; $i -lt 40 -and -not (NoAr); $i++) { Start-Sleep -Milliseconds 400 }
}
Start-Process "http://127.0.0.1:4747/?app=1"
