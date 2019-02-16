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
			<ion-title><logo/></ion-title>
		</ion-toolbar>
	</ion-header>
	<ion-content class="content">
		<div class="padding">
			<ion-text>
				<h1>The New Shakerite App</h1>

				<p>
					The new Shakerite app was created by Ben Schattinger. Contact us to submit feedback.
				</p>
			</ion-text>
		</div>
	</ion-content>
</ion-page>
</template>

<script>

import Logo from '@/components/Logo';
export default {
	name: 'About',
	components: { Logo },
};
</script>

<style scoped>
.padding {
	padding: 15px;
}
</style>
