import _webpack from 'webpack'
import webpackDevServer from 'webpack-dev-server'
import {mergeWithCustomize} from 'webpack-merge'
import gitInfo from './git-info'
import Path from './path'

abstract class AndConfig {
  protected constructor() {
    this._initialize()
  }
  
  protected _paths: Path.Collection
  
  get paths() {
    return this._paths
  }
  
  get Configuration() {
    const common = AndConfig.CommonConfiguration
    const local = this.config
    return AndConfig.merge(common, local)
  }
  
  protected _initialize() {
    this._paths = new Path.Collection(this.pathDef.base, this.pathDef.paths)
    if (this.common)
      AndConfig.Common.add(this.mode)
    AndConfig.Configurations[this.mode] = this
  }
  
  abstract get common(): boolean
  
  abstract get mode(): string
  
  abstract get config(): AndConfig.WebpackConfiguration
  
  protected abstract get pathDef(): AndConfig.PathDef
  
  static Configurations: AndConfig.ConfigModes = {}
  static Common: Set<string> = new Set<string>()
  static merge = mergeWithCustomize({})

  protected static _gitInfoPlugin: _webpack.DefinePlugin

  static get gitInfoPlugin() {
    if (!this._gitInfoPlugin)
      this._gitInfoPlugin = new _webpack.DefinePlugin({
        GIT_VERSION: JSON.stringify(gitInfo.GIT_VERSION),
        GIT_AUTHOR_DATE: JSON.stringify(gitInfo.GIT_AUTHOR_DATE)
      })
    return this._gitInfoPlugin
  }
  
  static get CommonConfigs() {
    return Array.from(AndConfig.Common, key => AndConfig.Configurations[key])
  }
  
  static get CommonConfiguration() {
    return AndConfig.merge(AndConfig.CommonConfigs.map(config => config.config))
  }
  
  static get(mode: string): AndConfig {
    return AndConfig.Configurations[mode]
  }
  
  static getConfiguration(mode: string): AndConfig.WebpackConfiguration {
    return AndConfig.get(mode).Configuration
  }
}

namespace AndConfig {
  export import webpack = _webpack
  
  export interface PathDef {
    base: Path.Like,
    paths: Path.CollectionLike
  }
  
  export interface WebpackConfiguration extends _webpack.Configuration {
    devServer?: webpackDevServer.Configuration
  }
  
  export interface ConfigModes {
    [index: string]: AndConfig
  }
}

export default AndConfig
