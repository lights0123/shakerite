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
			<ion-refresher :disabled="refreshing" @ionRefresh="refresh" ref="refresh" slot="fixed">
				<ion-refresher-content />
			</ion-refresher>
			<ion-searchbar animated="true" show-cancel-button="focus" debounce="500"
			               @ionInput="searchTerm = $event.target.value" :value="searchTerm"
			               @ionCancel="searchTerm = ''" />
			<div class="center">
				<ion-spinner v-if="refreshing" />
				<p v-else-if="articles.length === 0">No articles found</p>
			</div>
			<ion-item v-for="author in authors" :key="author.id" detail @click="$router.push(`/author/${author.name}`)">
				<ion-avatar slot="start">
					<media v-if="author.media" :media="author.media" avatar />
					<ion-icon v-else class="contact-icon" name="contact" />
				</ion-avatar>
				<ion-label>{{ author.name }}</ion-label>
			</ion-item>
			<article-preview :article="article"
			                 :key="`searchTerm ${selCategory.id} ${article.id}`"
			                 :large="index === 0"
			                 @click.native="$router.push('/article/' + article.id)"
			                 v-for="(article, index) in articles" />

			<ion-infinite-scroll :disabled="refreshing" @ionInfinite="loadContent" ref="infinite">
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
import { SET_CATEGORY, SET_SEARCH_TERM } from '@/store/mutations';
import { defaultCategories } from '@/helpers/categories';
// eslint-disable-next-line no-unused-vars
import { Article, Author, AuthorSearch, Post, Search } from '@/helpers/api';
import Logo from '../components/Logo.vue';

const searches: { articles: Search<Article>, authors: AuthorSearch }[] = [];

type RefresherEvent = { target: RefresherEventDetail };
@Component({
	components: {
		Logo, ArticlePreview, Media, CategoryChooser,
	},
})
export default class NewsHome extends Mixins(SaveScroll) {
	categories = defaultCategories;
	s: Search<Article> | null = null;
	authorSearch: AuthorSearch | null = null;
	authors: Author[] = [];
	articles: Post[] = [];
	refreshing: Search<Article> | null = null;
	refreshingAuthors: AuthorSearch | null = null;

	@Inject() readonly API!: any;
	@Ref('infinite') readonly infiniteScroll?: { complete(): void };
	@Ref('refresh') readonly refreshComponent?: { cancel(): void };

	@Watch('selCategory')
	onCategoryChange() {
		this.searchTerm = '';
	}

	@Watch('selCategory', { immediate: true })
	@Watch('searchTerm')
	onSearchChange() {
		this.infiniteScroll?.complete();
		this.refreshComponent?.cancel();
		let search = searches.find(search => search.articles.categories === this.selCategory.id && search.articles.term === this.searchTerm);
		if (!search) {
			search = {
				articles: new Search(this.API, { categories: this.selCategory.id, term: this.searchTerm }),
				authors: new AuthorSearch(this.API, { name: this.searchTerm }),
			};
			searches.push(search);
			this.s = search.articles;
			this.authorSearch = search.authors;
			this.articles = search.articles.items;
			this.authors = search.authors.items as Author[];
			this.refresh();
		}
		this.s = search.articles;
		this.authorSearch = search.authors;
		this.articles = search.articles.items;
		this.authors = search.authors.items as Author[];
	}

	log(e: any) { console.log(e); }

	async loadContent(e?: RefresherEvent) {
		let search = this.s;
		if (!search) return;
		await search.next(10);
		if (this.s === search) this.articles = search.items;
		e?.target.complete();
	}

	async refreshAuthors() {
		let { authorSearch } = this;
		if (!authorSearch || !authorSearch.name) return;
		if (this.refreshingAuthors === authorSearch) return;
		this.refreshingAuthors = authorSearch;
		authorSearch.reset();
		await authorSearch.next(5);
		if (this.authorSearch === authorSearch) this.authors = authorSearch.items as Author[];
		this.refreshingAuthors = null;
	}

	async refresh(e?: RefresherEvent) {
		let search = this.s;
		if (!search) return;
		this.refreshAuthors();
		if (this.refreshing === search) return;
		this.refreshing = search;
		search.reset();
		await search.next(10);
		if (this.s === search) this.articles = search.items;
		e?.target.complete();
		this.refreshing = null;
	}

	get selCategory() {
		return this.$store.state.category;
	}

	set selCategory(category) {
		this.$store.commit(SET_CATEGORY, category);
	}

	get searchTerm() {
		return this.$store.state.searchTerm;
	}

	set searchTerm(term) {
		this.$store.commit(SET_SEARCH_TERM, term);
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

.contact-icon {
	width: 100%;
	height: 100%;
}
</style>
