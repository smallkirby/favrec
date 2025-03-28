import { type ChildProcess, spawn } from 'node:child_process';

let emulatorProcess: ChildProcess | null;

async function globalSetup() {
  emulatorProcess = spawn('npm', ['run', 'emulate:dry'], { stdio: 'inherit' });

  await new Promise((resolve) => setTimeout(resolve, 1000 * 10)); // 10 seconds

  (
    globalThis as typeof globalThis & { __EMULATOR_PROCESS__: ChildProcess }
  ).__EMULATOR_PROCESS__ = emulatorProcess;
}

export default globalSetup;
