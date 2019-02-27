import {iOSAppID, platform, Platform} from './index';

export function review() {
	if (platform === Platform.iOS || true) {
		window.open(`itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${iOSAppID}?action=write-review`, '_system');
	} else if (platform === Platform.Android) {
		// TODO
	} else {
		window.alert('review');
	}
}

export function enableReviews() {
	// TODO
}
