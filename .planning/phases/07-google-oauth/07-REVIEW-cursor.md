# Phase 07 Review via Cursor (`agent`) — BLOCKED

## Status
`FAILED_AUTH`

## Command
```powershell
$prompt = Get-Content -Raw '.planning/tmp/07-cross-ai-review-prompt.md'; agent -p --output-format text "$prompt" | Out-File -FilePath '.planning/phases/07-google-oauth/07-REVIEW-cursor.md' -Encoding utf8
```

## Error
`Authentication required. Please run 'agent login' first, or set CURSOR_API_KEY environment variable.`

## Why review did not run
CLI `agent` is not authenticated in the current environment. This is an auth blocker, not a sandbox/network/EPERM error.

## Unblock steps
1. Run `agent login` and complete auth flow.
2. Or set `CURSOR_API_KEY` in environment.
3. Re-run the same headless command with `-p --output-format text`.
