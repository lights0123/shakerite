<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
<template>
	<fragment>
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
			<ion-searchbar
				animated="true"
				show-cancel-button="focus"
				debounce="500"
				@ionInput="searchTerm = $event.target.value"
				:value="searchTerm"
				@ionCancel="cancelSearch"
				@ionClear="$refs.search.setFocus()"
				ref="search"
			/>
			<ion-item
				v-for="author in authors"
				:key="author.id"
				detail
				@click="getNav().push('app-author', { name: author.name })"
			>
				<ion-avatar slot="start">
					<media v-if="author.media" :media="author.media" avatar />
					<ion-icon v-else class="contact-icon" name="contact" />
				</ion-avatar>
				<ion-label>{{ author.name }}</ion-label>
			</ion-item>
			<div class="center">
				<ion-spinner v-if="refreshing" />
				<p v-else-if="articles.length === 0">No articles found</p>
			</div>
			<article-preview
				:article="article"
				:key="`${searchTerm} ${selCategory.id} ${article.id}`"
				:large="index === 0"
				@click.native="getNav().push('app-article', { id: article.id })"
				v-for="(article, index) in articles"
			/>

			<ion-infinite-scroll :disabled="refreshing" @ionInfinite="loadContent" ref="infinite">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>
		</ion-content>
	</fragment>
</template>

<script lang="ts">
import { Component, Inject, Ref, Vue, Watch } from 'vue-property-decorator';
import { RefresherEventDetail } from '@ionic/core';
import CategoryChooser from '../components/CategoryChooser.vue';
import Media from '../components/Media.vue';
import ArticlePreview from '../components/ArticlePreview.vue';
import { SET_CATEGORY, SET_SEARCH_TERM } from '@/store/mutations';
import { defaultCategories } from '@/helpers/categories';
import { Article, Author, AuthorSearch, Post, Search } from '@/helpers/api';
import { getNav, injectParent } from '@/helpers';
import Logo from '../components/Logo.vue';
import uniqBy from 'lodash/uniqBy';
import property from 'lodash/property';

const searches: { articles: Search<Article>; authors: AuthorSearch }[] = [];

type RefresherEvent = { target: RefresherEventDetail };
@Component({
	components: {
		Logo,
		ArticlePreview,
		Media,
		CategoryChooser,
	},
})
export default class News extends Vue {
	categories = defaultCategories;
	s: Search<Article> | null = null;
	authorSearch: AuthorSearch | null = null;
	authors: Author[] = [];
	articles: Post[] = [];
	refreshing: Search<Article> | null = null;
	refreshingAuthors: AuthorSearch | null = null;
	@Ref('search') searchBar!: HTMLIonSearchbarElement;

	async mounted() {
		const input = await this.searchBar.getInputElement();
		input.addEventListener('keyup', (e) => {
			if (e.key === 'Enter') {
				const activeElement = document.activeElement as HTMLOrSVGElement | null;
				if (activeElement?.blur) activeElement.blur();
			}
		});
	}

	getNav() {
		return getNav();
	}

	cancelSearch() {
		this.searchTerm = '';
		setTimeout(() => {
			const activeElement = document.activeElement as HTMLOrSVGElement | null;
			activeElement?.blur();
		}, 0);
	}

	@Ref('infinite') readonly infiniteScroll?: { complete(): void };
	@Ref('refresh') readonly refreshComponent?: { cancel(): void };
	@Inject() readonly API!: any;

	@Watch('selCategory')
	onCategoryChange() {
		this.searchTerm = '';
	}

	@Watch('selCategory', { immediate: true })
	@Watch('searchTerm')
	onSearchChange() {
		if (this.searchTerm.toLowerCase().startsWith('bruh moment')) {
			this.searchTerm = '';
			getNav().push('app-dino');
			return;
		}
		this.infiniteScroll?.complete();
		this.refreshComponent?.cancel();
		let search = searches.find(
			(search) =>
				search.articles.categories === this.selCategory.id &&
				search.articles.term === this.searchTerm
		);
		if (!search) {
			search = {
				articles: new Search(this.API, {
					categories: this.selCategory.id,
					term: this.searchTerm,
				}),
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

	async loadContent(e?: RefresherEvent) {
		let search = this.s;
		if (!search) return;
		await search.next(10);
		if (this.s === search) this.articles = search.items;
		this.articles = uniqBy(this.articles, property('id')).sort((a, b) => +b.date - +a.date);
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
}

Vue.customElement('app-news', (News as any).options, injectParent);
</script>

<style scoped>
.outer-content {
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
