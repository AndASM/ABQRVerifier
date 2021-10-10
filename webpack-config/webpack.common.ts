import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import AndConfig from '../src/Utilities/and-config'
import Path from '../src/Utilities/Path'

const {__dirname} = Path.getFileDirName(import.meta.url);

class CommonConfig extends AndConfig {
  protected constructor() {
    super()
  }
  
  get common() {
    return true
  }
  
  get mode() {
    return 'common'
  }
  
  get config(): AndConfig.WebpackConfiguration {
    return {
      entry: {
        '404': this.paths.src.join('index.ts').path,
        'service.worker': this.paths.webWorkers.join('service.worker.ts').path,
        'qr.worker': this.paths.webWorkers.join('qr.worker.ts').path
      },
      module: {
        rules: [
          this.tsRule('src', {
            include: this.paths.src.path
          }),
          this.tsRule('webWorkers', {
            include: this.paths.webWorkers.path
          }),
          this.jsRule(),
          {test: /\.pug$/i, loader: 'simple-pug-loader'},
          {test: /\.s[ac]ss$/i, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']},
          {test: /CNAME/, type: 'asset/resource', generator: {filename: '[name]'}}
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js']
      },
      output: {
        filename: '[name].js',
        path: this.paths.dist.path,
        clean: true
      },
      plugins: [
        AndConfig.gitInfoPlugin,
        new HtmlWebpackPlugin({
          filename: '404.html',
          template: this.paths.src.join('index.pug').path,
          minify: false,
          chunks: ['404']
        }),
        new MiniCssExtractPlugin({filename: '[name].css'})
      ],
      optimization: {
        splitChunks: {
          cacheGroups: {
            styles: {
              name: 'styles',
              test: /\.css$/,
              chunks: 'all',
              enforce: true
            }
          }
        },
        minimizer: [
          new TerserPlugin({
            extractComments: false
          })
        ]
      }
    }
  }
  
  public get pathDef() {
    return CommonConfig.pathDef
  }
  
  public babelUse(features?: string[]): AndConfig.webpack.RuleSetUseItem {
    const targets = features ?
        `supports ${features.join(' and supports ')}, not ie <= 999, not ie_mob <= 999, not dead`
        : 'defaults'
    return {
      loader: 'babel-loader',
      options: {
        exclude: [
          /node_modules/,
        ],
        presets: [['@babel/preset-env', {targets: targets}]],
        plugins: ['@babel/plugin-transform-runtime']
      }
    }
  }
  
  get features() {
    return ['es6', 'es6-module', 'webworkers', 'serviceworkers', 'async-functions']
  }
  
  public tsRule(instance: string, mergeData: any): AndConfig.webpack.RuleSetRule {
    const fragmentData: AndConfig.webpack.RuleSetRule = {
      test: /\.tsx?$/i,
      use: [
        this.babelUse(this.features),
        {
          loader: 'ts-loader',
          options: {
            instance: instance
          }
        }
      ],
    }
    
    return AndConfig.merge(fragmentData, mergeData)
  }
  
  public jsRule(): AndConfig.webpack.RuleSetRule {
    return {
      test: /\.m?jsx?$/i,
      use: [
        this.babelUse(this.features)
      ]
    }
  }
  
  
  public static pathDef: { base: Path.Like; paths: Path.CollectionLike } = {
    base: __dirname, paths: [
      ['src', 'src'],
      ['webWorkers', 'workers'],
      ['dist', 'dist']
    ]
  }
  
  protected static _instance: CommonConfig
  
  static get instance() {
    if (!this._instance)
      this._instance = new CommonConfig()
    return this._instance
  }
}

CommonConfig.instance

export default CommonConfig
