@echo off
REM Multi-Agent Orchestrator Plugin Installer Wrapper
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install.ps1" %*
