[CmdletBinding()]
param(
  [string]$OutputRoot = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$checks = @()

foreach ($command in @("supabase", "docker", "psql")) {
  $available = $null -ne (Get-Command $command -ErrorAction SilentlyContinue)
  $checks += [pscustomobject]@{ Check = "command:$command"; Ready = $available }
}

$dbUrlPresent = -not [string]::IsNullOrWhiteSpace($env:TENLO_DB_URL)
$checks += [pscustomobject]@{ Check = "environment:TENLO_DB_URL"; Ready = $dbUrlPresent }

$outputReady = $false
if (-not [string]::IsNullOrWhiteSpace($OutputRoot)) {
  $absoluteOutput = [System.IO.Path]::GetFullPath($OutputRoot)
  $insideRepository = $absoluteOutput.Equals($repoRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
    $absoluteOutput.StartsWith($repoRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)
  $outputReady = [System.IO.Path]::IsPathRooted($absoluteOutput) -and -not $insideRepository
}
$checks += [pscustomobject]@{ Check = "output:outside_repository"; Ready = $outputReady }

$checks | Format-Table -AutoSize
$missing = @($checks | Where-Object { -not $_.Ready })
if ($missing.Count -gt 0) {
  Write-Error ("Preflight incompleto: " + (($missing | ForEach-Object Check) -join ", "))
  exit 1
}

Write-Host "OK Preflight de copia preparado. No se ha conectado a la base ni escrito datos."
