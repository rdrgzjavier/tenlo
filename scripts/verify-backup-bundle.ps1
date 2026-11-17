[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$BundlePath
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$bundle = (Resolve-Path -LiteralPath $BundlePath).Path
$insideRepository = $bundle.Equals($repoRoot, [System.StringComparison]::OrdinalIgnoreCase) -or
  $bundle.StartsWith($repoRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)

if ($insideRepository) {
  throw "La copia no puede almacenarse ni verificarse dentro del repositorio."
}

$requiredFiles = @("roles.sql", "schema.sql", "data.sql", "SHA256SUMS.txt", "control.txt")
foreach ($name in $requiredFiles) {
  $path = Join-Path $bundle $name
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Falta $name en el paquete de copia." }
  if ((Get-Item -LiteralPath $path).Length -eq 0) { throw "$name esta vacio." }
}

$control = Get-Content -LiteralPath (Join-Path $bundle "control.txt") -Raw
foreach ($label in @("Fecha:", "Responsable:", "Proyecto:", "CLI:", "Resultado:")) {
  if (-not $control.Contains($label)) { throw "control.txt no contiene el campo obligatorio $label" }
}
if ($control -match "postgres(?:ql)?://|password=|TENLO_DB_URL") {
  throw "control.txt parece contener una credencial o cadena de conexion."
}

$expected = @{}
foreach ($line in Get-Content -LiteralPath (Join-Path $bundle "SHA256SUMS.txt")) {
  if ($line -match "^([A-Fa-f0-9]{64})\s+\*?(roles\.sql|schema\.sql|data\.sql)$") {
    $expected[$Matches[2]] = $Matches[1].ToUpperInvariant()
  }
}

foreach ($name in @("roles.sql", "schema.sql", "data.sql")) {
  if (-not $expected.ContainsKey($name)) { throw "SHA256SUMS.txt no contiene un hash valido para $name." }
  $actual = (Get-FileHash -LiteralPath (Join-Path $bundle $name) -Algorithm SHA256).Hash
  if ($actual -ne $expected[$name]) { throw "El hash de $name no coincide; la copia esta incompleta o alterada." }
}

Write-Host "OK Paquete de copia integro, fuera del repositorio y sin credenciales visibles en control.txt."
