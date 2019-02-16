<template>
<div :style="{'padding-top': aspect}"><img :src="src"/></div>
</template>

<script>
function getImage() {
	if (this.media) {
		this.media.fetch(this.API, this.$store).then(() => {
			const idealWidth = window.devicePixelRatio * window.screen.width;
			const sizes = this.media.sizes.sort((a, b) => a.width - b.width);
			const selectedSize = this.media.sizes.find(size => size.width >= idealWidth) || sizes[sizes.length - 1];
			this.src = selectedSize.url;
			this.aspect = `${selectedSize.aspectRatio}%`;
		});
	}
}

export default {
	name: 'Media',
	props: ['media'],
	data() {
		return {
			aspect: null,
			src: null,
			image: null,
		};
	},
	mounted: getImage,
	watch: {
		media: getImage,
	},
	inject: ['API'],
};
</script>

<style scoped>
div {
	width: 100%;
	position: relative;
}

img {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 0;
	right: 0;
}
</style>
