<template>
<ion-page class="ion-page">
	<ion-header>
		<ion-toolbar>
			<ion-buttons slot="start">
				<ion-button @click="$router.back()">
					<ion-icon name="arrow-back"></ion-icon>
					<span v-if="$isIOS">Back</span>
				</ion-button>
			</ion-buttons>
			<ion-title><img src="../images/shakerite.png" class="logo" alt="Shakerite logo"/></ion-title>
		</ion-toolbar>
	</ion-header>
	<ion-content class="outer-content">
		<h1>{{article.title}}</h1>
		<media :media="article.media"/>
		<div v-html="article.content"/>
		<article-preview v-for="(article, index) in articles"
		                 @click.native="$router.push('/article/' + article.id)" :article="article"
		                 :key="article.id" :large="index === 0"/>
		<ion-infinite-scroll @ionInfinite="loadContent" :disabled="articles.length === 0">
			<ion-infinite-scroll-content/>
		</ion-infinite-scroll>
	</ion-content>
</ion-page>
</template>

<script>
import sanitizeHtml from 'sanitize-html';
import uniqBy from 'lodash/uniqBy';
import property from 'lodash/property';
import ArticlePreview from '../components/ArticlePreview';
import MediaComponent from '../components/Media.vue';
import { Search } from '../helpers/api';
import SaveScroll from '../mixins/SaveScroll';

export default {
	components: { ArticlePreview, Media: MediaComponent },
	props: ['name', 'from'],
	name: 'Author',
	mixins: [SaveScroll],
	data() {
		return {
			articles: [],
		};
	},
	asyncComputed: {
		article: {
			async get() {
				const search = new Search(this.API, { name: this.name });
				await search.next();
				if (search[0]) {
					const article = search[0];
					const content = sanitizeHtml(article.content);
					return {
						media: article.media,
						title: article.title,
						content,
					};
				}
				return {};
			},
			default: {},
		},
	},
	created() {
		this.s = new Search(this.API, { author: this.name });
		this.loadContent();
	},
	methods: {
		async loadContent(e) {
			const articles = (await this.s.next(10)).filter(article => article.id.toString() !== this.from);
			this.articles.push(...articles);
			this.articles = uniqBy(this.articles, property('id')).sort(({ date1 }, { date2 }) => date2 - date1);
			if (e) e.target.complete();
		},
	},
	inject: ['API'],
};
</script>
