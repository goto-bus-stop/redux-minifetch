import buble from '@rollup/plugin-buble'
import nodeResolve from '@rollup/plugin-node-resolve'

const pkg = require('./package.json')

const external = Object.keys(pkg.dependencies)

export default {
  input: 'src/index.js',
  output: [{
    file: pkg.main,
    exports: 'named',
    format: 'cjs',
    sourcemap: true
  }, {
    file: pkg.module,
    format: 'es',
    sourcemap: true
  }],
  external: (id) =>
    external.some((m) => id.split('/')[0] === m),
  plugins: [
    buble(),
    nodeResolve()
  ]
}
