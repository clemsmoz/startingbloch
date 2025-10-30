$ErrorActionPreference = 'Stop'

$body = '{"Email":"admin@startingbloch.com","Password":"admin123"}'
Write-Output "Logging in..."
try {
    $resp = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body $body -ErrorAction Stop
    Write-Output "--- LOGIN RESPONSE ---"
    $resp | ConvertTo-Json -Depth 5 | Write-Output
} catch {
    Write-Output "--- LOGIN FAILED ---"
    if ($_.Exception.Response) {
        $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Output $sr.ReadToEnd()
    } else {
        Write-Output $_.Exception.Message
    }
    exit 1
}

$token = $null
if ($resp.token) { $token = $resp.token }
elseif ($resp.data -and $resp.data.token) { $token = $resp.data.token }
elseif ($resp.Data -and $resp.Data.token) { $token = $resp.Data.token }

if (-not $token) {
    Write-Output 'No token found in login response. Aborting.'
    exit 1
}

Write-Output "Token (truncated): $($token.Substring(0,20))..."

Write-Output "Calling DELETE /api/brevet/6"
try {
    $del = Invoke-RestMethod -Uri 'http://localhost:5000/api/brevet/6' -Method Delete -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
    Write-Output "--- DELETE RESPONSE ---"
    $del | ConvertTo-Json -Depth 5 | Write-Output
} catch {
    Write-Output "--- DELETE FAILED ---"
    if ($_.Exception.Response) {
        $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Output $sr.ReadToEnd()
    } else {
        Write-Output $_.Exception.Message
    }
    exit 1
}

Write-Output "Done."