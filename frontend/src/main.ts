import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import App from './App.vue';
import { permission } from './directives/permission';
import { createRouter } from './router/index.js';

const app = createApp(App);
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'modernLight',
    themes: {
      modernLight: {
        dark: false,
        colors: {
          primary: '#4f46e5',
          secondary: '#64748b',
          accent: '#06b6d4',
          error: '#ef4444',
          info: '#3b82f6',
          success: '#22c55e',
          warning: '#f59e0b',
        },
      },
    },
  },
});

const router = createRouter();
app.use(vuetify);
app.use(router);
app.directive('permission', permission);
app.mount('#app');
