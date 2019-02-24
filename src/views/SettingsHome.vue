<template>
<ion-tabs>
	<!--<ion-vue-router/>-->
	<ion-page class="ion-page">
		<ion-header>
			<ion-toolbar>
				<ion-title>
					<logo/>
				</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="content outer-content">
			<br/>
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
					<ion-icon name="logo-twitter" slot="start" color="twitter"/>
					<ion-label>Follow us on Twitter</ion-label>
				</ion-item>
				<ion-item detail @click="openLinkGlobal('https://www.facebook.com/TheShakerite')">
					<ion-icon name="logo-facebook" slot="start" color="facebook"/>
					<ion-label>Visit us on Facebook</ion-label>
				</ion-item>
				<ion-item detail @click="openLinkGlobal('https://soundcloud.com/shakerite-podcast')">
					<ion-icon :src="logo.soundcloud" slot="start" color="soundcloud"/>
					<ion-label>Follow us on Soundcloud</ion-label>
				</ion-item>
				<ion-item
					  v-if="$isIOS"
					  detail
					  @click="openLinkGlobal('https://itunes.apple.com/us/podcast/the-shake/id1378107204?mt=2&app=podcast')">
					<ion-icon :src="logo.podcast" slot="start"/>
					<ion-label>Listen on Apple Podcasts</ion-label>
				</ion-item>
			</ion-list>
			<!--<ion-list-header>
				<ion-label>Theme</ion-label>
			</ion-list-header>
			<ion-list>
				<ion-radio-group>
					<ion-item>
						<ion-label>Light</ion-label>
						<ion-radio slot="end" value="light"></ion-radio>
					</ion-item>
					<ion-item>
						<ion-label>Dark</ion-label>
						<ion-radio slot="end" value="dark"></ion-radio>
					</ion-item>
				</ion-radio-group>
			</ion-list>
			<br/>-->
			<ion-list-header>
				<ion-label>Browser</ion-label>
			</ion-list-header>
			<ion-list>
				<ion-radio-group @ionChange="browser = $event.target.value" :value="browser">
					<ion-item>
						<ion-label>In-App Browser</ion-label>
						<ion-radio slot="end" value="inapp"></ion-radio>
					</ion-item>
					<ion-item>
						<ion-label>{{ $isIOS ? 'Safari' : 'System Browser' }}</ion-label>
						<ion-radio slot="end" value="system"></ion-radio>
					</ion-item>
				</ion-radio-group>
			</ion-list>
			<br/>
			<ion-list>
				<ion-item detail @click="$router.push('/about')">
					<ion-label>About</ion-label>
				</ion-item>
				<!--<ion-item detail @click="$router.push('/storage')">
					<ion-label>Storage</ion-label>
					<ion-note slot="end">55MB</ion-note>
				</ion-item>-->
				<ion-item detail @click="openLinkGlobal('mailto:shakeriteadviser@gmail.com?subject=Shakerite%20App')">
					<ion-label>Contact Us</ion-label>
				</ion-item>
				<ion-item detail @click="rate">
					<ion-label>Rate us on the App Store</ion-label>
				</ion-item>
			</ion-list>
			<br/>
			<ion-list>
				<ion-item detail @click="$router.push('/copyright')">
					<ion-label>Copyright</ion-label>
				</ion-item>
			</ion-list>

			<ion-item class="transparent" lines="none">
				<ion-label text-wrap><p>TWITTER, TWEET, RETWEET and the Twitter logo are trademarks of Twitter, Inc.
					or its affiliates.</p></ion-label>
			</ion-item>
		</ion-content>
	</ion-page>
</ion-tabs>

</template>

<script>
import SaveScroll from '../mixins/SaveScroll';
import { SET_BROWSER } from '../store/actions';
import openLink from '../helpers/link';
import Logo from '@/components/Logo';

export default {
	name: 'SettingsHome',
	components: { Logo },
	mixins: [SaveScroll],
	data() {
		return {
			logo: {
				podcast: require('../images/apple-podcasts.svg'),
				soundcloud: require('@fortawesome/fontawesome-free/svgs/brands/soundcloud.svg'),
			},
		};
	},
	methods: {
		openLink(url) {
			openLink(url, this.$store);
		},
		openLinkGlobal(url) {
			window.open(url, '_system');
		},
		rate() {
			window.open(`itms-apps://itunes.apple.com/app/viewContentsUserReviews/id508783468?action=write-review`, '_system');
		},
	},
	computed: {
		browser: {
			get() {
				return this.$store.state.browser;
			},
			set(browser) {
				this.$store.dispatch(SET_BROWSER, browser);
			},
		},
	},
};
</script>

<style scoped>
.list-ios {
	margin-bottom: 0;
}

ion-item.transparent {
	--background: none;
}
</style>
