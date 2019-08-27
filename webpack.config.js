const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'pulsatio.js',
        library: 'Pulsatio',
        libraryTarget: 'var'
    },
    optimization: {
        minimizer: [new TerserPlugin()],
    },
    devServer: {
        writeToDisk: true,
        compress: true,
        port: 9000
    },
    module: {
        rules: []
    }
};