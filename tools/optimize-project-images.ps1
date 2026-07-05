<#
  Optimizes a raw project image folder for the website.

  Usage (from the project root, in PowerShell):
    .\tools\optimize-project-images.ps1 -ProjectFolder "2 My New Project" -Slug "my-new-project"

  What it does:
    - Reads every image (png/jpg/jpeg) inside "<ProjectFolder>"
    - Resizes anything wider than -MaxWidth (default 1400px) down to fit, keeping aspect ratio
    - Re-encodes as JPEG at -Quality (default 82) to keep file sizes web-friendly
    - Saves the results into images\work\<Slug>\ using the SAME numbers as the source
      files (1.jpg, 2.jpg, 3.jpg...), so you still decide which number goes in which
      slot on the page (hero, flavor grid, mockups, etc.) the same way project 1 was laid out.

  This does not touch the HTML. After running it, open images\work\<Slug>\ to see the
  optimized files, then place them into a copy of tools\template-project.html.
#>

param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectFolder,

  [Parameter(Mandatory = $true)]
  [string]$Slug,

  [int]$MaxWidth = 1400,

  [int]$Quality = 82
)

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$srcDir = Join-Path $root $ProjectFolder
$outDir = Join-Path $root "images\work\$Slug"

if (-not (Test-Path $srcDir)) {
  Write-Error "Could not find folder: $srcDir"
  exit 1
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$Quality)

$files = Get-ChildItem -Path $srcDir -Include *.png, *.jpg, *.jpeg -File -Recurse
if ($files.Count -eq 0) {
  Write-Warning "No .png/.jpg/.jpeg files found in $srcDir"
  exit 0
}

foreach ($file in $files) {
  $img = [System.Drawing.Bitmap]::FromFile($file.FullName)

  [int]$srcW = $img.Width
  [int]$srcH = $img.Height

  if ($srcW -gt $MaxWidth) {
    [double]$scale = $MaxWidth / $srcW
    [int]$targetW = $MaxWidth
    [int]$targetH = [int]([Math]::Round($srcH * $scale))
  } else {
    [int]$targetW = $srcW
    [int]$targetH = $srcH
  }

  $resized = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($resized)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.Color]::White)
  $g.DrawImage($img, 0, 0, $targetW, $targetH)
  $g.Dispose()

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  $outPath = Join-Path $outDir "$baseName.jpg"
  $resized.Save($outPath, $jpegCodec, $encParams)

  $inSize = [math]::Round($file.Length / 1MB, 1)
  $outSize = [math]::Round((Get-Item $outPath).Length / 1KB, 0)
  Write-Output "$($file.Name): ${srcW}x${srcH} (${inSize} MB) -> $baseName.jpg: ${targetW}x${targetH} (${outSize} KB)"

  $resized.Dispose()
  $img.Dispose()
}

Write-Output ""
Write-Output "Done. Optimized images are in images\work\$Slug\"
