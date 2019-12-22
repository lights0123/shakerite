<template>
	<ion-page class="ion-page">
		<ion-header>
			<ion-toolbar>
				<ion-title><img alt="Shakerite logo" class="logo" src="../images/shakerite.png" /></ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="outer-content">

			<ion-refresher :disabled="articles.length === 0" @ionRefresh="refresh" ref="refresh" slot="fixed">
				<ion-refresher-content />
			</ion-refresher>
			<!--<ion-searchbar animated="true" show-cancel-button debounce="500"/>-->
			<div class="center">
				<ion-spinner v-if="articles.length === 0 && hasArticles" />
			</div>
			<article-preview :article="article"
			                 :key="article.id" :large="index === 0"
			                 @click.native="$router.push('/article/' + article.id)"
			                 v-for="(article, index) in articles" />

			<div class="noArticles" v-if="!hasArticles">
				<ion-label>Save articles with the bookmark button</ion-label>
			</div>

			<ion-infinite-scroll :disabled="articles.length === 0" @ionInfinite="loadContent" ref="infinite">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script>
import SaveScroll from '../mixins/SaveScroll';
import ArticlePreview from '../components/ArticlePreview';
import { Search } from '../helpers/api';
// TODO: fix bug where adding new articles causes next pagination to return fewer results

let s;
let articles = [];
export default {
	name: 'SavedHome',
	components: { ArticlePreview },
	mixins: [SaveScroll],
	data() {
		return {
			articles,
		};
	},
	created() {
		this.refresh();
	},
	methods: {
		async loadContent(e) {
			if (this.hasArticles) this.articles = (await s.next(10)).slice();
			if (e) e.target.complete();
		},
		async refresh(e) {
			if (this.hasArticles) {
				s = new Search(this.API, { ids: this.$store.state.savedArticles });
				this.articles = (await s.next(10)).slice();
			}
			if (e) e.target.complete();
		},
	},
	computed: {
		hasArticles() {
			return this.$store.state.savedArticles.length > 0;
		},
	},
	watch: {
		hasArticles(has) {
			if (has) this.refresh();
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

.noArticles {
	text-align: center;
}
</style>
