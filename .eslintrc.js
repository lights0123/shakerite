module.exports = {
	root: true,
	env: {
		node: true,
	},
	extends: [
		'plugin:vue/essential',
		'eslint:recommended',
		'@vue/typescript',
		'plugin:prettier/recommended',
		'prettier/vue',
	],
	rules: {
		'no-console': 'off',
		'no-debugger': 'off',
		'no-mixed-spaces-and-tabs': 'off',
		'prettier/prettier':
			  process.env.NODE_ENV === 'production' ? 'error' : 'off',
		'no-unused-vars': 'off',
	},
	parserOptions: {
		parser: '@typescript-eslint/parser',
	},
};
