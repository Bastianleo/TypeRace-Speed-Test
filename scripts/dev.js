const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const serverDir = path.join(__dirname, '../server');
const serverNodeModules = path.join(serverDir, 'node_modules');

console.log('\x1b[36m%s\x1b[0m', '=== TypeRace Development Launcher ===');

// Step 1: Install server dependencies if missing
if (!fs.existsSync(serverNodeModules)) {
  console.log('\x1b[33m%s\x1b[0m', 'Installing Socket.IO server dependencies in "server/" folder...');
  try {
    execSync('npm install', { cwd: serverDir, stdio: 'inherit' });
    console.log('\x1b[32m%s\x1b[0m', 'Server dependencies installed successfully.');
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Failed to install server dependencies:', error.message);
    process.exit(1);
  }
}

// Step 2: Start Next.js dev server and Socket.IO server
console.log('\x1b[32m%s\x1b[0m', 'Starting Next.js frontend and Socket.IO backend...');

// Spawn Next.js dev server
const nextProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Spawn Socket.IO server dev mode
const socketProcess = spawn('npm', ['run', 'dev'], {
  cwd: serverDir,
  stdio: 'inherit',
  shell: true
});

// Setup exit handlers
const cleanExit = () => {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down TypeRace servers...');
  nextProcess.kill('SIGINT');
  socketProcess.kill('SIGINT');
  process.exit();
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
process.on('exit', cleanExit);
