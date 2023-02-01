import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  mode: 'development',
  envDir: 'configs',
  base: './',
  server: {
    fs: { strict: false },
    host: '0.0.0.0',
    port: 4321,
    strictPort: true
  },
  css: {
    preprocessorOptions: {
      scss: {
        charset: false
      },
      less: {
        charset: false
      }
    },
    charset: false,
    postcss: {
      plugins: [
        {
          postcssPlugin: 'internal:charset-removal',
          AtRule: {
            charset: atRule => {
              if (atRule.name === 'charset') {
                atRule.remove()
              }
            }
          }
        }
      ]
    }
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('a-')
        }
      }
    })
  ],
  resolve: {
    alias: [
      ...fs.readdirSync(path.resolve(__dirname, 'vendor')).map(m => {
        const key = path.basename(m, '.js')
        return {
          find: key,
          replacement: path.resolve(__dirname, 'vendor', key)
        }
      }),
      { find: /^@(?=\/)/, replacement: path.resolve(__dirname, 'src') }
    ]
  },
  build: {
    chunkSizeWarningLimit: 2048,
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'ali-oss': ['ali-oss'],
          aframe: ['aframe']
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    includeSource: ['src/**/*.{js,ts}']
  }
})
