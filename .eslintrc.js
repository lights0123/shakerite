module.exports = {
	root: true,
	parser: 'vue-eslint-parser',
	parserOptions: {
		parser: 'babel-eslint',
		sourceType: 'module',
	},
	env: {
		browser: true,
	},
	extends: ['plugin:vue/essential', 'airbnb-base'],
	globals: {
		__static: true,
	},
	plugins: [
		'vue', 'promise',
	],
	'rules': {
		'global-require': 0,
		'import/no-unresolved': 0,
		'no-param-reassign': 0,
		'no-shadow': 0,
		'import/extensions': 0,
		'import/newline-after-import': 0,
		'no-multi-assign': 0,
		'indent': ['error', 'tab'],
		'no-tabs': 0,
		'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'max-len': ['error', { 'code': 120 }],
		'no-mixed-spaces-and-tabs': 0,
	},
};
