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
import settings from './views/Settings.vue';
import saved from './views/Saved.vue';
import news from './views/News.vue';
import helpers from './helpers';
import returnBody from './helpers/WPResponse';
import { enableReviews } from './helpers/review';

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
window.Browser = Browser;
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
	window.StatusBar = StatusBar;
	window.StatusBarStyle = StatusBarStyle;
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

function getActiveComponent(app) {
	const tab = document.querySelector('#app > ion-tabs > ion-tab:not(.tab-hidden)');
	return app.$children.find(child => tab.contains(child.$el));
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
				  getActiveComponent(app).$router.go(ev.deltaX > 0 ? -1 : 1);
			  },
		  })
		  .setDisabled(false);
}

// Initialize Capacitor
initCapacitor();
// Initialize helpers
Vue.prototype.$helpers = helpers;
// Create a Vue app instance
window.Vue = Vue;
window.WPAPI = WPAPI;
window.returnBody = returnBody;
const { default: store, getData } = require('./store/store');
getData(store).then(() => {
	window.vue = new Vue({
		// router,
		store,
		mounted() {
			SplashScreen.hide().catch(this.$console.error);
			if (Capacitor.platform === 'ios') initNavGesture(this);
			window.addEventListener('keyboardWillShow', (event) => {
				if (event.keyboardHeight) this.$refs.tabbar.classList.add('hidden');
			});
			window.addEventListener('keyboardWillHide', () => {
				this.$refs.tabbar.classList.remove('hidden');
				document.activeElement.blur();
			});
			window.addEventListener('ionBackButton', (e) => {
				const component = getActiveComponent(this);
				if (component.$router.history.index > 0) component.$router.history.go(-1); else App.exitApp();
				e.stopPropagation();
			}, true);
		},
		data: {
			bookmarkURL: require('@fortawesome/fontawesome-free/svgs/solid/bookmark.svg'),
		},
		components: {
			news,
			saved,
			settings,
		},
		provide() {
			let transport = {};
			if (isNative) {
				transport = {
					get(wpreq, cb) {
						const url = wpreq.toString();
						console.log(url);
						return new Promise((resolve, reject) => {
							function req() {
								window.cordova.plugin.http.get(url, {}, {}, (res) => {
									const body = returnBody(wpreq, res);
									if (cb && typeof cb === 'function') cb(null, body);
									resolve(body);
								}, (err) => {
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
