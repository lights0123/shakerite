/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { decode } from 'he';
import { Category } from './categories';
import { ADD_CACHED, ADD_CACHED_IMAGE } from '@/store/mutations';
import { Capacitor } from '@capacitor/core';
import returnBody from '@/helpers/WPResponse';
import WPAPI from 'wpapi';
import { HTTP } from '@ionic-native/http';

export class Paginate<T> {
	protected wp;
	public items: Post[] = [];

	constructor(wp) {
		this.wp = wp;
	}

	protected _offset = 0;

	get offset(): number {
		return this._offset;
	}

	protected _finished = false;

	get finished(): boolean {
		return this._finished;
	}

	reset() {
		this._finished = false;
		this._offset = 0;
		this.items.length = 0;
	}

	async next(items: number = 25) {
		if (this._finished) return this;
		const posts = await this.query(items);
		posts.forEach((post) => {
			try {
				this.items.push(this.parse(post));
			} catch (e) {
				console.log(post);
				console.error(e);
			}
		});
		this._offset += posts.length;
		if (!posts._paging) this._finished = true;
		else if (this._offset === parseInt(posts._paging.total)) this._finished = true;
		return this;
	}

	protected query(items: number = 25) {
		return this.wp.posts().offset(this._offset).perPage(items).embed();
	}

	protected parse(post) {
		if (post.writer || post.jobtitle) return Article.fromAPI(post);
		if (post.name) return Author.fromAPI(post);
		return Post.fromAPI(post);
	}
}

export class Search<T> extends Paginate<T> {
	readonly term?: string;
	readonly categories?: Array<number> | number;
	readonly ids?: Array<number>;
	readonly author?: string;
	readonly name?: string;

	constructor(
		wp,
		{
			term,
			categories,
			author,
			name,
			ids,
		}: {
			term?: string;
			categories?: Array<number> | number;
			author?: string;
			name?: string;
			ids?: number[];
		}
	) {
		super(wp);
		this.term = term;
		this.categories = categories;
		this.author = author;
		this.name = name;
		this.ids = ids;
	}

	protected query(items: number = 25) {
		let q = super.query(items);
		if (this.term) q = q.search(this.term);
		if (this.categories) q = q.categories(this.categories);
		if (this.ids) q = q.include(this.ids);
		if (this.author) {
			q = q.param('filter[meta_key]', 'writer');
			q = q.param('filter[meta_value]', this.author);
		}
		if (this.name) {
			q = q.param('filter[meta_key]', 'name');
			q = q.param('filter[meta_value]', this.name);
		}

		return q;
	}
}

export class AuthorSearch extends Paginate<Author> {
	readonly ids?: Array<number>;
	readonly name?: string;
	readonly search?: boolean;
	readonly slug?: string;

	constructor(
		wp,
		{
			name,
			ids,
			slug,
			search = true,
		}: { name?: string; ids?: number[]; slug?: string; search?: boolean }
	) {
		super(wp);
		this.name = name;
		this.ids = ids;
		this.slug = slug;
		this.search = search;
	}

	protected query(items: number = 25) {
		let q = this.wp.writers().offset(this._offset).perPage(items).embed();
		if (this.ids) q = q.include(this.ids);
		if (this.slug) q = q.slug(this.slug);
		if (this.name) {
			q = q.param('filter[meta_key]', 'name');
			q = q.param('filter[meta_value]', this.name);
			if (this.search) q = q.param('filter[meta_compare]', 'LIKE');
		}

		return q;
	}
}

export class Post {
	id: number;
	content: string;
	categories: Category[];
	date: Date;
	title: string;
	subtitle?: string;
	media?: Media;
	slug?: string;
	link?: string;

	constructor({
		id,
		content,
		categories,
		date,
		title,
		subtitle,
		media,
		slug,
		link,
	}: {
		id: number;
		content: string;
		categories: Category[];
		date: Date;
		title: string;
		subtitle?: string;
		media?: Media;
		slug?: string;
		link?: string;
	}) {
		this.id = id;
		this.content = content;
		this.categories = categories;
		this.date = date;
		this.title = decode(title);
		this.subtitle = subtitle;
		this.media = media;
		this.slug = slug;
		this.link = link;
	}

	static fromAPI(data) {
		return new Post(this.APITransform(data));
	}

	static async getPost(wp, id: number, store?) {
		if (store) {
			const article = store.getters.getCachedArticle(id);
			if (article) return article;
		}
		let article = this.fromAPI(await wp.posts().id(id).embed());
		if (store) store.commit(ADD_CACHED, article);
		return article;
	}

	static async getPostBySlug(wp, slug: string) {
		return this.fromAPI((await wp.posts().slug(slug).embed())[0]);
	}

