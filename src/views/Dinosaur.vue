<template>
	<ion-page class="ion-page">
		<ion-header>
			<ion-toolbar>
				<ion-buttons slot="start">
					<ion-button @click="$router.back()">
						<ion-icon name="arrow-back"></ion-icon>
						<span v-if="$isIOS">Back</span>
					</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
		<ion-content class="content">
			<iframe class="dino" :srcdoc="dino"></iframe>
		</ion-content>
	</ion-page>
</template>

<script lang="ts">
import dino from '@/components/dinosaur.html';

export default {
	data() {
		return {
			dino: dino,
		};
	},
	name: 'Dinosaur',
};
</script>

<style scoped>
.dino {
	width: 100%;
	height: 100%;
}
</style>
