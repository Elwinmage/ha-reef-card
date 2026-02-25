# ha-reef-card — Unit Tests

## Structure

All test files sit in a **single flat `tests/` directory**:

```
tests/
├── setup.ts              # Global JSDOM mock (<home-assistant> element)
├── vitest.config.ts      # Vitest configuration (place at project root)
│
├── actions.test.ts       # devices/actions.ts    — actionRegistry, run_action()
├── click_handler.test.ts # utils/click_handler.ts — click / double-click / hold
├── common.test.ts        # utils/common.ts        — hexToRgb, rgbToHex, toTime, stringToTime, DeviceList
├── constants.test.ts     # utils/constants.ts     — OFF_COLOR, DEFAULT_ALPHA
├── device.test.ts        # devices/device.ts      — is_on, is_disabled, get_entity, setNestedProperty, load_dialogs, update_config
├── element.test.ts       # base/element.ts        — has_changed, get_style, evaluate, evaluateCondition, run_actions
├── merge.test.ts         # utils/merge.ts         — isObject, mergeDeep, merge
├── myi18n.test.ts        # translations/myi18n.ts — lookup, fallback, language switch, params, dict management
├── SafeEval.test.ts      # utils/SafeEval.ts      — all evaluation modes, context, helpers
└── sensor_target.test.ts # base/sensor_target.ts  — getValue, getTargetValue, getPercentage, hasTargetState
```

## Installation

Add dev-dependencies to the project:

```bash
npm install --save-dev vitest @vitest/coverage-v8 jsdom
```

Copy `vitest.config.ts` to the **project root** (next to `vite.config.ts`).

Add the following scripts to `package.json`:

```json
"test":          "vitest run",
"test:watch":    "vitest",
"test:coverage": "vitest run --coverage"
```

## Running

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Scope

LitElement rendering, shadow-DOM and full component lifecycle are **not** tested
here — those belong to integration / e2e tests (e.g. with Web Test Runner or
Playwright). These unit tests focus exclusively on pure-logic methods that run
without a browser rendering engine.
