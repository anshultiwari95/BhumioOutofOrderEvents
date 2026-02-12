export function processEvents(events) {
  const items = new Map();
  const deletedIds = new Set();

  for (const event of events) {
    const { id, type } = event;

    if (deletedIds.has(id)) {
      continue;
    }

    if (type === "created") {
      items.set(id, { ...event });
      continue;
    }

    if (type === "updated") {
      if (items.has(id)) {
        items.set(id, { ...items.get(id), ...event });
      }
      continue;
    }

    if (type === "deleted") {
      deletedIds.add(id);
      items.delete(id);
    }
  }

  return Array.from(items.values());
}

export function createEventProcessor() {
  const events = [];

  return {
    addEvent(event) {
      events.push(event);
    },
    getActiveItems() {
      return processEvents(events);
    },
    reset() {
      events.length = 0;
    },
  };
}
