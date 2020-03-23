<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
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
		openLink(url, this.$store);
	}
}
</script>
