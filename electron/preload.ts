import { contextBridge } from 'electron';

// Expose minimal safe APIs to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
});
