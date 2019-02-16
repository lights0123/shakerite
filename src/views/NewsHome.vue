<template>
<ion-page class="ion-page">
	<ion-header>
		<ion-toolbar>
			<ion-title><img src="../images/shakerite.png" class="logo" alt="Shakerite logo"/></ion-title>
		</ion-toolbar>
		<CategoryChooser :categories="categories" v-model="selCategory"/>
	</ion-header>
	<ion-content class="outer-content">

		<ion-refresher slot="fixed" :disabled="articles.length === 0" @ionRefresh="refresh" ref="refresh">
			<ion-refresher-content></ion-refresher-content>
		</ion-refresher>
		<!--<ion-searchbar animated="true" show-cancel-button debounce="500"/>-->
		<div class="center">
			<ion-spinner v-if="articles.length === 0"></ion-spinner>
		</div>
		<article-preview v-for="(article, index) in articles"
		                 @click.native="$router.push('/article/' + article.id)" :article="article"
		                 :key="article.id" :large="index === 0"/>

		<ion-infinite-scroll @ionInfinite="loadContent" :disabled="articles.length === 0" ref="infinite">
			<ion-infinite-scroll-content/>
		</ion-infinite-scroll>
	</ion-content>
</ion-page>
</template>

<script>
import { mapState } from 'vuex';
import SaveScroll from '../mixins/SaveScroll';
import CategoryChooser from '../components/CategoryChooser';
import Media from '../components/Media';
import ArticlePreview from '../components/ArticlePreview';
import { ADD_ARTICLE, SET_ARTICLES, SET_CATEGORY } from '../store/mutations';
import { defaultCategories } from '../helpers/categories';
import { Search } from '../helpers/api';

let s;
export default {
	name: 'NewsHome',
	components: { ArticlePreview, Media, CategoryChooser },
	mixins: [SaveScroll],
	data() {
		return {
			categories: defaultCategories,
		};
	},
	created() {
		this.load();
	},
	methods: {
		async loadContent(e) {
			const category = s.categories;
			const articles = await s.next(10);
			if (category === this.selCategory.id) this.$store.commit(ADD_ARTICLE, articles);
			if (e) e.target.complete();
		},
		async refresh(e) {
			const category = s.categories;
			s.reset();
			const articles = await s.next(10);
			if (category === this.selCategory.id) this.$store.commit(SET_ARTICLES, articles);
			if (e) e.target.complete();
		},
		async load() {
			if (this.$refs.infinite) this.$refs.infinite.complete();
			if (this.$refs.refresh) this.$refs.refresh.cancel();
			if (s && s.categories === this.selCategory.id) return;
			this.$store.commit(SET_ARTICLES, []);
			s = new Search(this.API, { categories: this.selCategory.id });
			this.refresh();
		},
	},
	computed: {
		...mapState({
			articles: state => state.articles,
		}),
		selCategory: {
			get() {
				return this.$store.state.category;
			},
			set(category) {
				this.$store.commit(SET_CATEGORY, category);
			},
		},
	},
	watch: {
		selCategory() {
			this.load();
		},
	},
	inject: ['API'],
};
</script>

<style scoped>
ion-page {
	--ion-text-color: var(--beep-secondary);
}

a {
	text-decoration: none;
}

.center {
	text-align: center;
}

.logo {
	max-height: 1.5em;
}
</style>
