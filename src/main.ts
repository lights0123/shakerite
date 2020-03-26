/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import 'mdn-polyfills/Node.prototype.replaceWith';
import Vue from 'vue';
import Vuex from 'vuex';
import './theme/common.css';
import '@ionic/core/css/core.css';
import '@ionic/core/css/normalize.css';
import '@ionic/core/css/structure.css';
import '@ionic/core/css/typography.css';
import '@/helpers/icons';
import { Capacitor, Plugins } from '@capacitor/core';
import '@/helpers/customElement';
import WPAPI from 'wpapi';
import VueShave from 'vue-shave';
import AsyncComputed from 'vue-async-computed';
import * as helpers from './helpers';
import { enableReviews } from './helpers/review';
import Main from './Main.vue';
import { wpapi } from '@/helpers/api';
import { applyPolyfills, defineCustomElements } from '@ionic/core/loader';
// import openLink from '@/helpers/link';
// import { FCM } from 'capacitor-fcm';

enableReviews();
const { SplashScreen, Network } = Plugins;
Vue.config.productionTip = false;
Vue.config.ignoredElements.push(/^ion-/);
applyPolyfills().then(() => defineCustomElements(window));
Vue.use(Vuex);
Vue.use(VueShave, { character: '…' });
Vue.use(AsyncComputed);

// Initial Capacitor calls
async function initCapacitor() {
	Vue.prototype.$isIOS = Capacitor.platform === 'ios';

	/*PushNotifications.requestPermission().then(result => {
		if (result.granted) {
			// Register with Apple / Google to receive push via APNS/FCM
			PushNotifications.register();
		} else {
			// Show some error
		}
	});

	PushNotifications.register().then(() => {
		const fcm = new FCM();
		fcm.subscribeTo({ topic: 'all' }).then(console.log, console.error);
		fcm.subscribeTo({ topic: 'breaking' }).then(console.log, console.error);
		fcm.subscribeTo({ topic: 'campus' }).then(console.log, console.error);
		fcm.subscribeTo({ topic: 'investigations' }).then(console.log, console.error);
		fcm.subscribeTo({ topic: 'opinion' }).then(console.log, console.error);
		fcm.subscribeTo({ topic: 'spotlight' }).then(console.log, console.error);
		fcm.subscribeTo({ topic: 'raider-zone' }).then(console.log, console.error);
	});

	// Some issue with our setup and push will not work
	PushNotifications.addListener('registrationError', (error: any) => {
		alert('Error on registration: ' + JSON.stringify(error));
	});

	// Show us the notification payload if the app is open on our device
	PushNotifications.addListener('pushNotificationReceived', notification => {
		LocalNotifications.schedule({
			notifications: [
				{
					body: notification.body || 'body',
					title: notification.title || '',
					id: 1,
				},
			],
		});
	});

	// Method called when tapping on a notification
	PushNotifications.addListener('pushNotificationActionPerformed', notification => {
		if (notification.notification.data.link) {
			openLink(notification.notification.data.link);
		}
	});*/
}

initCapacitor();
declare module 'vue/types/vue' {
	interface Vue {
		$helpers: typeof helpers;
		$isIOS: boolean;
	}
}
Vue.prototype.$helpers = helpers;
// Create a Vue app instance
// @ts-ignore
window.Vue = Vue;
// @ts-ignore
window.WPAPI = WPAPI;
const { default: store, getData } = require('./store/store');
getData(store).then(() => {
	// @ts-ignore
	window.vue = new Vue({
		store,
		render: (h) => h(Main),
		mounted() {
			SplashScreen.hide().catch(() => {});
		},
		provide() {
			return {
				API: wpapi,
			};
		},
	}).$mount('#app');
});
