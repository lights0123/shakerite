/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { decode } from 'he';

export const defaultCategories = [
	{ name: 'Top Stories', id: 11 },
	{ name: 'Campus & City', id: 7 },
	{ name: 'Investigations', id: 4 },
	{ name: 'Opinion', id: 8 },
	{ name: 'Spotlight', id: 6 },
	{ name: 'Raider Zone', id: 5 },
];

export class Category {
	id: number;
	name?: string;
	loaded: boolean = false;

	constructor(id) {
		this.id = id;
	}

	static fromAPI({ id, name }) {
		const cat = new Category(id);
		cat.name = decode(name);
		cat.loaded = true;
		return cat;
	}

	async fetch(wp) {
		if (this.loaded) return this;
		const { name } = await wp.categories().id(this.id);
		this.name = decode(name);
		this.loaded = true;
		return this;
	}
}
