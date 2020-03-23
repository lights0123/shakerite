<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
<template>
	<a @click="openLink">
		<slot />
	</a>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { getNav } from '@/helpers';

@Component
export default class NavLink extends Vue {
	@Prop(String) component!: string;
	@Prop() componentProps!: any;

	openLink() {
		getNav().push(this.component, this.componentProps);
	}
}
</script>
