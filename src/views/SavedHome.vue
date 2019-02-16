<template>
<ion-page class="ion-page">
	<ion-header>
		<ion-toolbar>
			<ion-title><img src="../images/shakerite.png" class="logo" alt="Shakerite logo"/></ion-title>
		</ion-toolbar>
	</ion-header>
	<ion-content class="outer-content">

		<ion-refresher slot="fixed" :disabled="articles.length === 0" @ionRefresh="refresh" ref="refresh">
			<ion-refresher-content></ion-refresher-content>
		</ion-refresher>
		<ion-searchbar animated="true" show-cancel-button debounce="500"/>
		<div class="center">
			<ion-spinner v-if="articles.length === 0 && noArticles"></ion-spinner>
		</div>
		<article-preview v-for="(article, index) in articles"
		                 @click.native="$router.push('/article/' + article.id)" :article="article"
		                 :key="article.id" :large="index === 0"/>

		<div class="noArticles" v-if="!hasArticles">
			<ion-label>Save articles with the bookmark button</ion-label>
		</div>

		<ion-infinite-scroll @ionInfinite="loadContent" :disabled="articles.length === 0" ref="infinite">
			<ion-infinite-scroll-content/>
		</ion-infinite-scroll>
	</ion-content>
</ion-page>
</template>

<script>
import SaveScroll from '../mixins/SaveScroll';
import Media from '../components/Media';
import ArticlePreview from '../components/ArticlePreview';
import { Search } from '../helpers/api';
// TODO: fix bug where adding new articles causes next pagination to return fewer results

let s;
let articles = [];
export default {
	name: 'SavedHome',
	components: { ArticlePreview, Media },
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
