<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
<template>
	<fragment>
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-back-button text="" />
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
			<small v-if="article.categories" class="categories">
				<span v-for="category in article.categories" :key="category.id">
					{{ category.name }}
				</span>
			</small>
			<h1>{{ article.title }}</h1>
			<h2 v-if="article.subtitle">{{ article.subtitle }}</h2>
			<small v-if="article.writers">
				<span v-for="writer in article.writers" :key="writer" class="author">
					<nav-link component="app-author" :componentProps="{ name: writer, from: id }">
						{{ writer }}
					</nav-link>
				</span>
			</small>
			<gallery v-if="gallery" :pictures="gallery" />
			<media v-else :media="article.media" />
			<div class="article">
				<div v-html="article.mediaCaption" class="wp-caption" />
				<component :is="article.content" />
			</div>
		</ion-content>
	</fragment>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import sanitizeHtml from 'sanitize-html';
import { Plugins } from '@capacitor/core';
import FontPopover from '../components/FontPopover.vue';
import MediaComponent from '../components/Media.vue';
import A from '../components/A.vue';
import { Article, Media } from '@/helpers/api';
import { SET_SAVED_ARTICLES } from '@/store/actions';
import Logo from '../components/Logo.vue';
import { Category } from '@/helpers/categories';
import Gallery from '@/components/Gallery.vue';
import { getNav, injectParent } from '@/helpers';
import NavLink from '@/components/NavLink.vue';
import openLink from '@/helpers/link';

const { Share } = Plugins;
@Component({
	components: {
		Gallery,
		Media: MediaComponent,
		Logo,
		NavLink,
	},
})
export default class ArticlePage extends Vue {
	@Prop(String) id;
	@Prop({ type: Boolean, default: false }) slug;
	@Prop({ type: String, default: '' }) onFailure;
	@Inject() readonly API!: any;

	gallery: number[] | null = null;

	getNav() {
		return getNav();
	}

	beforeCreate() {
		this.$store = this.$parent.$store;
	}

	openFonts(event: MouseEvent) {
		this.$ionic.popoverController
			.create({
				component: FontPopover,
				componentProps: { parent: this },
				event,
			})
			.then((p) => ((p as unknown) as { present(): Promise<void> }).present());
	}

	share() {
		if (!('title' in this.article)) return;
		Share.share({
			title: this.article.title,
			text: this.article.title,
			url: this.article.link || `https://shakerite.com/?p=${this.id}`,
			dialogTitle: 'Share',
		});
	}

	get fontFamily() {
		return this.$store.state.font.family;
	}

	get fontWeight() {
		return this.$store.state.font.weight;
	}

	get fontSize() {
		return this.$store.state.font.size;
	}

	get bg() {
		return this.$store.state.font.bg;
	}

