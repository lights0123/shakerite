<template>
	<fragment>
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-back-button />
				</ion-buttons>
				<ion-title>
					<logo />
				</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="content">
			<div class="padding">
				<ion-text class="text">
					<h1>The Shakerite App</h1>

					<p>
						The Shakerite app was created by
						<smart-link href="https://lights0123.com">Ben Schattinger</smart-link>.
						Contact us to submit feedback.
					</p>
				</ion-text>
			</div>
		</ion-content>
	</fragment>
</template>

<script lang="ts">
import Logo from '@/components/Logo.vue';
import A from '@/components/A.vue';
import { Component, Vue } from 'vue-property-decorator';
import { injectParent } from '@/helpers';

@Component({
	components: { Logo, SmartLink: A },
})
export default class About extends Vue {
	beforeCreate() {
		this.$store = this.$parent.$store;
	}
}

Vue.customElement('app-about', (About as any).options, injectParent);
</script>

<style scoped>
.padding {
	padding: 15px;
}

.text {
	user-select: auto;
}
</style>
