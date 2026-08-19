import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    // Vitest runs the same resolution as the app, so a test imports a skill by
    // the path the app uses. jsdom because activities are React components a
    // child clicks; there is nothing to assert about a round without a DOM.
    test: {
      environment: 'jsdom',
      globals: false,
      include: ['src/**/*.test.{ts,tsx}'],
      setupFiles: ['src/skills/kit/testing/setup.ts'],
      restoreMocks: true,
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        // The child is told about an update and chooses when to take it. With
        // `autoUpdate` a new deploy can swap the app out mid-round and lose the
        // question they are on; nothing here is urgent enough to justify that.
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],

        manifest: {
          name: 'Koda — Math for Young Learners',
          short_name: 'Koda',
          description:
            'Counting, comparing and place value practice for 5–6 year olds. Works offline.',
          lang: 'en',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          // Children hold a tablet whichever way they like, and the layout is
          // responsive, so locking orientation would only get in the way.
          orientation: 'any',
          background_color: '#F0F4FF',
          theme_color: '#6B46C1',
          categories: ['education', 'kids'],
          icons: [
            {src: '/icons/icon-64.png', sizes: '64x64', type: 'image/png'},
            {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png'},
            {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png'},
            // Android crops adaptive icons to a circle or squircle; these are
            // padded into the safe zone so the mark survives the crop.
            {
              src: '/icons/maskable-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/icons/maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },

        workbox: {
          // Everything the app needs to run is precached, so a cold start with
          // no network still reaches a playable lesson: lessons and the course
          // are bundled JSON, and progress lives in localStorage.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2}'],
          // A deep link opened offline must still boot the app rather than 404.
          navigateFallback: '/index.html',
          // The API is online-only by design; a cached tutor reply would be a
          // stale answer to a different question.
          navigateFallbackDenylist: [/^\/api\//],
          runtimeCaching: [
            {
              // Fonts and images fetched at runtime: serve from cache when
              // offline, refresh in the background when not.
              urlPattern: ({request}) =>
                request.destination === 'image' || request.destination === 'font',
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'koda-assets',
                expiration: {maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30},
              },
            },
          ],
          cleanupOutdatedCaches: true,
        },

        devOptions: {
          // Lets the service worker be exercised with `npm run dev` instead of
          // only after a production build.
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
