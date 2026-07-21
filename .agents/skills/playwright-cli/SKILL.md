---
name: playwright-cli
description: Playwright CLI integration for browser automation, page interaction testing, screenshots, and visual testing.
---

# Playwright CLI Skill

This skill enables the agent to use Playwright CLI for testing and browser automation tasks in the workspace.

## Setup
To run tests or automation:
1. Install Playwright if not already installed: `npm install -D @playwright/test`
2. Install browser binaries: `npx playwright install`

## Core Commands
- **Run all tests**: `npx playwright test`
- **Run a specific test file**: `npx playwright test path/to/test.spec.js`
- **Open HTML Report**: `npx playwright show-report`
- **Record user interactions (codegen)**: `npx playwright codegen`
- **Take a screenshot of a page**: `npx playwright screenshot <url> <output-file>`
