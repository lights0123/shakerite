<template>
	<ion-page class="ion-page">
		<ion-header>
			<ion-toolbar>
				<ion-title>
					<logo />
				</ion-title>
			</ion-toolbar>
			<CategoryChooser :categories="categories" v-model="selCategory" />
		</ion-header>
		<ion-content class="outer-content">
			<ion-refresher :disabled="articles.length === 0" @ionRefresh="refresh" ref="refresh" slot="fixed">
				<ion-refresher-content></ion-refresher-content>
			</ion-refresher>
			<ion-searchbar animated="true" show-cancel-button debounce="500" @ionInput="log" />
			<div class="center">
				<ion-spinner v-if="articles.length === 0"></ion-spinner>
			</div>
			<article-preview :article="article"
			                 :key="article.id"
			                 :large="index === 0"
			                 @click.native="$router.push('/article/' + article.id)"
			                 v-for="(article, index) in articles" />

			<ion-infinite-scroll :disabled="articles.length === 0" @ionInfinite="loadContent" ref="infinite">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
import { Component, Inject, Mixins, Ref, Watch } from 'vue-property-decorator';
// eslint-disable-next-line no-unused-vars
import { RefresherEventDetail } from '@ionic/core';
import SaveScroll from '../mixins/SaveScroll';
import CategoryChooser from '../components/CategoryChooser.vue';
import Media from '../components/Media.vue';
import ArticlePreview from '../components/ArticlePreview.vue';
import { ADD_ARTICLE, SET_ARTICLES, SET_CATEGORY } from '@/store/mutations';
import { defaultCategories } from '@/helpers/categories';
// eslint-disable-next-line no-unused-vars
import { Article, Search } from '@/helpers/api';
import Logo from '../components/Logo.vue';

type RefresherEvent = { target: RefresherEventDetail };
@Component({
	components: {
		Logo, ArticlePreview, Media, CategoryChooser,
	},
})
export default class NewsHome extends Mixins(SaveScroll) {
	categories = defaultCategories;
	s!: Search<Article>;

	@Inject() readonly API!: any;
	@Ref('infinite') readonly infiniteScroll?: {complete(): void};
	@Ref('refresh') readonly refreshComponent?: {cancel(): void};

	created() {
		this.load();
	}

	log(e: any) { console.log(e); }

	async loadContent(e?: RefresherEvent) {
		const category = this.s.categories;
		const articles = await this.s.next(10);
		if (category === this.selCategory.id) this.$store.commit(ADD_ARTICLE, articles);
		if (e) e.target.complete();
	}

	async refresh(e?: RefresherEvent) {
		const category = this.s.categories;
		this.s.reset();
		const articles = await this.s.next(10);
		if (category === this.selCategory.id) this.$store.commit(SET_ARTICLES, articles);
		if (e) e.target.complete();
	}

	async load() {
		if (this.infiniteScroll) this.infiniteScroll.complete();
		if (this.refreshComponent) this.refreshComponent.cancel();
		if (this.s && this.s.categories === this.selCategory.id) return;
		this.$store.commit(SET_ARTICLES, []);
		this.s = new Search(this.API, { categories: this.selCategory.id });
		this.refresh();
	}

	get selCategory() {
		return this.$store.state.category;
	}

	set selCategory(category) {
		this.$store.commit(SET_CATEGORY, category);
	}

	get articles() {
		return this.$store.state.articles;
	}

	/*computed: {
		...mapState({
			articles: state => state.articles,
		}),
	},*/
	@Watch('selCategory')
	selectedCategory() {
		this.load();
	}
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
