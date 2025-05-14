# Copy and rename images from dist/assets to public
Copy-Item -Path "dist/assets/ai-neural.png.png" -Destination "public/ai-neural.png" -Force
Copy-Item -Path "dist/assets/api-cloud.png.png" -Destination "public/api-cloud.png" -Force
Copy-Item -Path "dist/assets/dashboard.png.png" -Destination "public/dashboard.png" -Force

Write-Host "Copied AI neural image: " (Test-Path "public/ai-neural.png")
Write-Host "Copied API cloud image: " (Test-Path "public/api-cloud.png")
Write-Host "Copied Dashboard image: " (Test-Path "public/dashboard.png") 