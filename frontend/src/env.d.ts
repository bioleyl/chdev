/* biome-ignore-all lint/suspicious/noExplicitAny: Required by design */
/* biome-ignore-all lint/complexity/noBannedTypes: Required by design */

/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';

  const component: DefineComponent<{}, {}, any>;
  export default component;
}
