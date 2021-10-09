import AndConfig from '../src/Utilities/and-config'
import CommonConfig from './webpack.common'


class DevelopmentConfig extends AndConfig {
  get common() {
    return false
  }
  
  get mode() {
    return 'development'
  }
  
  get config(): AndConfig.WebpackConfiguration {
    return {
      mode: 'development',
      devServer: {
        https: true,
        hot: false,
        liveReload: false,
        devMiddleware: {
          writeToDisk: false
        }
      },
    }
  }
  
  public get pathDef() {
    return CommonConfig.pathDef
  }
  
  protected static _instance: DevelopmentConfig
  static get instance() {
    if (!this._instance)
      this._instance = new DevelopmentConfig()
    return this._instance
  }
}

DevelopmentConfig.instance

export default DevelopmentConfig

