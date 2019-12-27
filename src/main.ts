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
import WPAPI from 'wpapi';
import VueShave from 'vue-shave';
import AsyncComputed from 'vue-async-computed';
import * as helpers from './helpers';
import returnBody from './helpers/WPResponse';
import { enableReviews } from './helpers/review';
import Main from './Main.vue';
import VueRouter from '@/router';
import { addIcons } from 'ionicons';
import * as allIcons from 'ionicons/icons';

const currentIcons = Object.keys(allIcons).map(i => {
	const key = i.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)
	if(typeof allIcons[i] === 'string') {
		return {
			[key]: allIcons[i],
		}
	}
	return {
		['ios-' + key]: allIcons[i].ios,
		['md-' + key]: allIcons[i].md,
	};
});
const iconsObject = Object.assign({}, ...currentIcons);
addIcons(iconsObject);
enableReviews();
const {
	SplashScreen, Network, StatusBar, Browser, App,
} = Plugins;
Vue.config.productionTip = false;
library.add(faBookmark, faFont, faBookmarkRegular);
// window.HTTP = HTTP;
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.use(Ionic);
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
			const wpapi = new WPAPI({ endpoint: 'https://shakerite.com/wp-json', transport });
			wpapi.writers = wpapi.registerRoute('wp/v2', 'staff-profile/(?P<id>)');
			// @ts-ignore
			window.wp = wpapi;
			return {
				API: wpapi,
			};
		},
		router: new VueRouter({
			mode: 'history',
			base: process.env.BASE_URL,
			routes: [
				{ path: '/', redirect: '/news' },
			],
		}),
	}).$mount('#app');
});
