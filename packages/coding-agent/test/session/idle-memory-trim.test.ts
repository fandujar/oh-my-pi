import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";
import {
	holdMemoryTrim,
	IDLE_MEMORY_TRIM_DELAY_MS,
	noteQuiet,
	noteRunEnd,
	noteRunStart,
} from "../../src/session/idle-memory-trim";

describe("idle memory trim", () => {
	let shrinkCalls = 0;

	beforeEach(() => {
		vi.useFakeTimers();
		shrinkCalls = 0;
		vi.spyOn(Bun, "gc").mockImplementation(() => 0);
		vi.spyOn(Bun, "shrink").mockImplementation(() => {
			shrinkCalls += 1;
		});
	});

	afterEach(() => {
		// Leave the module idle and unarmed for the next test.
		noteRunStart();
		noteRunEnd();
		vi.advanceTimersByTime(IDLE_MEMORY_TRIM_DELAY_MS);
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("trims once after the process has been quiet for the delay", () => {
		noteQuiet();
		vi.advanceTimersByTime(IDLE_MEMORY_TRIM_DELAY_MS - 1);
		expect(shrinkCalls).toBe(0);
		vi.advanceTimersByTime(1);
		expect(shrinkCalls).toBe(1);
	});

	it("never trims while any session has a run open", () => {
		noteRunStart();
		noteRunStart();
		noteRunEnd();
		vi.advanceTimersByTime(IDLE_MEMORY_TRIM_DELAY_MS * 3);
		expect(shrinkCalls).toBe(0);
		noteRunEnd();
		vi.advanceTimersByTime(IDLE_MEMORY_TRIM_DELAY_MS);
		expect(shrinkCalls).toBe(1);
	});

	it("a run starting inside the quiet window cancels the pending trim", () => {
		noteQuiet();
		vi.advanceTimersByTime(IDLE_MEMORY_TRIM_DELAY_MS / 2);
		noteRunStart();
		vi.advanceTimersByTime(IDLE_MEMORY_TRIM_DELAY_MS);
		expect(shrinkCalls).toBe(0);
		noteRunEnd();
	});

	it("a user command holds the trim while it runs and arms it once it settles, even on failure", async () => {
		const command = Promise.withResolvers<void>();
		const held = holdMemoryTrim(command.promise);
		vi.advanceTimersByTime(IDLE_MEMORY_TRIM_DELAY_MS * 2);
		expect(shrinkCalls).toBe(0);
		command.reject(new Error("exit 1"));
		await expect(held).rejects.toThrow("exit 1");
		vi.advanceTimersByTime(IDLE_MEMORY_TRIM_DELAY_MS);
		expect(shrinkCalls).toBe(1);
	});
});
