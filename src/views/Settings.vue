<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
<template>
	<fragment>
		<ion-header>
			<ion-toolbar>
				<ion-title>
					<logo />
				</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="content outer-content">
			<br />
			<!--<ion-list>
				<ion-item detail @click="true || $router.push('/alerts')">
					<ion-label>Alerts</ion-label>
				</ion-item>
			</ion-list>-->
			<ion-list-header>
				<ion-label>Follow Us</ion-label>
			</ion-list-header>
			<ion-list>
				<ion-item detail @click="openLinkGlobal('https://twitter.com/TheShakerite')">
					<ion-icon slot="start" color="twitter" name="logo-twitter" />
					<ion-label>Follow us on Twitter</ion-label>
				</ion-item>
				<ion-item detail @click="openLinkGlobal('https://www.facebook.com/TheShakerite')">
					<ion-icon slot="start" color="facebook" name="logo-facebook" />
					<ion-label>Visit us on Facebook</ion-label>
				</ion-item>
				<ion-item
					detail
					@click="openLinkGlobal('https://soundcloud.com/shakerite-podcast')"
				>
					<ion-icon slot="start" :src="logo.soundcloud" color="soundcloud" />
					<ion-label>Follow us on Soundcloud</ion-label>
				</ion-item>
				<ion-item
					v-if="$isIOS"
					detail
					@click="
						openLinkGlobal(
							'https://itunes.apple.com/us/podcast/the-shake/id1378107204?mt=2&app=podcast'
						)
					"
				>
					<ion-icon slot="start" :src="logo.podcast" />
					<ion-label>Listen on Apple Podcasts</ion-label>
				</ion-item>
			</ion-list>
			<ion-list-header>
				<ion-label>Theme</ion-label>
			</ion-list-header>
			<ion-list>
				<ion-radio-group :value="theme" @ionChange="theme = $event.target.value">
					<ion-item>
						<ion-label>System Default</ion-label>
						<ion-radio slot="end" value="default" />
					</ion-item>
					<ion-item>
						<ion-label>Light</ion-label>
						<ion-radio slot="end" value="light" />
					</ion-item>
					<ion-item>
						<ion-label>Dark</ion-label>
						<ion-radio slot="end" value="dark" />
					</ion-item>
				</ion-radio-group>
			</ion-list>
			<ion-list-header>
				<ion-label>Browser</ion-label>
			</ion-list-header>
			<ion-list>
				<ion-radio-group :value="browser" @ionChange="browser = $event.target.value">
					<ion-item>
						<ion-label>In-App Browser</ion-label>
						<ion-radio slot="end" value="inapp" />
					</ion-item>
					<ion-item>
						<ion-label>{{ $isIOS ? 'Safari' : 'System Browser' }}</ion-label>
						<ion-radio slot="end" value="system" />
					</ion-item>
				</ion-radio-group>
			</ion-list>
			<br />
			<ion-list>
				<ion-item detail @click="getNav().push('app-about')">
					<ion-label>About</ion-label>
				</ion-item>
				<!--<ion-item detail @click="$router.push('/storage')">
					<ion-label>Storage</ion-label>
					<ion-note slot="end">55MB</ion-note>
				</ion-item>-->
				<ion-item
					detail
					@click="
						openLinkGlobal('mailto:shakeriteadviser@gmail.com?subject=Shakerite%20App')
					"
				>
					<ion-label>Contact Us</ion-label>
				</ion-item>
				<ion-item detail @click="rate">
					<ion-label>Rate us on the App Store</ion-label>
				</ion-item>
			</ion-list>
			<br />
			<ion-list>
				<ion-item detail @click="getNav().push('app-copyright')">
					<ion-label>Copyright</ion-label>
				</ion-item>
			</ion-list>

			<ion-item class="transparent" lines="none">
				<ion-label text-wrap>
					<p>
						TWITTER, TWEET, RETWEET and the Twitter logo are trademarks of Twitter, Inc.
						or its affiliates.
					</p>
				</ion-label>
			</ion-item>
		</ion-content>
	</fragment>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { SET_BROWSER, SET_THEME } from '@/store/actions';
import Logo from '@/components/Logo.vue';
import { review } from '@/helpers/review';
import openLink from '@/helpers/link';
import { getNav, injectParent } from '@/helpers';

@Component({
	components: { Logo },
})
export default class Settings extends Vue {
	beforeCreate() {
		this.$store = this.$parent.$store;
	}

	getNav() {
		return getNav();
	}

	logo = {
		podcast: require('../images/apple-podcasts.svg'),
		soundcloud: require('@fortawesome/fontawesome-free/svgs/brands/soundcloud.svg'),
	};

	openLink(url) {
		openLink(url, this.$store);
	}

	openLinkGlobal(url) {
		window.open(url, '_system');
	}

	rate() {
		review();
	}

	get browser() {
		return this.$store.state.browser;
	}

	set browser(browser) {
		this.$store.dispatch(SET_BROWSER, browser);
	}

	get theme() {
		return this.$store.state.theme;
	}

	set theme(theme) {
		this.$store.dispatch(SET_THEME, theme);
	}
}

Vue.customElement('app-settings', (Settings as any).options, injectParent);
</script>

<style scoped>
.list-ios {
	margin-bottom: 0;
}

ion-item.transparent {
	--background: none;
}
</style>
