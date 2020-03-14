import { Capacitor } from '@capacitor/core';
import { Nav } from '@ionic/core/dist/types/components/nav/nav';

export function env(constant: string) {
	return process.env[constant];
}

export enum Platform {
	iOS = 'ios',
	Android = 'android',
	Web = 'web',
}

export function getActiveComponent(app) {
	const tab = document.querySelector('body ion-tab:not(.tab-hidden)');
	return app.$children.find(child => tab?.contains(child.$el));
}

export function getNav(): Nav {
	return (document.querySelector('body ion-tab:not(.tab-hidden) > ion-nav') as unknown) as Nav;
}

export const iOSAppID = env('IOS_APP_ID');
export const { platform } = Capacitor;
console.log(platform);
export let deviceReady = false;
document.addEventListener(
	'deviceready',
	() => {
		deviceReady = true;
	},
	false
);

export const injectParent = {
	beforeCreateVueInstance(RootComponentDefinition) {
		RootComponentDefinition.parent = window.vue;
		RootComponentDefinition.store = window.vue.$store;
		return RootComponentDefinition;
	},
};
