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
		<ion-content class="content" :style="cssProps">
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

<script>
import FontPopover from '@/components/FontPopover.vue';
import { mapState } from 'vuex';
import { Plugins } from '@capacitor/core';
import MediaComponent from '../components/Media';
import A from '../components/A';
import { Article, Media } from '../helpers/api';
import sanitizeHtml from 'sanitize-html';
import SaveScroll from '../mixins/SaveScroll';
import { SET_SAVED_ARTICLES } from '../store/actions';
import Logo from '@/components/Logo.vue';

const { Share } = Plugins;
export default {
	name: 'Article',
	components: { Media: MediaComponent, Logo },
	mixins: [SaveScroll],
	props: ['id'],
	methods: {
		openFonts(event) {
			this.$ionic.popoverController.create({
				component: FontPopover,
				componentProps: { parent: this },
				event,
			}).then(p => p.present());
		},
		share() {
			Share.share({
				title: this.article.title,
				text: this.article.title,
				url: `https://shakerite.com/?p=${this.id}`,
				dialogTitle: 'Share',
			});
		},
	},
	computed: {
		...mapState({
			fontFamily: state => state.font.family,
			fontWeight: state => state.font.weight,
			fontSize: state => state.font.size,
			bg: state => state.font.bg,
			fg: state => state.font.fg,
		}),
		cssProps() {
			return {
				'--color': this.fg,
				'--background': this.bg,
				'--font-family': this.fontFamily,
				'--font-weight': this.fontWeight,
				'--font-size': `${this.fontSize}px`,
			};
		},
		saved: {
			get() {
				return this.$store.state.savedArticles.includes(this.id);
			},
			set(state) {
				if (state) this.$store.dispatch(SET_SAVED_ARTICLES, [...this.$store.state.savedArticles, this.id]);
				else {
					const otherArticles = this.$store.state.savedArticles.filter(article => article !== this.id);
					this.$store.dispatch(SET_SAVED_ARTICLES, otherArticles);
				}
			},
		},
	},
	asyncComputed: {
		article: {
			async get() {
				const article = await Article.getPost(this.API, parseInt(this.id, 10), this.$store);
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
				const images = {};
				parser.querySelectorAll('a').forEach((e) => {
					if (e.children.length !== 1 || e.children[0].tagName !== 'IMG') {
						const link = document.createElement('smart-link');
						link.setAttribute('href', e.getAttribute('href'));
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
				let categories = [];
				article.categories.forEach((category) => {
					categories.push(category.fetch());
				});
				categories = await Promise.all(categories);
				let writers = article.writers || [];
				writers = writers.filter(writer => writer !== '');
				return {
					media: article.media,
					title: article.title,
					subtitle: article.subtitle,
					content,
					categories,
					writers,
					excerpt: article.excerpt,
				};
			},
			default: {},
		},
	},
	inject: ['API'],
};
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
	color: var(--ion-color-step-750);
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
