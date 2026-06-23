import * as path from 'node:path';
import * as url from 'node:url';
import { app, BrowserWindow } from 'electron';

// Determine if running in dev mode
const isDev = !app.isPackaged;

// Resolve __dirname equivalent for ES modules
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    // Dev: load Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load built files
    const indexPath = path.join(__dirname, '..', 'frontend', 'dist', 'index.html');
    mainWindow.loadURL(url.pathToFileURL(indexPath).href);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
