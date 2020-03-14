import WPRequest from 'wpapi/lib/constructors/wp-request';
import li from 'li';

const parseLinkHeader = li.parse;
// Pagination-Related Helpers
// ==========================

/**
 * If the response is not paged, return the body as-is. If pagination
 * information is present in the response headers, parse those headers into
 * a custom `_paging` property on the response body. `_paging` contains links
 * to the previous and next pages in the collection, as well as metadata
 * about the size and number of pages in the collection.
 *
 * The structure of the `_paging` property is as follows:
 *
 * - `total` {Integer} The total number of records in the collection
 * - `totalPages` {Integer} The number of pages available
 * - `links` {Object} The parsed "links" headers, separated into individual URI strings
 * - `next` {WPRequest} A WPRequest object bound to the "next" page (if page exists)
 * - `prev` {WPRequest} A WPRequest object bound to the "previous" page (if page exists)
 *
 * @private
 * @param {Object} result           The response object from the HTTP request
 * @param {Object} options          The options hash from the original request
 * @param {String} options.endpoint The base URL of the requested API endpoint
 * @param {Object} httpTransport    The HTTP transport object used by the original request
 * @returns {Object} The pagination metadata object for this HTTP request, or else null
 */
function createPaginationObject(result, options, httpTransport) {
	let _paging = null;

	if (!result.headers) {
		// No headers: return as-is
		return _paging;
	}

	// Guard against capitalization inconsistencies in returned headers
	Object.keys(result.headers).forEach(header => {
		result.headers[header.toLowerCase()] = result.headers[header];
	});

	if (!result.headers['x-wp-totalpages']) {
		// No paging: return as-is
		return _paging;
	}

	const totalPages = +result.headers['x-wp-totalpages'];

	if (!totalPages || totalPages === 0) {
		// No paging: return as-is
		return _paging;
	}

	// Decode the link header object
	const links = result.headers.link ? parseLinkHeader(result.headers.link) : {};

	// Store pagination data from response headers on the response collection
	_paging = {
		total: +result.headers['x-wp-total'],
		totalPages,
		links,
	};

	// Create a WPRequest instance pre-bound to the "next" page, if available
	if (links.next) {
		_paging.next = new WPRequest({
			...options,
			transport: httpTransport,
			endpoint: links.next,
		});
	}

	// Create a WPRequest instance pre-bound to the "prev" page, if available
	if (links.prev) {
		_paging.prev = new WPRequest({
			...options,
			transport: httpTransport,
			endpoint: links.prev,
		});
	}

	return _paging;
}

/**
 * Return the body of the request, augmented with pagination information if the
 * result is a paged collection.
 *
 * @param {WPRequest} wpreq The WPRequest representing the returned HTTP response
 * @param {Object} result The results from the HTTP request
 * @returns {Object} The "body" property of the result, conditionally augmented with
 *                  pagination information if the result is a partial collection.
 */
export default function returnBody(wpreq, result) {
	const body = JSON.parse(result.data);
	// noinspection JSAccessibilityCheck
	const _paging = createPaginationObject(result, wpreq._options, wpreq.transport);
	if (_paging) {
		body._paging = _paging;
	}
	return body;
}
