$data = Get-Content -Raw -Path 'e:\pro\data.json' | ConvertFrom-Json
foreach ($item in $data) {
  $url = $item.image
  $out = Join-Path 'e:\pro\assets' ($item.id.ToString() + '.jpg')
  try {
    Invoke-WebRequest -Uri $url -UseBasicParsing -OutFile $out -Headers @{ 'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } -ErrorAction Stop
    Write-Output "Saved $out"
  } catch {
    Write-Output "Failed $($item.id): $url"
  }
}