	get fg() {
		return this.$store.state.font.fg;
	}

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
		if (state)
			this.$store.dispatch(SET_SAVED_ARTICLES, [...this.$store.state.savedArticles, this.id]);
		else {
			const otherArticles = this.$store.state.savedArticles.filter(
				(article) => article !== this.id
			);
			this.$store.dispatch(SET_SAVED_ARTICLES, otherArticles);
		}
	}

	article:
		| {
				media: Media;
				title: string;
				subtitle?: string;
				content: Vue.ComponentOptions<Vue>;
				categories: Category[];
				writers: string[];
				excerpt: string;
				link?: string;
		  }
		| {} = {};

	get loaded() {
		return 'title' in this.article;
	}

	@Watch('id', { immediate: true })
	async idUpdated() {
		this.article = {};
		try {
			const article: Article = this.slug
				? await Article.getPostBySlug(this.API, this.id)
				: await Article.getPost(this.API, parseInt(this.id, 10), this.$store);
			// see /data-examples/gallery.html
			const galleryIDs = /var photoids = '([\d,]+)';/.exec(article.content)?.[1];
			if (galleryIDs) {
				this.gallery = JSON.parse(`[${galleryIDs}]`);
			} else this.gallery = null;
			const mediaCaption =
				article.media?.caption &&
				sanitizeHtml(article.media.caption, { allowedTags: ['p'] });
			let contentString = sanitizeHtml(`<div>${article.content}</div>`, {
				allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
				allowedAttributes: {
					img: ['src', 'srcset', 'class'],
					iframe: ['src', 'allowfullscreen'],
					a: ['href', 'target'],
					div: ['data-photo-ids'],
				},
				allowedClasses: {
					div: [
						'pullquote',
						'storysidebar',
						'photowrap',
						'remodal',
						'sfiphotowrap',
						'wp-caption',
					],
					p: ['pullquotetext', 'quotespeaker'],
				},
				transformTags: {
					a: sanitizeHtml.simpleTransform('a', { target: '_blank' }),
				},
			});
			const parser = new DOMParser().parseFromString(contentString, 'text/html');
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
			// see /data-examples/sfiphotowrap.html
			parser.querySelectorAll('div.photowrap').forEach((e) => {
				if (e.children[0]?.classList.contains('sfiphotowrap')) {
					const gallery = document.createElement('gallery');
					gallery.setAttribute(
						':pictures',
						JSON.stringify(
							JSON.parse(`[${e.children[0].getAttribute('data-photo-ids')}]`)
						)
					);
					e.replaceWith(gallery);
				}
			});
			const content = {
				data() {
					return { images };
				},
				components: { Media: MediaComponent, SmartLink: A, Gallery },
				template: parser.body.innerHTML,
			};
			const categoriesPromises: Promise<Category>[] = [];
			article.categories.forEach((category) => {
				categoriesPromises.push(category.fetch(this.API));
			});
			const categories: Category[] = await Promise.all(categoriesPromises);
			const writers: string[] = (article.writers || []).filter((writer) => writer !== '');
			this.article = {
				media: article.media,
				mediaCaption,
				title: article.title,
				subtitle: article.subtitle,
				content,
				categories,
				writers,
				excerpt: article.excerpt,
				link: article.link,
			};
		} catch (e) {
			console.error(e);
			if (this.onFailure) {
				openLink(this.onFailure, this.$store, true);
			}
			this.getNav().pop();
		}
	}
}

Vue.customElement('app-article', (ArticlePage as any).options, injectParent);
</script>

<style lang="scss" scoped>
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

.content {
	user-select: auto;
}

.article,
p {
	font-size: var(--font-size);
}

.categories span:not(:last-child) {
	padding-right: 1em;
}

.author:first-child:nth-last-child(2):after {
	content: ' and ';
}

.author:not(:nth-last-child(2)):not(:last-child):after {
	content: ', ';
}

.author:nth-last-child(2):after {
	content: ', and ';
}

.author::v-deep a {
	text-decoration: none;
	color: inherit;
	font-weight: bolder;
}

.article::v-deep {
	iframe {
		width: 100vw;
	}

	iframe[src*="://youtube.com"], .article::v-deep iframe[src*="://www.youtube.com"]
	{
		height: 56.25vw;
	}

	h1,
	h2,
	h3,
	h4,
	h5,
	h6,
	p {
		margin-left: 15px;
		margin-right: 15px;
	}

	.storysidebar {
		font-size: calc(var(--font-size) * 1.4);
	}

	.pullquote {
		/* Hide everything except for .pullquotetext and .quotespeaker */
		font-size: 0;
	}

	.pullquotetext {
		font-size: calc(var(--font-size) * 2);
	}

	.photowrap,
	.remodal {
		display: none;
	}

	.remodal + div + p {
		display: none;
	}

	.pullquotetext:before {
		content: '“';
	}

	.quotespeaker {
		font-size: calc(var(--font-size) * 1.3);
	}

	.wp-caption p {
		font-size: calc(var(--font-size) * 0.9);
		margin-left: 25px;
		margin-right: 25px;
		margin-top: 0;
		font-style: italic;

		a {
			margin-bottom: 0.5em;
			display: block;

			&:before {
				content: 'Photo by ';
				color: var(--color);
			}
		}

		br {
			display: none;
		}
	}
}

* {
	font-family: var(--font-family, 'Open Sans');
	font-weight: var(--font-weight, normal);
}
</style>
