import { spawn } from 'child_process';

let emulatorProcess;

async function globalSetup() {
  emulatorProcess = spawn('npm', ['run', 'emulate:dry'], { stdio: 'inherit' });

  await new Promise((resolve) => setTimeout(resolve, 1000 * 10)); // 10 seconds

  (
    globalThis as typeof globalThis & { __EMULATOR_PROCESS__?: any }
  ).__EMULATOR_PROCESS__ = emulatorProcess;
}

export default globalSetup;
