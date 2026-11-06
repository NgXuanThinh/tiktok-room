# transition_state.ps1 - Atomic state and metadata manager for Multi-Agent Orchestrator
[CmdletBinding()]
param (
    [Parameter(Mandatory = $true, Position = 0)]
    [string]$TaskId,

    [Parameter(Mandatory = $true, Position = 1)]
    [string]$State,

    [Parameter()]
    [switch]$Init,

    [Parameter()]
    [int]$Round,

    [Parameter()]
    [string[]]$Artifacts,

    [Parameter()]
    [string]$SeniorDevId,

    [Parameter()]
    [string]$TechLeadId,

    [Parameter()]
    [string]$QaId,

    [Parameter()]
    [string]$ResearcherId,

    [Parameter()]
    [string]$Note = "",

    [Parameter()]
    [string]$TaskDir
)

# 1. Resolve task directory
if (-not $TaskDir) {
    $TaskDir = Join-Path ".agent" (Join-Path "tasks" $TaskId)
}

if (-not (Test-Path $TaskDir)) {
    New-Item -ItemType Directory -Path $TaskDir -Force | Out-Null
}

$memoryPath = Join-Path $TaskDir "memory.json"
$eventsPath = Join-Path $TaskDir "events.log"

# 2. Read or initialize memory.json
$mem = $null
if ($Init -or (-not (Test-Path $memoryPath))) {
    $roundVal = if ($Round) { $Round } else { 1 }
    $mem = [PSCustomObject]@{
        task_id = $TaskId
        current_state = $State
        round = $roundVal
        team = "standard"
        interface_change = $false
        needs_external_dependency = $false
        subagents = [PSCustomObject]@{}
        artifacts = [PSCustomObject]@{}
        paths = [PSCustomObject]@{
            src_globs = @(":(glob)src/**", ":(exclude,glob)**/*.test.*")
            test_globs = @(":(glob)tests/**", ":(glob)**/*.test.*")
        }
        baseline = [PSCustomObject]@{
            tests_passing = $true
        }
    }
} else {
    try {
        $rawContent = Get-Content -Path $memoryPath -Raw -Encoding UTF8
        $mem = $rawContent | ConvertFrom-Json
    } catch {
        Write-Error "Failed to parse $($memoryPath): $_"
        exit 1
    }
}

# 3. Update State & Round
$mem.current_state = $State
if ($PSBoundParameters.ContainsKey('Round')) {
    $mem.round = $Round
}

# 4. Update Subagents if provided
if (-not $mem.subagents) {
    $mem | Add-Member -MemberType NoteProperty -Name "subagents" -Value ([PSCustomObject]@{}) -Force
}

if ($SeniorDevId) { $mem.subagents | Add-Member -MemberType NoteProperty -Name "senior_dev" -Value $SeniorDevId -Force }
if ($TechLeadId) { $mem.subagents | Add-Member -MemberType NoteProperty -Name "tech_lead" -Value $TechLeadId -Force }
if ($QaId) { $mem.subagents | Add-Member -MemberType NoteProperty -Name "qa" -Value $QaId -Force }
if ($ResearcherId) { $mem.subagents | Add-Member -MemberType NoteProperty -Name "researcher" -Value $ResearcherId -Force }

# 5. Hash & Register Artifacts
$hashedCount = 0
if ($Artifacts -and $Artifacts.Count -gt 0) {
    if (-not $mem.artifacts) {
        $mem | Add-Member -MemberType NoteProperty -Name "artifacts" -Value ([PSCustomObject]@{}) -Force
    }

    foreach ($art in $Artifacts) {
        if (-not $art) { continue }
        
        $targetFile = $null
        if (Test-Path $art) {
            $targetFile = $art
        } elseif (Test-Path (Join-Path $TaskDir $art)) {
            $targetFile = (Join-Path $TaskDir $art)
        }

        if ($targetFile) {
            $hash = (Get-FileHash -Path $targetFile -Algorithm SHA1).Hash.ToLower()
            $artName = Split-Path -Leaf $targetFile
            $mem.artifacts | Add-Member -MemberType NoteProperty -Name $artName -Value $hash -Force
            $hashedCount++
        }
    }
}

# 6. Save memory.json atomically
try {
    $updatedJson = $mem | ConvertTo-Json -Depth 10
    [System.IO.File]::WriteAllText($memoryPath, $updatedJson, [System.Text.Encoding]::UTF8)
} catch {
    Write-Error "Failed to write $($memoryPath): $_"
    exit 1
}

# 7. Append to events.log
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$roundVal = if ($mem.round) { $mem.round } else { 1 }
$eventMsg = "[$timestamp] STATE_TRANSITION -> $State (Round $roundVal)"
if ($Note) { $eventMsg += " | $Note" }
if ($hashedCount -gt 0) { $eventMsg += " | Artifacts hashed: $hashedCount" }

try {
    [System.IO.File]::AppendAllText($eventsPath, "$eventMsg`n", [System.Text.Encoding]::UTF8)
} catch {
    Write-Warning "Failed to append to $($eventsPath): $_"
}

# 8. Output single-line confirmation for Manager
Write-Output "[STATE_OK] State: $State | Round: $roundVal | Artifacts: $hashedCount | Task: $TaskId"
