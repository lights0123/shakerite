import {Capacitor} from '@capacitor/core';
export function env(constant) {
	return process.env[constant];
}
export enum Platform {
	iOS = 'ios',
	Android = 'android',
	Web = 'web'
}
export const iOSAppID = env('IOS_APP_ID');
export const platform = Capacitor.platform;
console.log(platform);
