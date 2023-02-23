import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

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
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('a-')
        }
      }
    }),
    Components({
      // ui库解析器，也可以自定义
      resolvers: [ElementPlusResolver()]
    })
  ],
  resolve: {
    alias: [
      {
        find: /^three/,
        replacement: path.resolve(__dirname, 'vendor', 'three')
      },
      { find: /^@(?=\/)/, replacement: path.resolve(__dirname, 'src') }
    ]
  },
  build: {
    chunkSizeWarningLimit: 2048
  }
})
