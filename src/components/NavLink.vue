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

};
</script>

<style scoped>

</style>
