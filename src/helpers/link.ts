import { Plugins } from '@capacitor/core';
import { getNav } from '@/helpers/index';

const { Browser } = Plugins;
type RegexReturn = ReturnType<typeof RegExp.prototype.exec>;

function reg<T>(reg: RegexReturn, f: (RegexReturn) => T) {
	if (reg) return f(reg);
}

function deepLink(url: URL, urlString: string) {
	return (
		reg(/^\?(?:.*&)?p=(\d+)(?:&.*)?$/.exec(url.search), res =>
			getNav().push('app-article', { id: res[1], onFailure: urlString })
		) ||
		reg(/^\/staff_profile\/([a-z0-9-]+)\/?$/.exec(url.pathname), res =>
			getNav().push('app-author', {
				name: res[1],
				slug: true,
				onFailure: urlString,
			})
		) ||
		reg(/^\/(?:[a-z0-9-]+\/)([a-z0-9-]+)(?:\/[a-z0-9-]+)*\/?$/.exec(url.pathname), res =>
			getNav().push('app-article', {
				id: res[1],
				slug: true,
				onFailure: urlString,
			})
		)
	);
}

export default function open(urlString: string, store?, raw = false) {
	const url = new URL(urlString.toLowerCase());
	if (
		raw ||
		!(url.hostname === 'shakerite.com' || url.hostname === 'www.shakerite.com') ||
		!deepLink(url, urlString)
	) {
		if (store.state.browser === 'inapp') Browser.open({ url: urlString });
		else window.open(urlString, '_system');
	}
}
