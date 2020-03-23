/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as moment from 'moment-timezone';

export function getTimeZone() {
	return moment.tz.guess() || 'America/New York';
}

export function shortDate(date: Date): string {
	const d = moment(date).tz(getTimeZone());
	if (d.isSame(moment(), 'year')) return d.format('MMM D');
	return d.format('MMM D, Y');
}

export function longDate(date: Date): string {
	const d = moment(date).tz(getTimeZone());
	return d.format('MMMM D, Y');
}
