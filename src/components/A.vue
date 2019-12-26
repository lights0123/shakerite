<template>
	<a @click="openLink(href)">
		<slot />
	</a>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import openLink from '@/helpers/link';

@Component
export default class A extends Vue {
	@Prop(String)
	public href!: string;

	openLink(url: string) {
		const authorURL = /^https?:\/\/shakerite.com\/staff_profile\/([^ \t/]+)\/?$/.exec(url);
		if (authorURL) {
			return this.$router.push({ path: `/author/${authorURL[1]}`, query: { slug: 'true' } });
		}
		const postURL = /^https?:\/\/shakerite.com\/[^ \t/]+\/([^ \t/]+)/.exec(url);
		if(postURL) {
			return this.$router.push({ path: `/article/${postURL[1]}`, query: { slug: 'true' } });
		}
		openLink(url, this.$store);
	}

};
</script>

<style scoped>

</style>
