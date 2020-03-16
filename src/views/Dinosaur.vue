<template>
	<fragment>
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-back-button />
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
		<ion-content class="content">
			<iframe class="dino" :srcdoc="dino"></iframe>
		</ion-content>
	</fragment>
</template>

<script lang="ts">
import dino from '@/components/dinosaur.html';
import { Component, Vue } from 'vue-property-decorator';
import { injectParent } from '@/helpers';

@Component
export default class Dinosaur extends Vue {
	dino = dino;
}

Vue.customElement('app-dino', (Dinosaur as any).options, injectParent);
</script>

<style scoped>
.dino {
	width: 100%;
	height: 100%;
	user-select: none;
}
</style>
