module.exports = {
	publicPath: '',
	runtimeCompiler: true,

	// PWA config
	pwa: {
		name: process.env.VUE_APP_NAME,
		themeColor: process.env.VUE_APP_INITIAL_STATUSBAR_COLOR,
		msTileColor: process.env.VUE_APP_INITIAL_STATUSBAR_COLOR,
		appleMobileWebAppCapable: 'yes',
		appleMobileWebAppStatusBarStyle: 'black-translucent',
	},

	chainWebpack: (config) => {
		config.module
			  .rule('html')
			  .test(/\.html$/)
			  .use('html-loader')
			  .loader('html-loader')
			  .end();
		if (!process.env.WEBPACK_DEV_SERVER) config.plugins.delete('fork-ts-checker');
	},

	outputDir: undefined,
	assetsDir: undefined,
	productionSourceMap: false,
	parallel: undefined,
	css: undefined,
};
