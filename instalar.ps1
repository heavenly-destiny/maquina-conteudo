# Instala a Forja neste Windows. Pode rodar quantas vezes quiser: só instala o que falta.
# Nunca apaga a sua camada pessoal (perfil\, .env, vídeos) nem as suas skills e plugins.
# Como rodar: clique com o botão direito > "Executar com o PowerShell"
#   (ou: powershell -ExecutionPolicy Bypass -File instalar.ps1)
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"
[Console]::OutputEncoding = [Text.Encoding]::UTF8
function Ok($t) { Write-Host "  OK  $t" -ForegroundColor Green }
function Passo($t) { Write-Host "`n● $t" -ForegroundColor Red }
function Tem($c) { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function RecarregaPath {
  $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
}
function PoeNoPath($dir) {
  $u = [Environment]::GetEnvironmentVariable("Path", "User")
  if (-not ($u -split ";" | Where-Object { $_ -eq $dir })) { [Environment]::SetEnvironmentVariable("Path", "$u;$dir", "User") }
  RecarregaPath
}
function Winget($id, $cmd) {
  if ($cmd -and (Tem $cmd)) { return }
  winget install --id $id -e --silent --accept-package-agreements --accept-source-agreements | Out-Null
  RecarregaPath
}

$REPO_URL = "https://github.com/heavenly-destiny/maquina-conteudo.git"
$ALVO = Join-Path $HOME "Movies\maquina-conteudo"

Passo "Programas"
if (-not (Tem winget)) { Write-Host "Atualize o 'Instalador de Aplicativos' na Microsoft Store e rode de novo."; exit 1 }
Winget "Git.Git" "git"
Winget "Python.Python.3.11" "py"
Winget "OpenJS.NodeJS.LTS" "node"
Winget "Gyan.FFmpeg" "ffmpeg"
Winget "yt-dlp.yt-dlp" "yt-dlp"
Ok "git, python, node, ffmpeg, yt-dlp"

Passo "Pasta"
# a Forja mora sempre em ~\Movies\maquina-conteudo (o mesmo caminho do Mac, a base de conhecimento usa ele)
if (-not (Test-Path (Join-Path $ALVO ".git"))) {
  New-Item -ItemType Directory -Force (Split-Path $ALVO) | Out-Null
  git clone $REPO_URL $ALVO   # repositório privado: o Git abre o login do GitHub no navegador
  if ($LASTEXITCODE) { Write-Host "Não consegui baixar a Forja. Confira se sua conta do GitHub tem acesso."; exit 1 }
  if ($PSCommandPath -and ((Resolve-Path $PSCommandPath).Path -ne (Join-Path $ALVO "instalar.ps1"))) {
    & powershell -ExecutionPolicy Bypass -File (Join-Path $ALVO "instalar.ps1"); exit $LASTEXITCODE
  }
}
Set-Location $ALVO
Ok $ALVO

Passo "Transcrição (whisper.cpp)"
$WDIR = Join-Path $ALVO "tools\whisper"
if (-not (Tem "whisper-cli")) {
  if (-not (Test-Path (Join-Path $WDIR "whisper-cli.exe"))) {
    $rel = Invoke-RestMethod "https://api.github.com/repos/ggml-org/whisper.cpp/releases?per_page=10" -Headers @{ "User-Agent" = "forja" }
    $asset = $rel | ForEach-Object { $_.assets } | Where-Object { $_.name -eq "whisper-bin-x64.zip" } | Select-Object -First 1
    $zip = Join-Path $env:TEMP "whisper-bin-x64.zip"
    Invoke-WebRequest $asset.browser_download_url -OutFile $zip
    $tmp = Join-Path $env:TEMP "whisper-bin"; Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    Expand-Archive $zip $tmp -Force
    New-Item -ItemType Directory -Force $WDIR | Out-Null
    $exe = Get-ChildItem $tmp -Recurse -Filter "whisper-cli.exe" | Select-Object -First 1
    Copy-Item (Join-Path $exe.DirectoryName "*") $WDIR -Recurse -Force
  }
  PoeNoPath $WDIR
}
$W = Join-Path $HOME ".cache\whisper\ggml-large-v3-turbo.bin"
if (-not (Test-Path $W) -or (Get-Item $W).Length -lt 1MB) {
  New-Item -ItemType Directory -Force (Split-Path $W) | Out-Null
  Write-Host "  baixando o modelo (1,6 GB, só na primeira vez)..."
  Invoke-WebRequest "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo.bin" -OutFile "$W.parte"
  Move-Item "$W.parte" $W -Force
}
Ok "whisper large-v3-turbo"

Passo "Claude Code"
if (-not (Tem "claude")) { Invoke-RestMethod https://claude.ai/install.ps1 | Invoke-Expression; PoeNoPath (Join-Path $HOME ".local\bin") }
Ok "claude"

Passo "Render de vídeo (HyperFrames)"
if (-not (Tem "hyperframes")) { npm install -g hyperframes | Out-Null; RecarregaPath }
Ok "hyperframes"

Passo "Voz e áudio (DeepFilterNet, Demucs)"
$VPY = Join-Path $ALVO "tools\.venv-voz\Scripts\python.exe"
if (-not (Test-Path $VPY)) {
  py -3.11 -m venv (Join-Path $ALVO "tools\.venv-voz")
  & $VPY -m pip install -q --upgrade pip
  & $VPY -m pip install -q -r (Join-Path $ALVO "tools\requirements-voz.txt")
}
Ok "venv de voz"

Passo "Toda a base de conhecimento: skills"
$SK = Join-Path $HOME ".claude\skills"
New-Item -ItemType Directory -Force $SK | Out-Null
$n = 0
Get-ChildItem (Join-Path $ALVO "cerebro\skills") -Directory | ForEach-Object {
  $d = Join-Path $SK $_.Name
  if (-not (Test-Path $d)) { cmd /c mklink /J "$d" "$($_.FullName)" | Out-Null; $n++ }   # junção: não precisa de administrador
}
Ok "$n skills novas ligadas (as que você já tinha ficaram como estavam)"

Passo "Plugins do Claude usados pela Forja"
$PULA = "caveman|ponytail|i-have-adhd|claude-hud|superwhisper|swift-lsp|typescript-lsp|pyright-lsp|php-lsp|codex|vercel|supabase|semgrep|context7"
$pl = Join-Path $ALVO "cerebro\plugins.txt"
if (Test-Path $pl) {
  foreach ($l in Get-Content $pl) {
    $p = $l -split " ", 2
    try {
      if ($p[0] -eq "marketplace") { claude plugin marketplace add $p[1] *> $null }
      elseif ($p[0] -eq "plugin" -and -not (($p[1] -split "@")[0] -match "^($PULA)$")) { claude plugin install $p[1] *> $null }
    } catch {}
  }
}
Ok "hyperframes, gsap, marketing, social media e os outros"

Passo "Atalho"
$PY = (py -3.11 -c "import sys; print(sys.executable)").Trim()
$abrir = Join-Path $ALVO "maquina\abrir.ps1"
$ws = New-Object -ComObject WScript.Shell
$lnk = $ws.CreateShortcut((Join-Path ([Environment]::GetFolderPath("Desktop")) "Forja.lnk"))
$lnk.TargetPath = "powershell.exe"
$lnk.Arguments = "-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$abrir`""
$lnk.IconLocation = "$(Join-Path (Split-Path $PY) 'pythonw.exe'),0"
$lnk.Save()
Ok "Forja na Área de Trabalho: clique pra abrir quando quiser"

Passo "Abrindo"
& powershell -NoProfile -ExecutionPolicy Bypass -File $abrir
Ok "Pronto. Na primeira vez, conecte seu Claude, sua voz e conte quem você é."
