/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { iOSAppID, platform, Platform } from './index';

export function review() {
	if (platform === Platform.iOS) {
		window.open(
			`itms-apps://itunes.apple.com/us/app/id${iOSAppID}?action=write-review`,
			'_system'
		);
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
