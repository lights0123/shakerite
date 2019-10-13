<template>
	<a @click="openLink(href)">
		<slot />
	</a>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import openLink from '../helpers/link';

@Component
export default class A extends Vue {
	@Prop(String)
	public href!: string;

	openLink(url: string) {
		openLink(url, this.$store);
	}

};
</script>

<style scoped>

</style>