	protected static APITransform({
		id,
		content: { rendered: content },
		categories,
		modified_gmt,
		title: { rendered: title },
		sno_deck,
		featured_media,
		_embedded,
		slug,
		link,
	}) {
		let media;
		if (_embedded?.['wp:featuredmedia']?.[0]) {
			try {
				media = Media.fromAPI(_embedded['wp:featuredmedia'][0]);
			} catch (e) {
				console.error(e);
			}
		} else if (featured_media) media = new Media(featured_media);
		let categoryList: Category[] = [];
		if (_embedded?.['wp:term']?.[0]) {
			try {
				_embedded['wp:term'][0].forEach((category) => {
					if (category['taxonomy'] === 'category') {
						categoryList.push(Category.fromAPI(category));
					}
				});
			} catch (e) {
				console.error(e);
			}
		} else if (categories) {
			categories.forEach((id) => {
				categoryList.push(new Category(id));
			});
		}
		return {
			id,
			content,
			categories: categoryList,
			date: new Date(modified_gmt),
			title,
			subtitle: sno_deck?.[0],
			media,
			slug,
			link,
		};
	}
}

export class Article extends Post {
	jobTitle?: string;
	writers?: Array<string>;
	excerpt: string;

	constructor({
		id,
		content,
		categories,
		date,
		excerpt,
		title,
		subtitle,
		media,
		jobTitle,
		writers,
		slug,
		link,
	}: {
		id;
		content;
		categories;
		date;
		excerpt;
		title;
		subtitle?;
		media?;
		jobTitle?;
		writers?;
		slug?: string;
		link?: string;
	}) {
		super({ id, content, categories, date, title, subtitle, media, slug, link });
		this.jobTitle = jobTitle;
		this.writers = writers;
		this.excerpt = excerpt;
	}

	static fromAPI({ jobtitle, writer, excerpt: { rendered: excerpt }, ...data }) {
		return new Article({
			jobTitle: jobtitle ? jobtitle[0] : undefined,
			writers: writer,
			excerpt,
			// @ts-ignore
			...super.APITransform(data),
		});
	}
}

export class Author extends Post {
	name: string;
	position: string;
	schoolYear: number;

	constructor({
		id,
		content,
		categories,
		date,
		excerpt,
		media,
		title,
		name,
		position,
		schoolYear,
		slug,
		link,
	}: {
		id;
		content;
		categories;
		date;
		excerpt;
		media?;
		title;
		name?;
		position?;
		schoolYear?;
		slug?: string;
		link?: string;
	}) {
		super({ id, content, categories, date, title, media, slug, link });
		this.name = name;
		this.position = position;
		this.schoolYear = schoolYear;
	}

	static fromAPI({ name, staffposition, schoolyear, ...data }) {
		const yearString = schoolyear ? /"([0-9]{4,})-[0-9]{4,}"/g.exec(schoolyear[0]) : undefined;
		const year = yearString ? parseInt(yearString[1], 10) : undefined;
		return new Author({
			name: name ? name[0] : undefined,
			position: staffposition ? staffposition[0] : undefined,
			schoolYear: year,
			// @ts-ignore
			...super.APITransform(data),
		});
	}
}

export class MediaSize {
	width: number;
	height: number;
	url: string;
	name?: string;
	size?: number;

	constructor(width: number, height: number, url: string, name?: string, size?: number) {
		this.width = width;
		this.height = height;
		this.size = size;
		this.name = name;
		this.url = url;
	}

	get aspectRatio() {
		return (this.height / this.width) * 100;
	}
}

export class Media {
	id: number;
	sizes: Array<MediaSize>;
	caption?: string;
	date?: Date;
	loaded: boolean = false;

	constructor(id) {
		this.id = id;
		this.sizes = [];
	}

	static fromAPI({ id, caption, date_gmt: date, media_details: { sizes } }): Media {
		let media = new Media(id);
		media.caption = caption?.rendered;
		media.date = date;
		media.loaded = true;
		for (const size in sizes) {
			media.sizes.push(
				new MediaSize(sizes[size].width, sizes[size].height, sizes[size].source_url, size)
			);
		}
		return media;
	}

	async fetch(wp, store?) {
		if (this.loaded) return this;
		if (store) {
			const image = store.getters.getCachedImage(this.id);
			if (image) {
				this.caption = image.caption;
				this.date = image.date;
				this.loaded = true;
				this.sizes = image.sizes;
				return this;
			}
		}
		const {
			caption: { rendered: caption },
			date_gmt: date,
			media_details: { sizes },
		} = await wp.media().id(this.id);
		this.caption = caption;
		this.date = date;
		this.loaded = true;
		for (const size in sizes) {
			this.sizes.push(
				new MediaSize(sizes[size].width, sizes[size].height, sizes[size].source_url, size)
			);
		}
		if (store) store.commit(ADD_CACHED_IMAGE, this);
		return this;
	}
}

// @ts-ignore
window.Media = Media;
// @ts-ignore
window.Author = Author;
const isNative = Capacitor.platform !== 'web';
let transport = {};
if (isNative) {
	transport = {
		get(wpreq, cb?: (err: Error | null, data?: object) => any) {
			const url = wpreq.toString();
			return HTTP.get(url, {}, {}).then(
				(res) => {
					const body = returnBody(wpreq, res);
					if (cb && typeof cb === 'function') cb(null, body);
					return body;
				},
				(err: Error) => {
					if (cb && typeof cb === 'function') cb(err);
					return err;
				}
			);
		},
	};
}
export const wpapi = new WPAPI({ endpoint: 'https://shakerite.com/wp-json', transport });
wpapi.writers = wpapi.registerRoute('wp/v2', 'staff-profile/(?P<id>)');
// @ts-ignore
window.wp = wpapi;
