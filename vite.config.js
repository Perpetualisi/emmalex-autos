import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      babel: {
        plugins: [
          ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]
        ]
      }
    }),
    tailwindcss(),
  ],
  
  // Build optimization
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        dead_code: true,
        inline: true,
        unused: true,
      },
      mangle: {
        keep_fnames: false,
        keep_classnames: false,
      },
      format: {
        comments: false,
      }
    },
    
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],
          'vendor-three': ['three'],
          'vendor-utils': ['clsx', 'tailwind-merge'],
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name].[hash][extname]'
          }
          if (assetInfo.name?.endsWith('.png') || 
              assetInfo.name?.endsWith('.jpg') || 
              assetInfo.name?.endsWith('.webp')) {
            return 'assets/images/[name].[hash][extname]'
          }
          if (assetInfo.name?.endsWith('.svg')) {
            return 'assets/svg/[name].[hash][extname]'
          }
          return 'assets/[name].[hash][extname]'
        },
        chunkFileNames: 'assets/js/[name].[hash].js',
        entryFileNames: 'assets/js/[name].[hash].js',
        compact: true,
        preserveModules: false,
      },
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
        unknownGlobalSideEffects: false,
      }
    },
    target: 'es2020',
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true
    },
    reportCompressedSize: true,
    assetsInlineLimit: 4096,
  },
  
  // Server configuration
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    open: false,
    hmr: {
      overlay: true,
      protocol: 'ws',
      timeout: 20000,
    },
    cors: true,
    warmup: {
      clientFiles: [
        './src/App.jsx',
        './src/main.jsx',
        './src/components/Hero.jsx',
        './src/components/Navbar.jsx'
      ]
    },
    watch: {
      usePolling: false,
      interval: 100,
    }
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    host: true,
    cors: true,
  },
  
  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@assets': '/src/assets',
      '@styles': '/src/styles',
      '@utils': '/src/utils',
    },
    extensions: ['.jsx', '.js', '.tsx', '.ts', '.json', '.css'],
    mainFields: ['module', 'jsnext:main', 'jsnext'],
  },
  
  // CSS optimization
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]'
    },
    devSourcemap: false,
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  
  // Optimize dependencies (simplified - no esbuildOptions)
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'three',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [],
    force: false,
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  publicDir: 'public',
  cacheDir: 'node_modules/.vite',
  logLevel: 'info',
  clearScreen: true,
  envPrefix: 'VITE_',
})

// Production environment specific overrides
if (process.env.NODE_ENV === 'production') {
  console.log('Building for production with optimizations enabled')
}