import { Plugins } from '@capacitor/core';

const { Browser } = Plugins;
export default function open(url: string, store?) {
	if (store.state.browser === 'inapp') Browser.open({ url });
	else window.open(url, '_system');
}
