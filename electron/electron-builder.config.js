/** @type {import('electron-builder').Configuration} */
export default {
  appId: 'com.chdev.app',
  productName: 'ChDev',
  directories: {
    output: 'dist/release',
  },
  files: ['dist/**/*.js', 'dist/**/*.js.map', '!dist/**/*.map'],
  extraResources: [
    {
      from: '../frontend/dist',
      to: 'frontend/dist',
    },
  ],
  nodeGypRebuild: false,
  npmRebuild: false,
  linux: {
    target: ['AppImage', 'deb'],
    icon: 'build',
    category: 'Utility',
  },
  deb: {
    packageCategory: 'Utility',
  },
  win: {
    target: ['nsis'],
    icon: 'build',
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};
