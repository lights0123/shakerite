<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
<template>
	<fragment>
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-back-button />
				</ion-buttons>
				<ion-title>
					<logo />
				</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="outer-content">
			<p class="center" v-if="error">Author not found!</p>
			<h1 class="select">{{ article.title }}</h1>
			<media class="select" :media="article.media" />
			<div class="select content" v-html="article.content" />
			<article-preview
				:article="article"
				:key="article.id"
				:large="index === 0"
				@click.native="getNav().push('app-article', { id: article.id })"
				v-for="(article, index) in articles"
			/>
			<ion-infinite-scroll :disabled="articles.length === 0" @ionInfinite="loadContent">
				<ion-infinite-scroll-content />
			</ion-infinite-scroll>
		</ion-content>
	</fragment>
</template>

<script lang="ts">
import sanitizeHtml from 'sanitize-html';
import uniqBy from 'lodash/uniqBy';
import property from 'lodash/property';
import ArticlePreview from '@/components/ArticlePreview.vue';
import MediaComponent from '@/components/Media.vue';
import { Article, AuthorSearch, Post, Search } from '@/helpers/api';
import Logo from '@/components/Logo.vue';
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import openLink from '@/helpers/link';
import { RefresherEventDetail } from '@ionic/core';
import { getNav, injectParent } from '@/helpers';

type RefresherEvent = { target: RefresherEventDetail };
@Component({
	components: { Logo, ArticlePreview, Media: MediaComponent },
	asyncComputed: {
		article: {
			default: {},
			async get(this: Author) {
				const params: ConstructorParameters<typeof AuthorSearch>[1] = { search: false };
				if (this.slug) params.slug = this.name;
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
				} else if (this.onFailure) {
					openLink(this.onFailure, this.$store, true);
				} else this.error = true;
				return {};
			},
		},
	},
})
export default class Author extends Vue {
	@Prop({ type: String, required: true }) name!: string;
	@Prop(String) from?: string;
	@Prop({ type: String, default: '' }) onFailure;
	@Prop({ type: Boolean, default: false }) slug!: boolean;
	@Inject() readonly API!: any;
	articles: Post[] = [];
	authorName: string | null = null;
	s: Search<Post> | null = null;
	error = false;

	beforeCreate() {
		this.$store = this.$parent.$store;
	}

	getNav() {
		return getNav();
	}

	created() {
		this.s = new Search(this.API, { author: this.name });
		this.loadContent();
	}

	@Watch('authorName', { immediate: true })
	onArticleChange(authorName: string | null) {
		if (this.slug) {
			if (authorName) this.s = new Search(this.API, { author: authorName });
			else this.s = null;
		} else this.s = new Search(this.API, { author: this.name });
		this.loadContent();
	}

	async loadContent(e?: RefresherEvent) {
		if (!this.s) return;
		const articles = (await this.s.next(10)).items.filter(
			(article) => article.id.toString() !== this.from
		);
		this.articles.push(...articles);
		this.articles = uniqBy(this.articles, property('id')).sort((a, b) => +b.date - +a.date);
		if (e) e.target.complete();
	}
}

Vue.customElement('app-author', (Author as any).options, injectParent);
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
