import { decode } from 'he';
import { Category } from './categories';
import { ADD_CACHED, ADD_CACHED_IMAGE } from '../store/mutations';

export class Paginate<T> extends Array<T> {
	protected wp;

	constructor(wp) {
		super();
		this.wp = wp;
	}

	static get [Symbol.species]() {
		return Array;
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
		super.length = 0;
	}

	async next(items: number = 25) {
		if (this._finished) return this;
		const posts = await this.query(items);
		posts.forEach(post => {
			try {
				// @ts-ignore
				super.push(this.parse(post));
			} catch (e) {
				console.log(post);
				console.log(e);
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

	constructor(wp, { term, categories, author, name, ids }: { term?: string, categories?: Array<number> | number, author?: string, name?: string, ids?: number[] }) {
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

export class Post {
	id: number;
	content: string;
	categories: Array<Category>;
	date: Date;
	excerpt: string;
	title: string;
	subtitle?: string;
	media?: Media;

	constructor(
		{ id, content, categories, date, excerpt, title, subtitle, media }: { id, content, categories, date, excerpt, title, subtitle?, media?: Media }) {
		this.id = id;
		this.content = content;
		this.categories = categories;
		this.date = date;
		this.excerpt = excerpt;
		this.title = decode(title);
		this.subtitle = subtitle;
		this.media = media;
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

	protected static APITransform({
		                              id,
		                              content: { rendered: content },
		                              categories,
		                              modified_gmt,
		                              excerpt: { rendered: excerpt },
		                              title: { rendered: title },
		                              sno_deck,
		                              featured_media,
		                              _embedded,
	                              }) {
		let media;
		if (_embedded && _embedded['wp:featuredmedia'] && _embedded['wp:featuredmedia'][0]) media = Media.fromAPI(_embedded['wp:featuredmedia'][0]);
		else if (featured_media) media = new Media(featured_media);
		let categoryList = [];
		if (_embedded && _embedded['wp:term'] && _embedded['wp:term'][0]) {
			_embedded['wp:term'][0].forEach(category => {
				if (category['taxonomy'] === 'category') categoryList.push(Category.fromAPI(category));
			});
		} else if (categories) {
			categories.forEach(id => {
				categoryList.push(new Category(id));
			});
		}
		return {
			id,
			content,
			categories: categoryList,
			date: new Date(modified_gmt),
			excerpt,
			title,
			subtitle: sno_deck ? sno_deck[0] : undefined,
			media,
		};
	}
}

export class Article extends Post {
	jobTitle?: string;
	writers?: Array<string>;

	constructor({ id, content, categories, date, excerpt, title, subtitle, media, jobTitle, writers }:
		            { id, content, categories, date, excerpt, title, subtitle?, media?, jobTitle?, writers? }) {
		super({ id, content, categories, date, excerpt, title, subtitle, media });
		this.jobTitle = jobTitle;
		this.writers = writers;
	}

	static fromAPI({ jobtitle, writer, ...data }) {
		return new Article({
			jobTitle: jobtitle ? jobtitle[0] : undefined,
			writers: writer,
			// @ts-ignore
			...super.APITransform(data),
		});
	}
}

export class Author extends Post {
	name: string;
	position: string;
	schoolYear: number;

	constructor({ id, content, categories, date, excerpt, media, title, name, position, schoolYear }:
		            { id, content, categories, date, excerpt, media?, title, name?, position?, schoolYear? }) {
		super({ id, content, categories, date, excerpt, title, media });
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
	url: URL;
	name?: string;
	size?: number;

	constructor(width: number, height: number, url: URL, name?: string, size?: number) {
		this.width = width;
		this.height = height;
		this.size = size;
		this.name = name;
		this.url = url;
	}

	get aspectRatio() {
		return this.height / this.width * 100;
	}
}

export class Media {
	id: number;
	sizes: Array<MediaSize>;
	caption: string;
	date: Date;
	loaded: boolean = false;

	constructor(id) {
		this.id = id;
		this.sizes = [];
	}

	static fromAPI({ id, caption: { rendered: caption }, date_gmt: date, media_details: { sizes } }): Media {
		let media = new Media(id);
		media.caption = caption;
		media.date = date;
		media.loaded = true;
		for (const size in sizes) {
			media.sizes.push(new MediaSize(sizes[size].width, sizes[size].height, sizes[size].source_url, size));
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
		const { caption: { rendered: caption }, date_gmt: date, media_details: { sizes } } = await wp.media().id(this.id);
		this.caption = caption;
		this.date = date;
		this.loaded = true;
		for (const size in sizes) {
			this.sizes.push(new MediaSize(sizes[size].width, sizes[size].height, sizes[size].source_url, size));
		}
		if (store) store.commit(ADD_CACHED_IMAGE, this);
		return this;
	}
}

// @ts-ignore
window.Media = Media;
// @ts-ignore
window.Author = Author;
