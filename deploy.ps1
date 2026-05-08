# deploy.ps1 - Quiz da Fe build & deploy helper
#
# Uso:
#   .\deploy.ps1              - instala no emulador E gera AAB (padrao)
#   .\deploy.ps1 emulator     - somente instala no emulador/dispositivo conectado
#   .\deploy.ps1 aab          - somente gera AAB para o Google Play

param(
    [ValidateSet('emulator', 'aab', 'all')]
    [string]$Target = 'all'
)

$ErrorActionPreference = 'Stop'
$AndroidDir = "$PSScriptRoot\android"
$Package    = 'br.com.vargascode.quizdafe'

function Test-DeviceConnected {
    $devices = adb devices 2>&1 | Select-String -Pattern '(emulator|device)$'
    return $devices.Count -gt 0
}

function Install-Emulator {
    Write-Host ''
    Write-Host '>>> Instalando release APK no emulador/dispositivo...' -ForegroundColor Cyan

    if (-not (Test-DeviceConnected)) {
        Write-Host 'ERRO: Nenhum emulador/dispositivo conectado. Abra um emulador primeiro.' -ForegroundColor Red
        return $false
    }

    # Detecta ABI do dispositivo para escolher o APK correto
    $abi = (adb shell getprop ro.product.cpu.abi 2>&1).Trim()
    Write-Host "ABI detectada: $abi" -ForegroundColor DarkCyan

    Push-Location $AndroidDir
    try {
        # Release APK: JS embutido, sem Metro, identico ao que vai para a Play Store
        .\gradlew.bat assembleRelease 2>&1 |
            Select-String -Pattern 'BUILD|Task :app:assemble|error:|FAILURE' |
            ForEach-Object { Write-Host $_.Line }

        if ($LASTEXITCODE -ne 0) {
            Write-Host 'Falha no build.' -ForegroundColor Red
            return $false
        }

        $apkPath = "$AndroidDir\app\build\outputs\apk\release\app-$abi-release.apk"
        if (-not (Test-Path $apkPath)) {
            $apkPath = Get-ChildItem "$AndroidDir\app\build\outputs\apk\release\*.apk" |
                       Select-Object -First 1 -ExpandProperty FullName
            Write-Host "APK para '$abi' nao encontrado, usando: $(Split-Path $apkPath -Leaf)" -ForegroundColor Yellow
        }

        $installOut = adb install -r $apkPath 2>&1
        if ($LASTEXITCODE -ne 0 -and ($installOut | Select-String 'INSTALL_FAILED_UPDATE_INCOMPATIBLE')) {
            Write-Host 'Assinatura incompativel - desinstalando versao anterior...' -ForegroundColor Yellow
            adb uninstall $Package | Out-Null
            $installOut = adb install -r $apkPath 2>&1
        }

        if ($LASTEXITCODE -eq 0) {
            adb shell am start -n "$Package/.MainActivity" | Out-Null
            Write-Host 'App instalado e iniciado com sucesso.' -ForegroundColor Green
            return $true
        } else {
            Write-Host "Falha na instalacao: $installOut" -ForegroundColor Red
            return $false
        }
    } finally {
        Pop-Location
    }
}

function Build-AAB {
    Write-Host ''
    Write-Host '>>> Gerando AAB para o Google Play...' -ForegroundColor Cyan

    Push-Location $AndroidDir
    try {
        .\gradlew.bat bundleRelease 2>&1 |
            Select-String -Pattern 'BUILD|Task :app:bundle|error:|FAILURE' |
            ForEach-Object { Write-Host $_.Line }

        if ($LASTEXITCODE -eq 0) {
            $aabPath = "$AndroidDir\app\build\outputs\bundle\release\app-release.aab"
            $sizeMB  = [math]::Round((Get-Item $aabPath).Length / 1MB, 1)
            Write-Host ''
            Write-Host 'AAB gerado com sucesso!' -ForegroundColor Green
            Write-Host "Caminho : $aabPath" -ForegroundColor White
            Write-Host "Tamanho : $sizeMB MB" -ForegroundColor White
            return $true
        } else {
            Write-Host 'Falha ao gerar AAB.' -ForegroundColor Red
            return $false
        }
    } finally {
        Pop-Location
    }
}

switch ($Target) {
    'emulator' { Install-Emulator | Out-Null }
    'aab'      { Build-AAB | Out-Null }
    'all' {
        $ok = Install-Emulator
        if ($ok) { Build-AAB | Out-Null }
    }
}
