<template>
	<ion-card :class="{ small: !large }">
		<div class="media">
			<media v-if="article.media" :media="article.media" />
		</div>
		<div>
			<ion-card-header>
				<ion-card-title>{{ article.title }}</ion-card-title>
			</ion-card-header>
			<ion-card-content>
				<p v-shave="{ height: large ? 100 : 60 }">{{ excerpt }}</p>
			</ion-card-content>
		</div>
		<ion-card-content class="metadata">
			<p>{{ author }}</p>
			<p>{{ date }}</p>
		</ion-card-content>
	</ion-card>
</template>

<script>
import sanitizeHtml from 'sanitize-html';
import arrayToSentence from 'array-to-sentence';
import media from '../components/Media';
import { shortDate } from '../helpers/time';

export default {
	name: 'ArticlePreview',
	components: { media },
	props: ['article', 'large'],
	computed: {
		excerpt() {
			return sanitizeHtml(this.article.excerpt, { allowedTags: [] });
		},
		date() {
			return shortDate(this.article.date);
		},
		author() {
			if (!Array.isArray(this.article.writers)) return '';
			const writers = this.article.writers.filter(writer => writer !== '');
			return `by ${arrayToSentence(writers)}`;
		},
	},
};
</script>

<style lang="scss" scoped>
ion-card {
	margin-top: 15px;
	margin-bottom: 15px;
	background-color: white;
}

.dark ion-card {
	background-color: inherit;
}

ion-card:not(.small) ion-card-title {
	text-align: center;
}

ion-card.small {
	ion-card-title {
		font-size: 1.2rem;
	}

	ion-card-header {
		padding-bottom: 0;
	}

	ion-card-content {
		padding-top: 10px;
		padding-bottom: 0;
	}
}

ion-card-content {
	line-height: 19.6px;
}

ion-card-header {
	background: none;
}

ion-card-title {
	--color: var(--ion-color-step-700, #666);
}

.metadata {
	display: flex;
	justify-content: space-between;
	flex-wrap: nowrap;
	padding-top: 0;

	p:first-child {
		text-overflow: ellipsis;
		white-space: nowrap;
		overflow: hidden;
	}

	p:last-child {
		white-space: nowrap;
		padding-left: 10px;
	}
}

.small .media {
	float: right;
	width: 40%;
	padding-left: 5px;
}
</style>
