<template>
<ion-vue-router/>
</template>

<script>
import VueRouter from '../router';
import Home from './SettingsHome.vue';
import Copyright from './Copyright.vue';
import About from './About.vue';

const router = new VueRouter({
	mode: 'abstract',
	base: process.env.BASE_URL,
	routes: [
		{ path: '/', component: Home },
		{ path: '/copyright', component: Copyright },
		{ path: '/about', component: About },
	],
});
router.push('/');
export default {
	name: 'Settings',
	router,
};
</script>

<style scoped>

</style>
