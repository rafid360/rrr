Param()

$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:5000"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Write-Host "Logging in as admin..." -ForegroundColor Cyan
$adminEmail = $env:ADMIN_EMAIL
if ([string]::IsNullOrEmpty($adminEmail)) { $adminEmail = 'admin@fastedge.local' }
$adminPass = $env:ADMIN_PASSWORD
if ([string]::IsNullOrEmpty($adminPass)) { $adminPass = 'ChangeMe123!' }
$loginBody = @{ email=$adminEmail; password=$adminPass } | ConvertTo-Json
Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody -WebSession $session | Out-Null

Write-Host "Submitting sample text to /api/openai/extract-customers ..." -ForegroundColor Cyan
$inputText = @'
1) John Doe, john@example.com, +1-555-1234
Address: 12 Main St, Springfield, IL 62704, USA

2) Jane Smith (jane.smith@example.org), +44 20 7946 0958
Address: 221B Baker Street, London NW1 6XE, UK
'@

$body = @{ text = $inputText } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "$base/api/openai/extract-customers" -Method Post -ContentType 'application/json' -Body $body -WebSession $session

Write-Host "Response:" -ForegroundColor Green
$response | ConvertTo-Json -Depth 6