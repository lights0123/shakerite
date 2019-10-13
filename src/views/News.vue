<template>
	<ion-vue-router />
</template>

<script>
import VueRouter from '../router';
import Home from './NewsHome.vue';
import Article from './Article.vue';
import Author from './Author.vue';

const router = new VueRouter({
	mode: 'abstract',
	base: process.env.BASE_URL,
	routes: [
		{ path: '/', component: Home },
		{ path: '/article/:id', component: Article, props: true },
		{ path: '/author/:name/:from', component: Author, props: true },
	],
});
router.push('/');
export default {
	name: 'News',
	router,
};
</script>

<style scoped>

</style>
