<template>
	<div class="wrapper" :class="avatar ? 'avatar' : ''" :style="avatar ? {} : {'padding-top': aspect}">
		<img :src="src" />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Prop, Vue, Watch } from 'vue-property-decorator';


@Component
export default class Media extends Vue {
	@Prop() media!: any;
	@Prop({ type: Boolean, default: false }) avatar!: boolean;
	aspect: string | null = null;
	src: string | null = null;
	image = null;

	@Watch('media', { immediate: true })
	async onMedia() {
		try {
			if (this.media) {
				await this.media.fetch(this.API, this.$store);
				const idealWidth = window.devicePixelRatio * window.screen.width;
				const sizes = this.media.sizes.sort((a, b) => a.width - b.width);
				const selectedSize = this.media.sizes.find(size => size.width >= idealWidth) || sizes[sizes.length - 1];
				this.src = selectedSize.url;
				this.aspect = `${selectedSize.aspectRatio}%`;
			}
		} catch (e) {
			console.error(e);
		}
	}

	@Inject() readonly API!: any;
}
</script>

<style scoped lang="scss">
.wrapper:not(.avatar) {
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
</style>
