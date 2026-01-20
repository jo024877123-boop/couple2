if (!(Test-Path public)) { New-Item -ItemType Directory -Force -Path public }
$icon1 = "https://placehold.co/192x192/ff6b7e/ffffff.png?text=Our+Story"
$icon2 = "https://placehold.co/512x512/ff6b7e/ffffff.png?text=Our+Story"
Invoke-WebRequest -Uri $icon1 -OutFile public/pwa-192x192.png
Invoke-WebRequest -Uri $icon2 -OutFile public/pwa-512x512.png
