<template>
<ion-vue-router/>
</template>

<script>
import VueRouter from '../router';
import Article from './Article.vue';
import SavedHome from './SavedHome.vue';
import Author from './Author.vue';

const router = new VueRouter({
	mode: 'abstract',
	base: process.env.BASE_URL,
	routes: [
		{ path: '/', component: SavedHome },
		{ path: '/article/:id', component: Article, props: true },
		{ path: '/author/:name/:from', component: Author, props: true },
	],
});
router.push('/');
export default {
	name: 'Saved',
	router,
};
</script>

<style scoped>

</style>
