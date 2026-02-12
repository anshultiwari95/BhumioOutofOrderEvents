# Out of Order Events

Processes events that arrive in random order. Maintains a correct list of active items.

## Implementation

- **`src/eventProcessor.js`**: Core logic
  - `processEvents(events)` — Batch processing (O(1) per event)
  - `createEventProcessor()` — Streaming API with `addEvent()`, `getActiveItems()`, `reset()`

Rules: process in arrival order, no full-list sort. Uses a `Map` for items and a `Set` for deleted IDs.

## Edge Cases Handled

| Edge case | Behavior |
|-----------|----------|
| **Late create after delete** | Once an item is deleted, it never reappears. A late `created` event (e.g. timestamp 50 arriving after `deleted` at 200) is ignored. |
| **Duplicate events** | Idempotent. Duplicate `created` overwrites; duplicate `updated` merges; duplicate `deleted` no-ops (already gone). |
| **Update before create** | `updated` for an unknown id is ignored. |
| **Delete before create** | If `deleted` arrives first, we add the id to a tombstone set. When `created` arrives later, it is ignored. |
| **Out-of-order sequence** | Strict arrival order. Each event is processed once; timestamp is not used for ordering. |

**Tombstone rule**: `deletedIds` is permanent for the session. No create or update can bring back a deleted id.

## Run

```bash
npm install
npm run dev
```

## Tests

```bash
npm test
```
