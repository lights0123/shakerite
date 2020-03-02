<template>
	<ion-app>
		<ion-tabs>
			<ion-tab tab="news">
				<ion-nav root="app-news" />
			</ion-tab>

			<ion-tab tab="saved">
				<ion-nav root="app-saved" />
			</ion-tab>

			<ion-tab tab="settings">
				<ion-nav root="app-settings" />
			</ion-tab>

			<ion-tab-bar slot="bottom" ref="tabBar">
				<ion-tab-button tab="news" @click="click('news')">
					<ion-icon name="paper" />
					<ion-label>News</ion-label>
				</ion-tab-button>

				<ion-tab-button tab="saved" @click="click('saved')">
					<ion-icon :src="bookmarkURL" class="bookmark-icon" />
					<ion-label>Saved</ion-label>
				</ion-tab-button>

				<ion-tab-button tab="settings" @click="click('settings')">
					<ion-icon name="settings" />
					<ion-label>Settings</ion-label>
				</ion-tab-button>
			</ion-tab-bar>
		</ion-tabs>
	</ion-app>
</template>

<script lang="ts">
import { Component, Ref, Vue, Watch } from 'vue-property-decorator';
import '@/views/Settings.vue';
import '@/views/Saved.vue';
import '@/views/Article.vue';
import '@/views/Author.vue';
import '@/views/News.vue';
import '@/views/Dinosaur.vue';
import '@/views/About.vue';
import '@/views/Copyright.vue';
import { getNav } from './helpers';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import VueRouter from '@/router';

const { App, StatusBar } = Plugins;
@Component({
	router: new VueRouter({
		mode: 'history',
		base: process.env.BASE_URL,
		routes: [
			{ path: '/', redirect: '/news' },
		],
	}),
})
export default class Main extends Vue {
	bookmarkURL = require('@fortawesome/fontawesome-free/svgs/solid/bookmark.svg');
	activeTab = 'news';
	isSystemDark = false;

	@Ref() readonly tabBar!: HTMLElement;

	get isDarkTheme() {
		if (this.$store.state.theme === 'default') return this.isSystemDark;
		return this.$store.state.theme === 'dark';
	}

	@Watch('isDarkTheme', { immediate: true })
	changeTheme(data: boolean) {
		if (data) document.body.classList.add('dark');
		else document.body.classList.remove('dark');
		StatusBar.setBackgroundColor({ color: data ? '#000000' : '#ffffff' }).catch(console.error);
		StatusBar.setStyle({ style: data ? StatusBarStyle.Dark : StatusBarStyle.Light }).catch(console.error);
	}

	shouldGoBack = true;

	mounted() {
		window.addEventListener('keyboardWillShow', (event) => {
			if (event.keyboardHeight) this.tabBar.classList.add('hidden');
		});
		window.addEventListener('keyboardWillHide', () => {
			this.tabBar.classList.remove('hidden');
			if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
		});
		let activePopover: { dismiss(): void } | undefined;
		document.addEventListener('ionPopoverDidPresent', ({ target }) => {
			activePopover = target as unknown as { dismiss(): void };
		});
		document.addEventListener('ionPopoverDidDismiss', () => {
			activePopover = undefined;
		});
		window.addEventListener('ionBackButton', async (e) => {
			e.stopPropagation();
			if (!this.shouldGoBack) return;
			this.shouldGoBack = false;
			setTimeout(() => this.shouldGoBack = true, 500);
			if (activePopover) {
				activePopover.dismiss();
			} else {
				const nav = getNav();
				console.log(e);
				if (await nav.canGoBack()) nav.pop(); else App.exitApp();
			}
		}, true);

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)') as any;
		this.isSystemDark = mediaQuery.matches;
		mediaQuery.addListener(({ matches }: { matches: boolean }) => {
			this.isSystemDark = matches;
		});
	}

	click(e) {
		if (this.activeTab === e) {
			getNav().popToRoot();
			return;
		}
		this.activeTab = e;
		this.$router.replace(e);
	}
}
</script>

<style scoped>

</style>
