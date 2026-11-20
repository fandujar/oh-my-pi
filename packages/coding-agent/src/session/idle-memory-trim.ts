/**
 * Return memory to the OS once the process has been quiet for a while.
 *
 * After a turn, the JS heap still holds garbage and the allocator keeps freed
 * pages committed, so an idle session sits at its peak footprint until macOS
 * swaps it out. A full collection followed by `Bun.shrink()` releases those
 * pages: measured at 20-26 MB per session across fresh and resumed sessions.
 *
 * Process-wide: every session in the process (subagents included) re-arms the
 * same timer, so the trim runs once, after the last of them goes quiet.
 */
import { logger } from "@oh-my-pi/pi-utils";

/** Quiet time before trimming; long enough that typing the next prompt never meets the pause. */
export const IDLE_MEMORY_TRIM_DELAY_MS = 90_000;

let timer: NodeJS.Timeout | undefined;
let busy = 0;

function trim(): void {
	timer = undefined;
	if (busy > 0) return;
	const started = performance.now();
	Bun.gc(true);
	Bun.shrink();
	logger.debug("Idle memory trim", { ms: Math.round(performance.now() - started) });
}

function arm(): void {
	clearTimeout(timer);
	timer = setTimeout(trim, IDLE_MEMORY_TRIM_DELAY_MS);
	timer.unref?.();
}

/** A run started: no trim until every run has ended. */
export function noteRunStart(): void {
	busy += 1;
	clearTimeout(timer);
	timer = undefined;
}

/** The process may be quiet now (a session finished starting): trim later unless a run starts. */
export function noteQuiet(): void {
	if (busy === 0) arm();
}

/** A run ended: trim once the process has been quiet for {@link IDLE_MEMORY_TRIM_DELAY_MS}. */
export function noteRunEnd(): void {
	busy = Math.max(0, busy - 1);
	if (busy === 0) arm();
}
