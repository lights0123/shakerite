<template>
	<ion-page class="ion-page">
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-button @click="$router.back()">
						<ion-icon name="arrow-back" />
						<span v-if="$isIOS">Back</span>
					</ion-button>
				</ion-buttons>
				<ion-title>
					<logo />
				</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="outer-content">
			<p class="center" v-if="error">Author not found!</p>
			<h1 class="select">{{article.title}}</h1>
			<media class="select" :media="article.media" />
			<div class="select content" v-html="article.content" />
			<article-preview :article="article"
			                 :key="article.id" :large="index === 0"
			                 @click.native="$router.push('/article/' + article.id)"
			                 v-for="(article, index) in articles" />
			<ion-infinite-scroll :disabled="articles.length === 0" @ionInfinite="loadContent">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
import sanitizeHtml from 'sanitize-html';
import uniqBy from 'lodash/uniqBy';
import property from 'lodash/property';
import ArticlePreview from '@/components/ArticlePreview.vue';
import MediaComponent from '@/components/Media.vue';
import { AuthorSearch, Post, Search } from '@/helpers/api';
import SaveScroll from '@/mixins/SaveScroll';
import Logo from '@/components/Logo.vue';
import { Component, Inject, Mixins, Prop, Watch } from 'vue-property-decorator';
import AsyncComputed from '@/components/asyncComputed';
import openLink from '@/helpers/link';
import { RefresherEventDetail } from '@ionic/core';

type RefresherEvent = { target: RefresherEventDetail };
@Component({ components: { Logo, ArticlePreview, Media: MediaComponent } })
export default class Author extends Mixins(SaveScroll) {
	@Prop() name!: string;
	@Prop() from?: string;
	@Inject() readonly API!: any;
	articles: Post[] = [];
	authorName: string | null = null;
	s: Search<Post> | null = null;
	error = false;

	@AsyncComputed({ default: {} })
	async article() {
		const params: ConstructorParameters<typeof AuthorSearch>[1] = { search: false };
		if (this.$route.query.slug) params.slug = this.name;
		else params.name = this.name;
		const search = new AuthorSearch(this.API, params);
		await search.next(1);
		if (search.items[0]) {
			const article = search.items[0];
			this.authorName = article.title;
			const content = sanitizeHtml(article.content);
			return {
				media: article.media,
				title: article.title,
				content,
			};
		} else if (this.$route.query.slug) {
			openLink(`https://shakerite.com/staff-profile/${this.name}`, this.$store);
		} else this.error = true;
		return {};
	}

	created() {
		this.s = new Search(this.API, { author: this.name });
		this.loadContent();
	}

	@Watch('authorName', { immediate: true })
	onArticleChange(authorName: string | null) {
		if (this.$route.query.slug) {
			if (authorName) this.s = new Search(this.API, { author: authorName });
			else this.s = null;
		} else this.s = new Search(this.API, { author: this.name });
		this.loadContent();
	}

	async loadContent(e?: RefresherEvent) {
		if (!this.s) return;
		const articles = (await this.s.next(10)).items.filter(article => article.id.toString() !== this.from);
		this.articles.push(...articles);
		this.articles = uniqBy(this.articles, property('id')).sort(({ date1 }, { date2 }) => date2 - date1);
		if (e) e.target.complete();
	}
};
</script>

<style lang="scss" scoped>
.center {
	text-align: center;
}

.content {
	margin-left: 1em;
	margin-right: 1em;
}

.select {
	user-select: auto;
}
</style>
