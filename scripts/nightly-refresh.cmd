@echo off
rem Foray nightly refresh — run by Windows Task Scheduler.
rem Drives Claude Code headless (Max plan) through .claude/commands/nightly-refresh.md
cd /d "%~dp0.."
echo [%date% %time%] nightly refresh starting >> data-local\refresh-runner.log
call claude -p "/nightly-refresh" --permission-mode acceptEdits >> data-local\refresh-runner.log 2>&1
echo [%date% %time%] nightly refresh exited with %errorlevel% >> data-local\refresh-runner.log
