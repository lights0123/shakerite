module.exports = {
	baseUrl: undefined,
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
			  .rule('ts')
			  .test(/\.ts$/)
			  .use('ts-loader')
			  .loader('ts-loader')
			  .end();
		config.module
			  .rule('html')
			  .test(/\.html$/)
			  .use('html-loader')
			  .loader('html-loader')
			  .end();
		config.resolve.extensions
			  .add('.ts')
			  .end();
	},

	outputDir: undefined,
	assetsDir: undefined,
	productionSourceMap: false,
	parallel: undefined,
	css: undefined,
};
