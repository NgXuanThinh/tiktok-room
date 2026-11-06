<#
.SYNOPSIS
    Calculates total tokens used across a Multi-Agent session (Host Manager + all Subagents).
.PARAMETER SessionId
    The Conversation ID UUID of the host session.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\get_session_tokens.ps1 -SessionId "cc242e56-7088-4b84-8da3-5bdc18486b87"
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$SessionId
)

$brainRoot = Join-Path $env:USERPROFILE ".gemini\antigravity\brain"
$hostDir = Join-Path $brainRoot $SessionId
$hostLog = Join-Path $hostDir ".system_generated\logs\transcript.jsonl"

if (-not (Test-Path $hostLog)) {
    Write-Error "Session transcript not found: $hostLog"
    exit 1
}

function Get-TokensFromTranscript([string]$path) {
    $res = @{ Input = 0; Output = 0; Cache = 0; Steps = 0 }
    if (Test-Path $path) {
        $lines = Get-Content $path
        foreach ($l in $lines) {
            $obj = $l | ConvertFrom-Json
            if ($obj.input_tokens) { $res.Input += $obj.input_tokens }
            if ($obj.output_tokens) { $res.Output += $obj.output_tokens }
            if ($obj.cache_read_tokens) { $res.Cache += $obj.cache_read_tokens }
            if ($obj.type -eq "PLANNER_RESPONSE") { $res.Steps += 1 }
        }
    }
    return $res
}

# 1. Host Manager Tokens
$hostStats = Get-TokensFromTranscript $hostLog

# 2. Discover Subagents & Map Roles
$hostLines = Get-Content $hostLog
$subagents = @{}

for ($i = 0; $i -lt $hostLines.Count; $i++) {
    $obj = $hostLines[$i] | ConvertFrom-Json
    if ($obj.tool_calls) {
        foreach ($tc in $obj.tool_calls) {
            if ($tc.name -eq "invoke_subagent" -and $tc.args.Role) {
                $roleName = $tc.args.Role.Trim('"')
                # Look ahead for creation response
                for ($j = $i + 1; $j -lt [Math]::Min($i + 4, $hostLines.Count); $j++) {
                    $nextObj = $hostLines[$j] | ConvertFrom-Json
                    if ($nextObj.content -and $nextObj.content -match 'conversationId":\s*"([^"]+)"') {
                        $subId = $matches[1]
                        if (-not $subagents.ContainsKey($subId)) {
                            $subagents[$subId] = $roleName
                        }
                        break
                    }
                }
            }
        }
    }
}

# 3. Aggregate Stats
$report = @()
$report += [PSCustomObject]@{
    Role            = "Host Manager"
    ConversationId  = $SessionId
    Steps           = $hostStats.Steps
    InputTokens     = $hostStats.Input
    OutputTokens    = $hostStats.Output
    CacheReadTokens = $hostStats.Cache
    TotalTokens     = ($hostStats.Input + $hostStats.Output)
}

$grandInput = $hostStats.Input
$grandOutput = $hostStats.Output
$grandCache = $hostStats.Cache
$grandSteps = $hostStats.Steps

foreach ($subId in $subagents.Keys) {
    $roleName = $subagents[$subId]
    $subLog = Join-Path $brainRoot "$subId\.system_generated\logs\transcript.jsonl"
    $subStats = Get-TokensFromTranscript $subLog
    
    $grandInput += $subStats.Input
    $grandOutput += $subStats.Output
    $grandCache += $subStats.Cache
    $grandSteps += $subStats.Steps

    $report += [PSCustomObject]@{
        Role            = $roleName
        ConversationId  = $subId
        Steps           = $subStats.Steps
        InputTokens     = $subStats.Input
        OutputTokens    = $subStats.Output
        CacheReadTokens = $subStats.Cache
        TotalTokens     = ($subStats.Input + $subStats.Output)
    }
}

Write-Host "`n========================= MULTI-AGENT SESSION TOKEN REPORT =========================" -ForegroundColor Cyan
Write-Host "Target Session ID: $SessionId" -ForegroundColor Yellow
Write-Host "Active Subagents:  $($subagents.Count)`n"

$report | Format-Table -AutoSize Role, ConversationId, Steps, InputTokens, OutputTokens, CacheReadTokens, TotalTokens

Write-Host "------------------------------------------------------------------------------------"
Write-Host ("GRAND TOTAL INPUT TOKENS:       {0,12:N0}" -f $grandInput) -ForegroundColor Green
Write-Host ("GRAND TOTAL OUTPUT TOKENS:      {0,12:N0}" -f $grandOutput) -ForegroundColor Green
Write-Host ("GRAND TOTAL CACHE READ TOKENS:  {0,12:N0}" -f $grandCache) -ForegroundColor Gray
Write-Host ("GRAND TOTAL BILLABLE (IN + OUT): {0,12:N0}" -f ($grandInput + $grandOutput)) -ForegroundColor Cyan
Write-Host "====================================================================================`n"
