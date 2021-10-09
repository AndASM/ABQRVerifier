import HtmlWebpackPlugin from 'html-webpack-plugin'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import TerserPlugin from 'terser-webpack-plugin'
import AndConfig from '../src/Utilities/and-config'
import Path from '../src/Utilities/Path'


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
        'service-worker': this.paths.webWorkers.join('service-worker.ts').path
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/i,
            loader: 'ts-loader',
            options: {
              instance: 'main'
            },
            exclude: {
              or: [
                this.paths.webWorkers.path,
                /node_modules/,
                /webpack\.config\.ts/
              ]
            }
          },
          {
            test: /\.tsx?$/i,
            loader: 'ts-loader',
            options: {
              instance: 'webworkers'
            },
            include: this.paths.webWorkers.path
          },
          {test: /\.pug$/i, loader: 'simple-pug-loader'},
          {test: /\.s[ac]ss$/i, use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']},
          {test: /CNAME/, type: 'asset/resource', generator: {filename: '[name]'}}
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js']
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
