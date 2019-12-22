<template>
	<ion-page class="ion-page">
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-button @click="$router.back()">
						<ion-icon name="arrow-back" />
					</ion-button>
					<ion-button @click="saved = !saved">
						<font-awesome-icon :icon="[saved ? 'fas' : 'far', 'bookmark']" size="lg" />
					</ion-button>
				</ion-buttons>
				<ion-buttons slot="primary">
					<ion-button @click="openFonts">
						<font-awesome-icon icon="font" size="lg" />
					</ion-button>
					<ion-button @click="share">
						<ion-icon slot="icon-only" name="share" />
					</ion-button>
				</ion-buttons>
				<ion-title>
					<logo />
				</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content :style="cssProps" class="content">
			<small v-if="article.categories" class="categories"><span v-for="category in article.categories"
			                                                          :key="category.id"
			>{{ category.name }}</span>
			</small>
			<h1>{{ article.title }}</h1>
			<h2 v-if="article.subtitle">{{ article.subtitle }}</h2>
			<small v-if="article.writers">
				<span v-for="writer in article.writers"
				      :key="writer"
				      class="author"
				>
					<router-link :to="`/author/${writer}/${id}`">{{ writer }}</router-link>
				</span>
			</small>
			<media :media="article.media" />
			<div class="article">
				<component :is="article.content" />
			</div>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
import { Component, Inject, Mixins, Prop } from 'vue-property-decorator';
import sanitizeHtml from 'sanitize-html';
import { Plugins } from '@capacitor/core';
import FontPopover from '../components/FontPopover.vue';
import MediaComponent from '../components/Media.vue';
import A from '../components/A.vue';
import { Article, Media } from '@/helpers/api';
import SaveScroll from '../mixins/SaveScroll';
import { SET_SAVED_ARTICLES } from '@/store/actions';
import Logo from '../components/Logo.vue';
import AsyncComputed from '@/components/asyncComputed';
// eslint-disable-next-line no-unused-vars
import { Category } from '@/helpers/categories';

const { Share } = Plugins;
@Component({
	components: {
		Media: MediaComponent, Logo,
	},
})
export default class ArticlePage extends Mixins(SaveScroll) {
	@Prop(String)
	id;

	openFonts(event: MouseEvent) {
		this.$ionic.popoverController.create({
			component: FontPopover,
			componentProps: { parent: this },
			event,
		}).then(p => (p as unknown as { present(): Promise<void> }).present());
	}

	share() {
		if (!this.article) return;
		Share.share({
			title: this.article.title,
			text: this.article.title,
			url: `https://shakerite.com/?p=${this.id}`,
			dialogTitle: 'Share',
		});
	}

	get fontFamily() {return this.$store.state.font.family;}

	get fontWeight() {return this.$store.state.font.weight;}

	get fontSize() {return this.$store.state.font.size;}

	get bg() {return this.$store.state.font.bg;}

	get fg() {return this.$store.state.font.fg;}

	get cssProps() {
		return {
			'--color': this.fg,
			'--background': this.bg,
			'--font-family': this.fontFamily,
			'--font-weight': this.fontWeight,
			'--font-size': `${this.fontSize}px`,
		};
	}

	get saved() {
		return this.$store.state.savedArticles.includes(this.id);
	}

	set saved(state) {
		if (state) this.$store.dispatch(SET_SAVED_ARTICLES, [...this.$store.state.savedArticles, this.id]);
		else {
			const otherArticles = this.$store.state.savedArticles.filter(article => article !== this.id);
			this.$store.dispatch(SET_SAVED_ARTICLES, otherArticles);
		}
	}

	// @ts-ignore
	article?: { media: Media, title: string, subtitle?: string, content: Vue, categories: Category[], writers: string[], excerpt: string };

	@AsyncComputed({ default: {} })
	// @ts-ignore
	async article() {
		const article: Article = await Article.getPost(this.API, parseInt(this.id, 10), this.$store);
		let content = sanitizeHtml(article.content, {
			allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
			allowedAttributes: {
				img: ['src', 'srcset', 'class'],
				iframe: ['src', 'allowfullscreen'],
				a: ['href', 'target'],
			},
			allowedClasses: {
				div: ['pullquote'],
				p: ['pullquotetext', 'quotespeaker'],
			},
			transformTags: {
				a: sanitizeHtml.simpleTransform('a', { target: '_blank' }),
			},
		});
		const parser = new DOMParser().parseFromString(content, 'text/html');
		const images: { [id: string]: Media } = {};
		parser.querySelectorAll('a').forEach((e) => {
			if (e.children.length !== 1 || e.children[0].tagName !== 'IMG') {
				const link = document.createElement('smart-link');
				link.setAttribute('href', e.getAttribute('href') || '');
				link.innerHTML = e.innerHTML;
				e.replaceWith(link);
				return;
			}
			// Wordpress saved the image ID as a class on the <a> element. An example is wp-image-18655.
			const parsedClass = /wp-image-(\d+)/i.exec(e.children[0].className);
			if (!parsedClass) return;
			const imageID = parsedClass[1];
			images[imageID] = new Media(imageID);
			const media = document.createElement('media');
			media.setAttribute(':media', `images[${imageID}]`);
			e.replaceWith(media);
		});
		content = {
			data() {
				return { images };
			},
			components: { Media: MediaComponent, SmartLink: A },
			template: parser.body.innerHTML,
		};
		const categoriesPromises: Promise<Category>[] = [];
		article.categories.forEach((category) => {
			categoriesPromises.push(category.fetch(this.API));
		});
		const categories: Category[] = await Promise.all(categoriesPromises);
		const writers: string[] = (article.writers || []).filter(writer => writer !== '');
		return {
			media: article.media,
			title: article.title,
			subtitle: article.subtitle,
			content,
			categories,
			writers,
			excerpt: article.excerpt,
		};
	}

	@Inject() readonly API!: any;
}
</script>

<style scoped>
h1 {
	font-size: calc(var(--font-size) * 1.8);
	text-align: center;
}

h2 {
	font-size: calc(var(--font-size) * 1.2);
	text-align: center;
}

small {
	font-size: var(--font-size);
	text-align: center;
	display: block;
}

.article {
	user-select: auto;
}

.article, p {
	font-size: var(--font-size);
}

.article >>> iframe {
	width: 100vw;
}

.article >>> iframe[src*="://youtube.com"], .article >>> iframe[src*="://www.youtube.com"] {
	height: 56.25vw;
}

.article >>> h1, .article >>> h2, .article >>> h3, .article >>> h4, .article >>> h5, .article >>> h6, .article >>> p {
	margin-left: 15px;
	margin-right: 15px;
}

.article >>> .pullquote {
	/* Hide everything except for .pullquotetext and .quotespeaker */
	font-size: 0;
}

.article >>> .pullquotetext {
	font-size: calc(var(--font-size) * 2);
}

.article >>> .pullquotetext:before {
	content: "“";
}

.article >>> .quotespeaker {
	font-size: calc(var(--font-size) * 1.3);
}

* {
	font-family: var(--font-family, "Open Sans");
	font-weight: var(--font-weight, normal);
}

.categories span:not(:last-child) {
	padding-right: 1em;
}

.author:first-child:nth-last-child(2):after {
	content: " and ";
}

.author:not(:nth-last-child(2)):not(:last-child):after {
	content: ", ";
}

.author:nth-last-child(2):after {
	content: ", and ";
}

.author >>> a {
	text-decoration: none;
	color: inherit;
	font-weight: bolder;
}
</style>
