import kill from 'tree-kill';

async function globalTeardown() {
  try {
    const emulatorProcess = (
      globalThis as typeof globalThis & {
        __EMULATOR_PROCESS__?: { pid: number };
      }
    ).__EMULATOR_PROCESS__;
    if (emulatorProcess) {
      await new Promise<void>((resolve, reject) =>
        kill(emulatorProcess.pid, 'SIGKILL', (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }),
      );
    } else {
    }
  } catch (_error) {}
}

export default globalTeardown;
