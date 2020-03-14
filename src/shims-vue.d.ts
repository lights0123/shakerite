declare module '*.vue' {
	import Vue from 'vue';
	export default Vue;
}
declare module '*.html' {
	const string: string;
	export default string;
}
declare var vue: Vue;
