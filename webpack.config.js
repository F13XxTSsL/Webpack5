const path = require('path')
const fs = require('fs')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const {extendDefaultPlugins} = require('svgo');


const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const pathSRC = path.resolve(__dirname, 'src')
const pathDIST = path.resolve(__dirname, 'dist')

const PAGES_DIR = `${pathSRC}/pages/`
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all',
      name: 'vendor'
    }
  }
  if (isProd) {
    config.minimizer = [
      new OptimizeCssWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }
  return config
}
const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-env']
    }
  }]
  if (isDev) {
    loaders.push('eslint-loader')
  }
  return loaders
}
const plugins = () => {
  const base = [
    // Работа с PUG
    ...PAGES.map(page => new HTMLWebpackPlugin({
      template: `${PAGES_DIR}/${page}`,
      filename: `./${page.replace(/\.pug/, '.html')}`,
      inject: 'body',
      minify: {
        collapseWhitespace: isProd
      }
    })),
    new CleanWebpackPlugin({
      dry: true
    }),

    // Минификация CSS
    new MiniCssExtractPlugin({
      filename: 'styles/[name].css'
    }),
    // Сжатие изображений
    new ImageMinimizerPlugin({
      minimizerOptions: {
        plugins: [
          ['jpegtran', {progressive: true, optimizationLevel: 5}],
          ['optipng', {optimizationLevel: 5}],
          ['svgo', {
            plugins: extendDefaultPlugins([
              {
                name: 'removeViewBox',
                active: false
              },
              {
                name: 'addAttributesToSVGElement',
                params: {
                  attributes: [{xmlns: 'http://www.w3.org/2000/svg'}]
                }
              }
            ])

          }]
        ]
      }
    })
  ]
  // Перенос файлов
  new CopyWebpackPlugin({
    patterns: [
      {
        from: `${pathSRC}assets/images`,
        to: `${pathDIST}dist/images`
      },
      {
        from: `${pathSRC}assets/fonts`,
        to: `${pathDIST}dist/fonts`
      }
    ]
  })

  if (isProd) {
    // base.push(new BundleAnalyzerPlugin())
  }

  return base
}

module.exports = {
  // Контекст, откуда брать вебпаку файлы
  context: pathSRC,
  // В каком моде работаем
  mode: 'development',
  // Точки входа
  entry: {
    main: ['@babel/polyfill', './index.js']
  },
  // Точка выхода
  output: {
    filename: 'js/[name].js',
    path: pathDIST
  },
  // extensions - чтобы не прописать вконце ипортируемых файлов расширения
  // alias - чтобы не писать длинные пути подключение @ - это корневая папка src
  resolve: {
    extensions: ['.js', '.css', '.scss'],
    alias: {
      '@': pathSRC,
      images: pathSRC + 'assets/images/'
    }
  },

  // Подключаемые плагины
  plugins: plugins(),

  // Оптимизация. splitChunks - создаёт файл vendor.js, куда импортирует повторяющие подключаемые модули
  optimization: optimization(),

  // Хот-релоад
  devServer: {
    port: 4200,
    hot: isDev
  },

  devtool: isDev ? 'source-map' : false,

  // Правила для объяснение вебпаку различных расширений

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'autoprefixer'
                  ]
                ]
              }
            }
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: 'pug-loader'
          }
        ]
      },
      {
        test: /\.(png|svg|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[name].[ext]'
            }
          }
        ]
      },
      {
        test: /\.(ttf|foff)/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[ext]'
          }
        }
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      }
    ]
  }
}
