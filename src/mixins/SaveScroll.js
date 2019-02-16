const pos = {};
window.pos = pos;
export default {
	mounted() {
		const content = this.$el.getElementsByTagName('ion-content')[0];
		const tag = this.$router.app.$vnode.tag;
		if (!pos[tag]) return;
		const scrollTo = pos[this.$router.app.$vnode.tag][this.$route.path];

		function callback(mutationsList, observer) {
			const innerScroll = content.shadowRoot.querySelector('.inner-scroll');
			if (innerScroll) {
				innerScroll.scrollTo(0, scrollTo);
				observer.disconnect();
			}
		}

		new MutationObserver(callback).observe(content, { childList: true, subtree: true });
	},
	beforeRouteLeave(to, from, next) {
		const { tag } = this.$router.app.$vnode;
		if (!pos[tag]) pos[tag] = {};
		pos[tag][from.path] = this.$el.getElementsByTagName('ion-content')[0].shadowRoot.querySelector('.inner-scroll').scrollTop;
		next();
	},
};
