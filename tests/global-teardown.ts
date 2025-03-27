import kill from 'tree-kill';

async function globalTeardown() {
  try {
    const emulatorProcess = (
      globalThis as typeof globalThis & {
        __EMULATOR_PROCESS__?: { pid: number };
      }
    ).__EMULATOR_PROCESS__;
    if (emulatorProcess) {
      console.log('Emulator PID: ', emulatorProcess.pid);
      await new Promise<void>((resolve, reject) =>
        kill(emulatorProcess.pid, 'SIGKILL', (err) => {
          if (err) {
            console.error('Failed to kill emulator process tree:', err);
            reject(err);
          } else {
            console.log('Emulator process tree terminated successfully.');
            resolve();
          }
        })
      );
    } else {
      console.warn('No emulator process found to terminate.');
    }
  } catch (error) {
    console.error(
      'An error occurred while terminating the emulator process:',
      error
    );
  }
}

export default globalTeardown;
