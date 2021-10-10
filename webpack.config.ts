import './webpack-config/webpack.common.ts'
import './webpack-config/webpack.production'
import './webpack-config/webpack.development'
import AndConfig from './src/Utilities/and-config'

function getConfig(env: Record<string, any>, argv: Record<string, any>) {
  const mode = argv?.mode ? argv.mode : 'development'
  return AndConfig.getConfiguration(mode)
}

export default getConfig
