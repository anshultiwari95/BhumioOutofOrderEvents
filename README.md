# Out of Order Events

Processes events that arrive in random order. Maintains a correct list of active items.

## Implementation

**Core logic** (`src/eventProcessor.js`):

- `processEvents(events)` — batch process an array of events
- `createEventProcessor()` — streaming API: `addEvent()`, `getActiveItems()`, `reset()`

Events are processed in arrival order only (no sorting). Uses a `Map` for items and a `Set` for deleted IDs.

## Edge Cases Handled

- **Late create after delete** — Once deleted, an item never reappears. Late `created` events are ignored.
- **Duplicate events** — Idempotent: same event applied twice has the same effect.
- **Update before create** — `updated` for an unknown id is ignored.
- **Delete before create** — If `deleted` arrives first, later `created` is ignored.

## Run

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```
