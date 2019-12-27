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
	</ion-page>
</template>

<script>

import Logo from '@/components/Logo';
import A from '@/components/A';

export default {
	name: 'About',
	components: { Logo, SmartLink: A },
};
</script>

<style scoped>
.padding {
	padding: 15px;
}

.text {
	user-select: auto;
}
</style>
