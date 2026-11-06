# Installer script for Multi-Agent Orchestrator Antigravity Plugin
[CmdletBinding(DefaultParameterSetName = "Project")]
param (
    [Parameter(ParameterSetName = "Project", Position = 0)]
    [Alias("TargetObject", "Target", "Project")]
    [string]$TargetProject = ".",

    [Parameter(ParameterSetName = "Global", Mandatory = $true)]
    [switch]$Global,

    [Parameter()]
    [switch]$Uninstall
)

if (Test-Path (Join-Path $PSScriptRoot "multi-agent-orchestrator")) {
    $sourcePluginDir = Join-Path $PSScriptRoot "multi-agent-orchestrator"
} elseif (Test-Path (Join-Path $PSScriptRoot "skills")) {
    $sourcePluginDir = $PSScriptRoot
} else {
    $sourcePluginDir = Join-Path $PSScriptRoot "multi-agent-orchestrator"
}

if (-not (Test-Path $sourcePluginDir) -and -not $Uninstall) {
    Write-Error "Source plugin directory not found at: $sourcePluginDir"
    exit 1
}

# Determine destination directory
if ($Global) {
    $pluginsDir = Join-Path $env:USERPROFILE ".gemini\config\plugins"
    $destDir = Join-Path $pluginsDir "multi-agent-orchestrator"
    $scopeDesc = "Global (Machine-Wide in $destDir)"
} else {
    $resolvedProject = (Resolve-Path $TargetProject -ErrorAction Stop).Path
    $pluginsDir = Join-Path $resolvedProject ".agents\plugins"
    $destDir = Join-Path $pluginsDir "multi-agent-orchestrator"
    $scopeDesc = "Project-Scoped ($resolvedProject)"
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "MULTI-AGENT ORCHESTRATOR - PLUGIN INSTALLER" -ForegroundColor Cyan
Write-Host "Target Scope: $scopeDesc" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# --- UNINSTALL FLOW ---
if ($Uninstall) {
    if (Test-Path $destDir) {
        Write-Host "Removing plugin from $destDir..." -ForegroundColor Yellow
        Remove-Item -Path $destDir -Recurse -Force
        Write-Host "[SUCCESS] Plugin uninstalled successfully." -ForegroundColor Green
    } else {
        Write-Host "[NOTICE] Plugin was not installed at $destDir." -ForegroundColor Yellow
    }
    exit 0
}

# --- INSTALL FLOW ---
# 1. Create destination directory if needed
if (-not (Test-Path $pluginsDir)) {
    Write-Host "Creating directory: $pluginsDir..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $pluginsDir -Force | Out-Null
}

# 2. Copy plugin files
Write-Host "Installing plugin bundle to $destDir..." -ForegroundColor Yellow
if (Test-Path $destDir) {
    Remove-Item -Path $destDir -Recurse -Force
}
Copy-Item -Path $sourcePluginDir -Destination $destDir -Recurse -Force

# 3. If Project-scoped, ensure .gitignore has .agent/tasks/
if (-not $Global) {
    $gitignorePath = Join-Path $resolvedProject ".gitignore"
    $entry = ".agent/tasks/"
    
    if (Test-Path $gitignorePath) {
        $content = Get-Content -Path $gitignorePath -Raw
        if ($content -notmatch [regex]::Escape($entry)) {
            Write-Host "Adding $entry to $gitignorePath..." -ForegroundColor Yellow
            Add-Content -Path $gitignorePath -Value "`n# Antigravity multi-agent tasks scratchpad`n$entry"
        } else {
            Write-Host "[OK] $entry is already present in .gitignore." -ForegroundColor Green
        }
    } else {
        Write-Host "Creating $gitignorePath with $entry..." -ForegroundColor Yellow
        Set-Content -Path $gitignorePath -Value "# Antigravity multi-agent tasks scratchpad`n$entry"
    }
}

Write-Host "`n[SUCCESS] Multi-Agent Orchestrator Plugin installed successfully!" -ForegroundColor Green
Write-Host "To use in your project chat, type:" -ForegroundColor Cyan
Write-Host "  @[multi-agent-orchestrator] <your task description>`n" -ForegroundColor White
