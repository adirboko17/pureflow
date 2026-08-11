$src = "c:\Users\user\OneDrive\Desktop\pureflow\src\assets"
$out = "c:\Users\user\OneDrive\Desktop\pureflow\public\images"
New-Item -ItemType Directory -Force -Path $out | Out-Null

function Convert-Variant($inputPath, $baseName, $width, $qualityWebp = 72, $crfAvif = 36) {
  $webp = Join-Path $out "$baseName-$width.webp"
  $avif = Join-Path $out "$baseName-$width.avif"
  & ffmpeg -y -i $inputPath -vf "scale=${width}:-2" -frames:v 1 -c:v libwebp -quality $qualityWebp $webp 2>$null
  & ffmpeg -y -i $inputPath -vf "scale=${width}:-2" -frames:v 1 -c:v libsvtav1 -crf $crfAvif -preset 10 $avif 2>$null
  if (-not (Test-Path $avif) -or (Get-Item $avif).Length -lt 200) {
    & ffmpeg -y -i $inputPath -vf "scale=${width}:-2" -frames:v 1 -c:v libaom-av1 -crf ($crfAvif + 4) -cpu-used 8 -still-picture 1 $avif 2>$null
  }
  $wSize = if (Test-Path $webp) { [math]::Round((Get-Item $webp).Length / 1KB, 1) } else { 0 }
  $aSize = if (Test-Path $avif) { [math]::Round((Get-Item $avif).Length / 1KB, 1) } else { 0 }
  Write-Host ("{0}-{1}: webp={2}KB avif={3}KB" -f $baseName, $width, $wSize, $aSize)
}

foreach ($w in @(768, 1280, 1536)) {
  Convert-Variant "$src\hero-texas.jpg" "hero" $w 70 38
}

foreach ($name in @("duct1", "duct2", "duct3", "duct4", "chi1", "chi2")) {
  foreach ($w in @(240, 480)) {
    Convert-Variant "$src\$name.png" $name $w 74 40
  }
}

& ffmpeg -y -i "$src\pureflow-logo.png" -vf "scale=320:-2" -frames:v 1 -c:v libwebp -quality 82 "$out\logo-320.webp" 2>$null
& ffmpeg -y -i "$src\pureflow-logo.png" -vf "scale=160:-2" -frames:v 1 -c:v libwebp -quality 82 "$out\logo-160.webp" 2>$null

$total = (Get-ChildItem $out -File | Measure-Object Length -Sum).Sum
Write-Host ("TOTAL_KB=" + [math]::Round($total / 1KB, 1))
Get-ChildItem $out -File | Sort-Object Name | ForEach-Object {
  Write-Host ("{0}`t{1} KB" -f $_.Name, [math]::Round($_.Length / 1KB, 1))
}
