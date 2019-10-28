import 'mdn-polyfills/Node.prototype.replaceWith';
import Vue from 'vue';
import Vuex from 'vuex';
import './theme/common.css';
import { Ionic, IonicAPI } from '@modus/ionic-vue';
import { Capacitor, Plugins, StatusBarStyle } from '@capacitor/core';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faBookmark, faFont } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons';
import WPAPI from 'wpapi';
import VueShave from 'vue-shave';
import AsyncComputed from 'vue-async-computed';
import * as helpers from './helpers';
import returnBody from './helpers/WPResponse';
import { enableReviews } from './helpers/review';
import Main from './Main.vue';

enableReviews();
const {
	SplashScreen, Network, StatusBar, Browser, App,
} = Plugins;
Vue.config.productionTip = false;
library.add(faBookmark, faFont, faBookmarkRegular);
// window.HTTP = HTTP;
Vue.component('font-awesome-icon', FontAwesomeIcon);
Ionic.init();
Vue.use(IonicAPI);
Vue.use(Vuex);
Vue.use(VueShave, { character: '…' });
Vue.use(AsyncComputed);

const isNative = Capacitor.platform !== 'web';
let deviceReady = false;
document.addEventListener('deviceready', () => {
	deviceReady = true;
}, false);

// Initial Capacitor calls
async function initCapacitor() {
	// Platform checks
	Vue.prototype.$isWeb = Capacitor.platform === 'web';
	Vue.prototype.$isIOS = Capacitor.platform === 'ios';

	// Set status-bar background and style
	StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(console.error);
	StatusBar.setStyle({ style: StatusBarStyle.Light }).catch(console.error);

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
}

// Navigate through a swipe gesture
async function initNavGesture(app) {
	const gesture = await import('@ionic/core/dist/collection/utils/gesture');

	gesture
		.createGesture({
			el: document,
			gestureName: 'swipe',
			gesturePriority: 40,
			threshold: 10,
			queue: window.Ionic.queue,
			canStart: () => true,
			onStart: () => {
			},
			onMove: () => {
			},
			onEnd: (ev) => {
				const threshold = app.$root.$el.offsetWidth / 2;
				if (Math.abs(ev.deltaX) < threshold) {
					return;
				}
				helpers.getActiveComponent(app).$router.go(ev.deltaX > 0 ? -1 : 1);
			},
		})
		.setDisabled(false);
}

// Initialize Capacitor
initCapacitor();
// Initialize helpers
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
		render: h => h(Main),
		mounted() {
			console.log('mounted!');
			SplashScreen.hide().catch(console.error);
			if (Capacitor.platform === 'ios') initNavGesture(this);

			let activePopover: {dismiss(): void} | undefined;
			document.addEventListener('ionPopoverDidPresent', ({ target }) => {
				activePopover = target as unknown as {dismiss(): void};
			});
			document.addEventListener('ionPopoverDidDismiss', () => {
				activePopover = undefined;
			});
			window.addEventListener('ionBackButton', (e) => {
				if (activePopover) {
					activePopover.dismiss();
				} else {
					const component = helpers.getActiveComponent(this);
					if (component.$router.history.index > 0) component.$router.history.go(-1); else App.exitApp();
				}
				e.stopPropagation();
			}, true);
		},
		provide() {
			let transport = {};
			if (isNative) {
				transport = {
					get(wpreq, cb?: (err: Error | null, data?: object) => any) {
						const url = wpreq.toString();
						console.log(url);
						return new Promise((resolve, reject) => {
							function req() {
								window.cordova.plugin.http.get(url, {}, {}, (res) => {
									const body = returnBody(wpreq, res);
									if (cb && typeof cb === 'function') cb(null, body);
									resolve(body);
								}, (err: Error) => {
									if (cb && typeof cb === 'function') cb(err);
									reject(err);
								});
							}

							if (deviceReady) req();
							else document.addEventListener('deviceready', req, false);
						});
					},
				};
			}
			return {
				API: new WPAPI({ endpoint: 'https://shakerite.com/wp-json', transport }),
			};
		},
	}).$mount('#app');
});
