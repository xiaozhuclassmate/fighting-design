import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts' // https://github.com/qmhc/vite-plugin-dts
import FightingSetupNamePlugin from './packages/fighting-setup-name'
import { resolve } from 'path'
import { copyFileSync } from 'fs'
import { name, version } from './packages/fighting-design/package.json'
import { visualizer } from 'rollup-plugin-visualizer' // https://github.com/btd/rollup-plugin-visualizer
import type { UserConfigExport } from 'vite'

export default (): UserConfigExport => {
  return {
    plugins: [
      vue(),
      dts({
        skipDiagnostics: true, // 是否跳过类型诊断
        staticImport: true, // 是否将动态引入转换为静态
        outputDir: ['./dist/lib', './dist/es'], // 可以指定一个数组来输出到多个目录中
        insertTypesEntry: true, // 是否生成类型声明入口
        cleanVueFileName: true, // 是否将 '.vue.d.ts' 文件名转换为 '.d.ts'
        copyDtsFiles: true, // 是否将源码里的 .d.ts 文件复制到 outputDir
        include: ['./packages/fighting-design'], // 手动设置包含路径的 glob
        // 构建后回调钩子
        afterBuild: (): void => {
          move()
        }
      }),
      FightingSetupNamePlugin(),
      visualizer()
    ],
    build: {
      target: 'modules', // 这是指 支持原生 ES 模块、原生 ESM 动态导入
      minify: true, // 压缩代码
      chunkSizeWarningLimit: 2, // 打包的组件超过 2kb 警告提示
      reportCompressedSize: true, // 启用 gzip 压缩大小报告
      emptyOutDir: false,
      outDir: resolve(__dirname, './dist'), // 指定输出路径
      // 库模式 https://cn.vitejs.dev/guide/build.html#library-mode
      lib: {
        name: 'FightingDesign',
        entry: resolve(__dirname, 'packages/fighting-design/index.ts') // 打包入口
      },
      // rollup 配置项 https://rollupjs.org/guide/en/#big-list-of-options
      rollupOptions: {
        external: ['vue'], // 确保外部化处理那些你不想打包进库的依赖 https://rollupjs.org/guide/en/#external
        output: [
          {
            name: 'FightingDesign', // 包名
            format: 'umd',
            exports: 'named',
            sourcemap: false,
            dir: 'dist/dist',
            entryFileNames: 'index.umd.js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
            manualChunks: undefined,
            inlineDynamicImports: false,
            globals: { vue: 'Vue' }, // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
            namespaceToStringTag: true
          },
          {
            format: 'es', // 打包模式 https://rollupjs.org/guide/en/#outputformat
            exports: 'named', // 导出模式 https://rollupjs.org/guide/en/#outputexports
            dir: 'dist/es', // 输出路径 https://rollupjs.org/guide/en/#outputdir
            sourcemap: false, // https://rollupjs.org/guide/en/#outputsourcemap
            entryFileNames: 'index.js', // 输出后的文件名 https://rollupjs.org/guide/en/#outputentryfilenames
            chunkFileNames: '[name].js', // 输出的 chunk文件名 https://rollupjs.org/guide/en/#outputchunkfilenames
            assetFileNames: '[name].[ext]', // 输出资产文件名 https://rollupjs.org/guide/en/#outputassetfilenames
            inlineDynamicImports: false, // https://rollupjs.org/guide/en/#outputinlinedynamicimports
            manualChunks: undefined,
            preserveModules: true, // https://rollupjs.org/guide/en/#outputpreservemodules
            namespaceToStringTag: true // https://rollupjs.org/guide/en/#outputnamespacetostringtag
          },
          {
            format: 'cjs',
            exports: 'named',
            dir: 'dist/lib',
            sourcemap: false,
            entryFileNames: 'index.js',
            chunkFileNames: '[name].js',
            assetFileNames: '[name].[ext]',
            inlineDynamicImports: false,
            manualChunks: undefined,
            preserveModules: true,
            namespaceToStringTag: true
          }
        ]
      }
    }
  }
}

const move = (): void => {
  const files = [
    { input: './README.md', outDir: 'dist/README.md' },
    {
      input: './packages/fighting-design/package.json',
      outDir: 'dist/package.json'
    },
    { input: './LICENSE', outDir: 'dist/LICENSE' }
  ] as const

  files.forEach((item): void => {
    copyFileSync(item.input, item.outDir)
  })

  console.warn('\n' + `${name} ${version} 版本打包成功 🎉🎉🎉` + '\n')
}
