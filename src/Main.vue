<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this
   - file, You can obtain one at https://mozilla.org/MPL/2.0/. -->
<template>
	<ion-app>
		<ion-tabs ref="tabs">
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
					<ion-icon name="newspaper" />
					<ion-label>News</ion-label>
				</ion-tab-button>

				<ion-tab-button tab="saved" @click="click('saved')">
					<ion-icon name="bookmark" />
					<ion-label>Saved</ion-label>
				</ion-tab-button>

				<ion-tab-button tab="settings" @click="click('settings')">
					<ion-icon ios="cog" md="settings-sharp" />
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
import { KeyboardInfo, Plugins, StatusBarStyle } from '@capacitor/core';
import openLink from '@/helpers/link';
import Actions from '@/store/actions';

const { App, StatusBar, Keyboard } = Plugins;
@Component
export default class Main extends Vue {
	activeTab = 'news';
	isSystemDark = false;

	@Ref() readonly tabBar!: HTMLIonTabBarElement;
	@Ref() readonly tabs!: HTMLIonTabsElement;

	get isDarkTheme() {
		if (this.$store.state.theme === 'default') return this.isSystemDark;
		return this.$store.state.theme === 'dark';
	}

	@Watch('isDarkTheme', { immediate: true })
	changeTheme(dark: boolean) {
		if (dark) document.body.classList.add('dark');
		else document.body.classList.remove('dark');
		StatusBar.setBackgroundColor({ color: dark ? '#000000' : '#ffffff' }).catch(() => {});
		StatusBar.setStyle({
			style: dark ? StatusBarStyle.Dark : StatusBarStyle.Light,
		}).catch(() => {});
		if (dark && this.$store.state.font.bg === '#fff') {
			this.$store.dispatch(Actions.SET_COLOR_FG, '#fff');
			this.$store.dispatch(Actions.SET_COLOR_BG, '#000');
		} else if (!dark && this.$store.state.font.bg === '#000') {
			this.$store.dispatch(Actions.SET_COLOR_FG, '#000');
			this.$store.dispatch(Actions.SET_COLOR_BG, '#fff');
		}
	}

	shouldGoBack = true;

	mounted() {
		Keyboard.addListener('keyboardWillShow', (event: KeyboardInfo) => {
			if (event.keyboardHeight) this.tabBar.classList.add('hidden');
		});
		Keyboard.addListener('keyboardWillHide', () => {
			this.tabBar.classList.remove('hidden');
			const activeElement = document.activeElement as HTMLOrSVGElement | null;
			activeElement?.blur();
		});
		let activePopover: { dismiss(): void } | undefined;
		document.addEventListener('ionPopoverDidPresent', ({ target }) => {
			activePopover = (target as unknown) as { dismiss(): void };
		});
		document.addEventListener('ionPopoverDidDismiss', () => {
			activePopover = undefined;
		});
		window.addEventListener(
			'ionBackButton',
			async (e) => {
				e.stopPropagation();
				if (!this.shouldGoBack) return;
				this.shouldGoBack = false;
				setTimeout(() => (this.shouldGoBack = true), 500);
				if (activePopover) {
					activePopover.dismiss();
				} else {
					const nav = getNav();
					console.log(e);
					const searchBar: HTMLIonSearchbarElement | null = nav.querySelector(
						'.ion-page:not(.ion-page-hidden) > ion-content ion-searchbar'
					);
					if (searchBar?.value) {
						searchBar.dispatchEvent(new Event('ionCancel'));
					} else if (await nav.canGoBack()) await nav.pop();
					else App.exitApp();
				}
			},
			true
		);
		App.addListener('appUrlOpen', (data) => {
			this.openUrl(data.url);
		});
		//@ts-ignore
		window.openUrl = (...a) => this.openUrl(...a);

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
	}

	async openUrl(url: string) {
		if ((await this.tabs.getSelected()) !== 'news') await this.tabs.select('news');
		await this.$helpers.setImmediate();
		openLink(url);
	}
}
</script>
