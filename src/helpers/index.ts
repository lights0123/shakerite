import { Capacitor } from '@capacitor/core';

export function env(constant: string) {
	return process.env[constant];
}

export enum Platform {
	iOS = 'ios',
	Android = 'android',
	Web = 'web'
}

export function getActiveComponent(app) {
	const tab = document.querySelector('body ion-tab:not(.tab-hidden)');
	return app.$children.find(child => tab?.contains(child.$el));
}

export const iOSAppID = env('IOS_APP_ID');
export const { platform } = Capacitor;
console.log(platform);
