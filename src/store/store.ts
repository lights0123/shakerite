/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Vuex from 'vuex';
import { Storage } from '@capacitor/core';
import uniqBy from 'lodash/uniqBy';
import property from 'lodash/property';
import Mutations from './mutations';
import Actions from './actions';
import { Article, Media, Search } from '@/helpers/api';
import { defaultCategories } from '@/helpers/categories';
import Vue from 'vue';
// @ts-ignore
window.Search = Search;
Vue.use(Vuex);

export async function getData(store) {
	const data: Promise<any>[] = [];
	const actions = [
		Actions.SET_FONT_SIZE,
		Actions.SET_FONT_WEIGHT,
		Actions.SET_FONT_NAME,
		Actions.SET_COLOR_BG,
		Actions.SET_COLOR_FG,
		Actions.SET_BROWSER,
		Actions.SET_THEME,
	];
	actions.forEach((key) => data.push(Storage.get({ key })));
	(await Promise.all(data)).forEach(({ value }, index) => {
		if (parseFloat(value).toString() === value) value = parseFloat(value);
		if (value === 'undefined') value = undefined;
		if (value) store.commit(actions[index], value);
	});
	const rawArticles = await Storage.get({ key: Actions.SET_SAVED_ARTICLES });
	if (rawArticles.value) {
		const articles = JSON.parse(rawArticles.value);
		if (articles) store.commit(Mutations.SET_SAVED_ARTICLES, articles);
	}
}

export interface RootStore {
	font: {
		family: string;
		size: number;
		weight?: number;
		fg: string;
		bg: string;
	};
	articles: Article[];
	category: { name: string; id: number };
	searchTerm: string;
	cachedArticles: Article[];
	cachedImages: Media[];
	savedArticles: number[];
	browser: string;
	theme: string;
}

export default new Vuex.Store<RootStore>({
	state: {
		font: {
			family: '-apple-system',
			size: 16,
			weight: undefined,
			fg: '#000',
			bg: '#fff',
		},
		articles: [],
		category: defaultCategories[0],
		searchTerm: '',
		cachedArticles: [],
		cachedImages: [],
		savedArticles: [],
		browser: 'inapp',
		theme: 'default',
	},
	mutations: {
		[Mutations.SET_FONT_SIZE](state, size) {
			state.font.size = size;
		},
		[Mutations.SET_FONT_WEIGHT](state, weight) {
			state.font.weight = weight;
		},
		[Mutations.SET_FONT_NAME](state, name) {
			state.font.family = name;
		},
		[Mutations.SET_COLOR_FG](state, color) {
			state.font.fg = color;
		},
		[Mutations.SET_COLOR_BG](state, color) {
			state.font.bg = color;
		},
		[Mutations.SET_SEARCH_TERM](state, term) {
			state.searchTerm = term;
		},
		[Mutations.SET_CATEGORY](state, category) {
			state.category = category;
		},
		[Mutations.ADD_CACHED](state, article) {
			state.cachedArticles.unshift(article);
			state.cachedArticles = uniqBy(state.cachedArticles, property('id'));
		},
		[Mutations.ADD_CACHED_IMAGE](state, article) {
			state.cachedImages.unshift(article);
			state.cachedImages = uniqBy(state.cachedImages, property('id'));
		},
		[Mutations.SET_SAVED_ARTICLES](state, articles) {
			state.savedArticles = articles;
		},
		[Mutations.SET_BROWSER](state, browser) {
			state.browser = browser;
		},
		[Mutations.SET_THEME](state, theme) {
			state.theme = theme;
		},
	},
	getters: {
		getCachedArticle: (state) => (id) =>
			state.cachedArticles.find((article) => article.id === id),
		getCachedImage: (state) => (id) => state.cachedImages.find((image) => image.id === id),
	},
	actions: {
		async [Actions.SET_FONT_NAME]({ commit }, name) {
			await Storage.set({ key: Actions.SET_FONT_NAME, value: name });
			commit(Mutations.SET_FONT_NAME, name);
		},
		async [Actions.SET_FONT_WEIGHT]({ commit }, weight) {
			await Storage.set({ key: Actions.SET_FONT_WEIGHT, value: weight });
			commit(Mutations.SET_FONT_WEIGHT, weight);
		},
		async [Actions.SET_FONT_SIZE]({ commit }, size) {
			await Storage.set({ key: Actions.SET_FONT_SIZE, value: size });
			commit(Mutations.SET_FONT_SIZE, size);
		},
		async [Actions.SET_COLOR_FG]({ commit }, color) {
			await Storage.set({ key: Actions.SET_COLOR_FG, value: color });
			commit(Mutations.SET_COLOR_FG, color);
		},
		async [Actions.SET_COLOR_BG]({ commit }, color) {
			await Storage.set({ key: Actions.SET_COLOR_BG, value: color });
			commit(Mutations.SET_COLOR_BG, color);
		},
		async [Actions.SET_SAVED_ARTICLES]({ commit }, articles) {
			await Storage.set({ key: Actions.SET_SAVED_ARTICLES, value: JSON.stringify(articles) });
			commit(Mutations.SET_SAVED_ARTICLES, articles);
		},
		async [Actions.SET_BROWSER]({ commit }, browser) {
			await Storage.set({ key: Actions.SET_BROWSER, value: browser });
			commit(Mutations.SET_BROWSER, browser);
		},
		async [Actions.SET_THEME]({ commit }, theme) {
			await Storage.set({ key: Actions.SET_THEME, value: theme });
			commit(Mutations.SET_THEME, theme);
		},
	},
});
