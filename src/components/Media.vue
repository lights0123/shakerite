<template>
	<div
		class="wrapper"
		:class="[avatar ? 'avatar' : '', caption ? 'caption' : '']"
		:style="avatar || caption ? {} : { 'padding-top': aspect }"
	>
		<img :src="src" />
		<p v-if="caption">{{ sanitize(captionText) }}</p>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';
import sanitizeHtml from 'sanitize-html';
import { Media as MediaAPI } from '@/helpers/api';

@Component
export default class Media extends Vue {
	@Prop() media!: MediaAPI;
	@Prop({ type: Boolean, default: false }) avatar!: boolean;
	@Prop({ type: Boolean, default: false }) caption!: boolean;
	aspect: string | null = null;
	src: string | null = null;
	image = null;
	captionText: string | null = null;

	@Watch('media', { immediate: true })
	async onMedia() {
		try {
			if (this.media) {
				await this.media.fetch(this.API, this.$store);
				const idealWidth = window.devicePixelRatio * window.screen.width;
				const sizes = this.media.sizes.sort((a, b) => a.width - b.width);
				const selectedSize =
					this.media.sizes.find(size => size.width >= idealWidth) ||
					sizes[sizes.length - 1];
				this.src = selectedSize.url;
				this.aspect = `${selectedSize.aspectRatio}%`;
				this.captionText = this.media.caption ?? null;
			}
		} catch (e) {
			console.error(e);
		}
	}

	sanitize(text: string) {
		return sanitizeHtml(text, { allowedTags: [] });
	}

	@Inject() readonly API!: any;
}
</script>

<style scoped lang="scss">
.wrapper:not(.avatar):not(.caption) {
	width: 100%;
	position: relative;

	img {
		width: 100%;
		position: absolute;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
	}
}

.avatar {
	height: 100%;

	img {
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}
}

.caption {
	img {
		max-height: 67vw;
	}

	p {
		font-size: calc(var(--font-size) * 0.8);
		word-break: break-word;
	}
}
</style>
