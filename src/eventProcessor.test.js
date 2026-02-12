import { describe, it, expect } from "vitest";
import { processEvents, createEventProcessor } from "./eventProcessor";

describe("processEvents", () => {
  it("handles basic created/updated sequence", () => {
    const events = [
      { id: "a", timestamp: 100, type: "created" },
      { id: "b", timestamp: 200, type: "created" },
      { id: "a", timestamp: 150, type: "updated" },
    ];
    const result = processEvents(events);
    expect(result).toHaveLength(2);
    expect(result.find((i) => i.id === "a").timestamp).toBe(150);
    expect(result.find((i) => i.id === "b").timestamp).toBe(200);
  });

  it("deleted items never reappear (late create)", () => {
    const events = [
      { id: "x", timestamp: 100, type: "created" },
      { id: "x", timestamp: 200, type: "deleted" },
      { id: "x", timestamp: 50, type: "created" },
    ];
    const result = processEvents(events);
    expect(result).toHaveLength(0);
  });

  it("handles duplicate events idempotently", () => {
    const events = [
      { id: "d", timestamp: 100, type: "created" },
      { id: "d", timestamp: 100, type: "created" },
      { id: "d", timestamp: 150, type: "updated" },
    ];
    const result = processEvents(events);
    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe(150);
  });

  it("ignores update before create", () => {
    const events = [
      { id: "y", timestamp: 300, type: "updated" },
      { id: "y", timestamp: 100, type: "created" },
    ];
    const result = processEvents(events);
    expect(result).toHaveLength(1);
    expect(result[0].timestamp).toBe(100);
  });

  it("delete before create: item stays deleted", () => {
    const events = [
      { id: "w", timestamp: 200, type: "deleted" },
      { id: "w", timestamp: 100, type: "created" },
    ];
    const result = processEvents(events);
    expect(result).toHaveLength(0);
  });

  it("does not sort entire list", () => {
    const events = [
      { id: "1", timestamp: 100, type: "created" },
      { id: "2", timestamp: 50, type: "created" },
      { id: "3", timestamp: 200, type: "created" },
    ];
    const result = processEvents(events);
    expect(result.map((i) => i.id)).toEqual(["1", "2", "3"]);
  });
});

describe("createEventProcessor", () => {
  it("streaming API works like batch", () => {
    const p = createEventProcessor();
    p.addEvent({ id: "a", timestamp: 100, type: "created" });
    p.addEvent({ id: "a", timestamp: 150, type: "updated" });
    p.addEvent({ id: "a", timestamp: 200, type: "deleted" });
    expect(p.getActiveItems()).toHaveLength(0);

    p.addEvent({ id: "b", timestamp: 300, type: "created" });
    expect(p.getActiveItems()).toHaveLength(1);

    p.reset();
    expect(p.getActiveItems()).toHaveLength(0);
  });

  it("processes delete even when it has older timestamp than create", () => {
    const p = createEventProcessor();
    p.addEvent({ id: "x", timestamp: 200, type: "created" });
    p.addEvent({ id: "x", timestamp: 100, type: "deleted" });
    expect(p.getActiveItems()).toHaveLength(0);
  });
});
