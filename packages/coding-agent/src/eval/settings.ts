/**
 * Settings declared by this domain (see `config/registry.ts`). Declaration order is the
 * settings-panel order; `config/all-settings.ts` registers every domain.
 */
import { register } from "../config/registry";

// Eval (per-backend toggles; add more as new backends ship, e.g. eval.ts)
export const cfgEvalPy = register({
	id: "eval.py",
	type: "boolean",
	default: true,
	env: "PI_PY",
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "Python Eval Backend",
		description: "Allow the eval tool to dispatch Python cells to the IPython kernel",
	},
});

export const cfgEvalJs = register({
	id: "eval.js",
	type: "boolean",
	default: true,
	env: "PI_JS",
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "JavaScript Eval Backend",
		description: "Allow the eval tool to dispatch JavaScript cells to the in-process runtime",
	},
});

export const cfgEvalAutoProvision = register({
	id: "eval.autoProvision",
	type: "boolean",
	default: true,
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "Eval Environment Provisioning",
		description: "Automatically create the managed JavaScript eval package environment on first install",
	},
});

export const cfgEvalToolsEnabled = register({
	id: "eval.tools.enabled",
	type: "boolean",
	default: true,
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "Eval-Defined Tools",
		description:
			"Let eval cells define tools (@tool in Python, tool(fn) in JS) that task, agent(), and workpool() subagents can call",
	},
});

export const cfgEvalWorkpoolFreshAgents = register({
	id: "eval.workpool.freshAgents",
	type: "boolean",
	default: false,
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "Fresh Workpool Agents",
		description: "Spawn a new subagent for every workpool item instead of reusing workers or batching queued items",
	},
});

export const cfgEvalAutoBackgroundEnabled = register({
	id: "eval.autoBackground.enabled",
	protocolDefault: ["rpc"],
	type: "boolean",
	default: false,
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "Eval Auto-Background",
		description: "Automatically background long-running eval cells and deliver the result later",
	},
});

export const cfgEvalAutoBackgroundThresholdMs = register({
	id: "eval.autoBackground.thresholdMs",
	protocolDefault: ["rpc"],
	type: "number",
	default: 60_000,
});

// Runtime knobs (consumed by eval backends and the /python slash command)
export const cfgPythonKernelMode = register({
	id: "python.kernelMode",
	type: "enum",
	values: ["session", "per-call"] as const,
	default: "session",
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "Python Kernel Mode",
		description: "Keep the IPython kernel alive across eval calls or start fresh each time",
	},
});

export const cfgEvalKernelIdleMinutes = register({
	id: "eval.kernelIdleMinutes",
	type: "number",
	default: 30,
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "Idle Kernel Shutdown",
		description:
			"Shut down a session's retained Python and JavaScript kernels after this many minutes without a cell; the next cell starts fresh and says earlier state is gone",
		options: [
			{ value: "0", label: "Never", description: "Keep kernels until the session ends" },
			{ value: "10", label: "10 minutes" },
			{ value: "30", label: "30 minutes" },
			{ value: "120", label: "2 hours" },
		],
	},
});

export const cfgPythonInterpreter = register({
	id: "python.interpreter",
	type: "string",
	default: "",
	ui: {
		tab: "shell",
		group: "Eval & Runtimes",
		label: "Python Interpreter",
		description:
			"Optional path to an exact Python executable. When set, automatic Python runtime discovery is skipped.",
	},
});
