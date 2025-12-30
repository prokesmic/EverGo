# Mike Test Report

**Generated:** 12/30/2025, 11:46:31 AM
**Environment:** http://localhost:3000 | Chromium

## Summary

| Metric | Value |
|--------|-------|
| Total Tests | 236 |
| Passed | 151 |
| Failed | 85 |
| Skipped | 0 |
| Pass Rate | 64.0% |

## Results by Category

- **navigation**: 12/12 passed
- **button_click**: 93/119 passed
- **link_click**: 9/68 passed
- **form_submission**: 12/12 passed
- **data_validation**: 9/9 passed
- **user_flow**: 2/2 passed
- **accessibility**: 12/12 passed
- **error_handling**: 2/2 passed

## Failed Tests

- ❌ Click "Button" button on Home
  - Error: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(1)')[22m
[2m    - locator resolved to 3 elements. Proceeding with the first one: <button class="h-2 rounded-full transition-all duration-300 w-8 bg-orange-500"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not stable[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  14 × retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m

- ❌ Click "Button" button on Home
  - Error: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(2)')[22m
[2m    - locator resolved to 4 elements. Proceeding with the first one: <button class="h-2 rounded-full transition-all duration-300 w-2 bg-slate-300 hover:bg-slate-400"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not stable[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  14 × retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m

- ❌ Click "Button" button on Home
  - Error: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(3)')[22m
[2m    - locator resolved to 3 elements. Proceeding with the first one: <button class="h-2 rounded-full transition-all duration-300 w-2 bg-slate-300 hover:bg-slate-400"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not stable[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  14 × retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m

- ❌ Click "Button" button on Home
  - Error: locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(4)').first() to be visible[22m
[2m    64 × locator resolved to hidden <button aria-label="Toggle menu" class="md:hidden p-2 rounded-lg transition-colors text-slate-700 hover:bg-slate-100">…</button>[22m

- ❌ Click "Previous testimonial" button on Home
  - Error: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(1)')[22m
[2m    - locator resolved to 3 elements. Proceeding with the first one: <button class="h-2 rounded-full transition-all duration-300 w-8 bg-orange-500"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not stable[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  14 × retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m

- ❌ Click "Next testimonial" button on Home
  - Error: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(2)')[22m
[2m    - locator resolved to 4 elements. Proceeding with the first one: <button class="h-2 rounded-full transition-all duration-300 w-2 bg-slate-300 hover:bg-slate-400"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not stable[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  14 × retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m

- ❌ Click "Go to testimonial 1" button on Home
  - Error: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(1)')[22m
[2m    - locator resolved to 3 elements. Proceeding with the first one: <button class="h-2 rounded-full transition-all duration-300 w-8 bg-orange-500"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not stable[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  14 × retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m

- ❌ Click "Go to testimonial 2" button on Home
  - Error: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(2)')[22m
[2m    - locator resolved to 4 elements. Proceeding with the first one: <button class="h-2 rounded-full transition-all duration-300 w-2 bg-slate-300 hover:bg-slate-400"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not stable[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  14 × retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m

- ❌ Click "Go to testimonial 3" button on Home
  - Error: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(3)')[22m
[2m    - locator resolved to 3 elements. Proceeding with the first one: <button class="h-2 rounded-full transition-all duration-300 w-2 bg-slate-300 hover:bg-slate-400"></button>[22m
[2m  - attempting click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is not stable[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is not stable[22m
[2m  14 × retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m
[2m       - waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 py-3">…</header> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m
[2m    - waiting for element to be visible, enabled and stable[22m
[2m    - element is visible, enabled and stable[22m
[2m    - scrolling into view if needed[22m
[2m    - done scrolling[22m
[2m    - <div class="absolute inset-0 bg-gradient-to-br from-orange-100 via-slate-100 to-red-100 rounded-3xl blur-xl opacity-70"></div> intercepts pointer events[22m
[2m  - retrying click action[22m
[2m    - waiting 500ms[22m

- ❌ Click "Go to testimonial 4" button on Home
  - Error: locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:nth-child(4)').first() to be visible[22m
[2m    65 × locator resolved to hidden <button aria-label="Toggle menu" class="md:hidden p-2 rounded-lg transition-colors text-slate-700 hover:bg-slate-100">…</button>[22m

- ❌ Click "Search...
⌘
K" button on Login
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Search...
⌘
K" button on Register
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Search...
⌘
K" button on Home
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "P" button on Home
  - Error: locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#radix-_r_0_').first() to be visible[22m

- ❌ Click "Search...
⌘
K" button on Activity Create
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Public
Everyone can see" button on Activity Create
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Public
Everyone can see")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Public[22m
[2mEveryone can see") >> nth=0 to be visible[22m

- ❌ Click "Followers
Only followers" button on Activity Create
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Followers
Only followers")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Followers[22m
[2mOnly followers") >> nth=0 to be visible[22m

- ❌ Click "Private
Only you" button on Activity Create
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Private
Only you")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Private[22m
[2mOnly you") >> nth=0 to be visible[22m

- ❌ Click "Search...
⌘
K" button on Challenges
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Search...
⌘
K" button on Rankings
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Search...
⌘
K" button on Teams
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Search...
⌘
K" button on Calendar
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "4" button on Calendar
  - Error: locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('button:has-text("4")').first() to be visible[22m
[2m    64 × locator resolved to hidden <button data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-9 w-10 h-10 rounded-full text-text…>…</button>[22m

- ❌ Click "Search...
⌘
K" button on Settings
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Search...
⌘
K" button on Notifications
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Search...
⌘
K" button on Leaderboard
  - Error: locator.waitFor: Unsupported token "BADSTRING" while parsing css selector "button:has-text("Search...
⌘
K")". Did you mean to CSS.escape it?
Call log:
[2m  - waiting for button:has-text("Search...[22m
[2m⌘[22m
[2mK") >> nth=0 to be visible[22m

- ❌ Click "Log in" link
  - Error: Expected URL to contain "/login". Actual: "http://localhost:3000/"
- ❌ Click "Start Free" link
  - Error: Expected URL to contain "/register". Actual: "http://localhost:3000/"
- ❌ Click "View Leaderboards" link
  - Error: Expected URL to contain "/leaderboard". Actual: "http://localhost:3000/"
- ❌ Click "Twitter" link
  - Error: Expected URL to contain "https://twitter.com/evergo". Actual: "http://localhost:3000/"
- ❌ Click "Instagram" link
  - Error: Expected URL to contain "https://instagram.com/evergo". Actual: "http://localhost:3000/"
- ❌ Click "LinkedIn" link
  - Error: Expected URL to contain "https://linkedin.com/company/evergo". Actual: "http://localhost:3000/"
- ❌ Click "YouTube" link
  - Error: Expected URL to contain "https://youtube.com/evergo". Actual: "http://localhost:3000/"
- ❌ Click "About Us" link
  - Error: Expected URL to contain "/about". Actual: "http://localhost:3000/"
- ❌ Click "Careers" link
  - Error: Expected URL to contain "/careers". Actual: "http://localhost:3000/"
- ❌ Click "Blog" link
  - Error: Expected URL to contain "/blog". Actual: "http://localhost:3000/"
- ❌ Click "Help Center" link
  - Error: Expected URL to contain "/help". Actual: "http://localhost:3000/"
- ❌ Click "Community" link
  - Error: Expected URL to contain "/community". Actual: "http://localhost:3000/"
- ❌ Click "Developers" link
  - Error: Expected URL to contain "/developers". Actual: "http://localhost:3000/"
- ❌ Click "Status" link
  - Error: Expected URL to contain "/status". Actual: "http://localhost:3000/"
- ❌ Click "Privacy Policy" link
  - Error: Expected URL to contain "/privacy". Actual: "http://localhost:3000/"
- ❌ Click "Terms of Service" link
  - Error: Expected URL to contain "/terms". Actual: "http://localhost:3000/"
- ❌ Click "Cookie Policy" link
  - Error: Expected URL to contain "/cookies". Actual: "http://localhost:3000/"
- ❌ Click "GDPR" link
  - Error: Expected URL to contain "/gdpr". Actual: "http://localhost:3000/"
- ❌ Click "⚡EverGo
AURORA" link
  - Error: Expected URL to contain "/home". Actual: "http://localhost:3000/login"
- ❌ Click "Rankings" link
  - Error: Expected URL to contain "/rankings". Actual: "http://localhost:3000/login"
- ❌ Click "Challenges" link
  - Error: Expected URL to contain "/challenges". Actual: "http://localhost:3000/login"
- ❌ Click "Teams" link
  - Error: Expected URL to contain "/teams". Actual: "http://localhost:3000/login"
- ❌ Click "Events" link
  - Error: Expected URL to contain "/calendar". Actual: "http://localhost:3000/login"
- ❌ Click "Log Activity" link
  - Error: Expected URL to contain "/activity/create". Actual: "http://localhost:3000/login"
- ❌ Click "/notifications" link
  - Error: Expected URL to contain "/notifications". Actual: "http://localhost:3000/login"
- ❌ Click "Forgot password?" link
  - Error: Expected URL to contain "/forgot-password". Actual: "http://localhost:3000/login"
- ❌ Click "View all" link
  - Error: Expected URL to contain "/profile/me". Actual: "http://localhost:3000/home"
- ❌ Click "🔍
Find athletes" link
  - Error: Expected URL to contain "/discover". Actual: "http://localhost:3000/home"
- ❌ Click "📨
Invite friends" link
  - Error: Expected URL to contain "/invite". Actual: "http://localhost:3000/home"
- ❌ Click "A" link
  - Error: locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('a[href="/profile/admin_616d68671bed4e3c348d"]').first() to be visible[22m

- ❌ Click "T" link
  - Error: locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('a[href="/profile/cmixi65l800008oxq4tjbb5au"]').first() to be visible[22m

- ❌ Click "MT" link
  - Error: locator.waitFor: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('a[href="/profile/mike_tester_512aa352564688b"]').first() to be visible[22m

- ❌ Click "Discover More Athletes" link
  - Error: Expected URL to contain "/search". Actual: "http://localhost:3000/home"
- ❌ Click "View all" link
  - Error: Expected URL to contain "/events". Actual: "http://localhost:3000/home"
- ❌ Click "Create Challenge" link
  - Error: Expected URL to contain "/challenges/create". Actual: "http://localhost:3000/challenges"
- ❌ Click "View Progress" link
  - Error: Expected URL to contain "/challenges/cmj6wb92x001x8oplly8935mq". Actual: "http://localhost:3000/challenges"
- ❌ Click "View Progress" link
  - Error: Expected URL to contain "/challenges/cmj6wbac6002d8oplstlfqvut". Actual: "http://localhost:3000/challenges"
- ❌ Click "View Progress" link
  - Error: Expected URL to contain "/challenges/cmj6wbbo8002v8oplvdpdjtqq". Actual: "http://localhost:3000/challenges"
- ❌ Click "View all" link
  - Error: Expected URL to contain "/profile/me/stats". Actual: "http://localhost:3000/rankings"
- ❌ Click "Alex Thompson
Prague
890
points" link
  - Error: Expected URL to contain "/profile/alex_champion". Actual: "http://localhost:3000/rankings"
- ❌ Click "Maria Garcia
Prague
845
points" link
  - Error: Expected URL to contain "/profile/maria_swift". Actual: "http://localhost:3000/rankings"
- ❌ Click "James Wilson
Prague
812
points" link
  - Error: Expected URL to contain "/profile/james_runner". Actual: "http://localhost:3000/rankings"
- ❌ Click "4
Sofia Novak
Brno
785
points" link
  - Error: Expected URL to contain "/profile/sofia_cyclist". Actual: "http://localhost:3000/rankings"
- ❌ Click "5
Mike Roberts
Prague
756
points" link
  - Error: Expected URL to contain "/profile/mike_power". Actual: "http://localhost:3000/rankings"
- ❌ Click "6
A
Admin
Prague
742
points" link
  - Error: Expected URL to contain "/profile/admin@evergo.app". Actual: "http://localhost:3000/rankings"
- ❌ Click "7
Emma Chen
Prague
732
points" link
  - Error: Expected URL to contain "/profile/emma_endurance". Actual: "http://localhost:3000/rankings"
- ❌ Click "8
Lucas Brown
Ostrava
698
points" link
  - Error: Expected URL to contain "/profile/lucas_fast". Actual: "http://localhost:3000/rankings"
- ❌ Click "9
Anna Kowalski
Prague
678
points" link
  - Error: Expected URL to contain "/profile/anna_fit". Actual: "http://localhost:3000/rankings"
- ❌ Click "10
David Kim
Prague
645
points" link
  - Error: Expected URL to contain "/profile/david_speed". Actual: "http://localhost:3000/rankings"
- ❌ Click "11
Lisa Martinez
Brno
612
points" link
  - Error: Expected URL to contain "/profile/lisa_strong". Actual: "http://localhost:3000/rankings"
- ❌ Click "Create Team" link
  - Error: Expected URL to contain "/teams/create". Actual: "http://localhost:3000/teams"
- ❌ Click "Running
Brno Endurance Team
Brno
6
#33" link
  - Error: Expected URL to contain "/teams/brno-endurance". Actual: "http://localhost:3000/teams"
- ❌ Click "Cycling
Czech Cycling Club
Prague
6
#55" link
  - Error: Expected URL to contain "/teams/czech-cycling-club". Actual: "http://localhost:3000/teams"
- ❌ Click "Running
Prague Runners Elite
Prague
6
#100" link
  - Error: Expected URL to contain "/teams/prague-runners-elite". Actual: "http://localhost:3000/teams"
- ❌ Click "Sports

Your sports & skill levels" link
  - Error: Expected URL to contain "/settings/sports". Actual: "http://localhost:3000/settings/profile"
- ❌ Click "Personal Bests

Manage your PBs & records" link
  - Error: Expected URL to contain "/settings/personal-bests". Actual: "http://localhost:3000/settings/profile"
- ❌ Click "Subscription

Manage your plan" link
  - Error: Expected URL to contain "/settings/subscription". Actual: "http://localhost:3000/settings/profile"
- ❌ Click "Notifications

Email & push preferences" link
  - Error: Expected URL to contain "/notifications/settings". Actual: "http://localhost:3000/settings/profile"
- ❌ Click "Account

Security & privacy" link
  - Error: Expected URL to contain "/settings/account". Actual: "http://localhost:3000/settings/profile"

## Recommendations

- Pass rate is below 80%. Review failing tests and fix underlying issues.
- Repeated error (8x): "page.click: Timeout 30000ms exceeded.
Call log:
[..." - Consider fixing root cause.
- Repeated error (7x): "locator.waitFor: Timeout 30000ms exceeded.
Call lo..." - Consider fixing root cause.
- Repeated error (14x): "locator.waitFor: Unsupported token "BADSTRING" whi..." - Consider fixing root cause.

---
*Generated by Mike - Master Intelligent Knowledge Engine for Testing*
