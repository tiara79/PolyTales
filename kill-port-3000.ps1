# 3000번 포트 사용 중인 프로세스 강제 종료 (Windows PowerShell)
$port = 3000
$pidList = netstat -ano | Select-String ":$port" | ForEach-Object {
    ($_ -split '\s+')[-1]
} | Select-Object -Unique

foreach ($pid in $pidList) {
    if ($pid -match '^\d+$') {
        Write-Host "Killing PID $pid on port $port"
        taskkill /PID $pid /F
    }
}
