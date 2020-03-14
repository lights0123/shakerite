const pos = {};
window.pos = pos;
export default {
	mounted() {
		const content = this.$el.getElementsByTagName('ion-content')[0];
		const { tag } = this.$router.app.$vnode;
		if (!pos[tag]) return;
		const scrollTo = pos[tag][this.$route.path];

		function callback(mutationsList, observer) {
			const innerScroll = content.shadowRoot.querySelector('.inner-scroll');
			if (innerScroll) {
				setTimeout(() => innerScroll.scrollTo(0, scrollTo), 50);
				observer.disconnect();
			}
		}

		new MutationObserver(callback).observe(content.shadowRoot, {
			childList: true,
			subtree: true,
		});
	},
	beforeRouteLeave(to, from, next) {
		const { tag } = this.$router.app.$vnode;
		if (!pos[tag]) pos[tag] = {};
		pos[tag][from.path] = this.$el
			.getElementsByTagName('ion-content')[0]
			.shadowRoot.querySelector('.inner-scroll').scrollTop;
		next();
	},
};
