import { iOSAppID, platform, Platform } from './index';

export function review() {
	if (platform === Platform.iOS) {
		window.open(`itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${iOSAppID}?action=write-review`, '_system');
	} else if (platform === Platform.Android) {
		// @ts-ignore
		window.LaunchReview.launch();
	} else {
		window.alert('review');
	}
}

export function enableReviews() {
	// TODO
}
