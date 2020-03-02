<template>
	<a @click="openLink(href)">
		<slot />
	</a>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import openLink from '@/helpers/link';
import { getNav } from '@/helpers';

@Component
export default class A extends Vue {
	@Prop(String)
	public href!: string;

	openLink(url: string) {
		const authorURL = /^https?:\/\/shakerite.com\/staff_profile\/([^ \t/]+)\/?$/.exec(url);
		if (authorURL) {
			return getNav().push('app-author', { name: authorURL[1], slug: true });
		}
		const postURL = /^https?:\/\/shakerite.com\/[^ \t/]+\/([^ \t/]+)/.exec(url);
		if (postURL) {
			return getNav().push('app-article', { id: postURL[1], slug: true });
		}
		openLink(url, this.$store);
	}

};
</script>

<style scoped>

</style>
