/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import 'mdn-polyfills/Node.prototype.replaceWith';
import Vue from 'vue';
import Vuex from 'vuex';

import './theme/common.css';
import Ionic from '@modus/ionic-vue';
import '@ionic/core/css/ionic.bundle.css';
import { Capacitor, Plugins } from '@capacitor/core';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBookmark, faFont } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import '@/helpers/customElement';
import WPAPI from 'wpapi';
import VueShave from 'vue-shave';
import AsyncComputed from 'vue-async-computed';
import * as helpers from './helpers';
import { enableReviews } from './helpers/review';
import Main from './Main.vue';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';
import { wpapi } from '@/helpers/api';
// import openLink from '@/helpers/link';
// import { FCM } from 'capacitor-fcm';

const currentIcons = Object.keys(allIcons).map((i) => {
	const key = i.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
	if (typeof allIcons[i] === 'string') {
		return {
			[key]: allIcons[i],
		};
	}
	return {
		['ios-' + key]: allIcons[i].ios,
		['md-' + key]: allIcons[i].md,
	};
});
const iconsObject = Object.assign({}, ...currentIcons);
addIcons(iconsObject);
enableReviews();
const { SplashScreen, Network } = Plugins;
Vue.config.productionTip = false;
library.add(faBookmark, faFont, faBookmarkRegular);
// window.HTTP = HTTP;
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(Ionic);
Vue.use(Vuex);
Vue.use(VueShave, { character: '…' });
Vue.use(AsyncComputed);

// Initial Capacitor calls
async function initCapacitor() {
	// Platform checks
	Vue.prototype.$isWeb = Capacitor.platform === 'web';
	Vue.prototype.$isIOS = Capacitor.platform === 'ios';

	// Set network checks
	Network.getStatus()
		.then((s) => {
			Vue.prototype.$networkStatus = s;
		})
		.catch(console.error);

	// Listen to network changes
	Network.addListener('networkStatusChange', (s) => {
		Vue.prototype.$networkStatus = s;
	});

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

// Initialize Capacitor
initCapacitor();
// Initialize helpers
declare module 'vue/types/vue' {
	// 3. Declare augmentation for Vue
	interface Vue {
		$helpers: typeof helpers;
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
		// router,
		store,
		render: (h) => h(Main),
		mounted() {
			SplashScreen.hide().catch(console.error);
		},
		provide() {
			return {
				API: wpapi,
			};
		},
	}).$mount('#app');
});
