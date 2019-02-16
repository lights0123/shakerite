<template>
<a @click="openLink(href)">
	<slot/>
</a>
</template>

<script>
import openLink from '../helpers/link.ts';

export default {
	name: 'A',
	props: ['href'],
	methods: {
		openLink(url) {
			openLink(url, this.$store);
		},
	},
};
</script>

<style scoped>

</style>
