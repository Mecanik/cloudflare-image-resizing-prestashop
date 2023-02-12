/**
 * Worker Name: CloudFlare Image Resizing for PrestaShop
 * Worker URI: https://github.com/Mecanik/cloudflare-image-resizing-prestashop
 * Description: This worker will replace Image URL's so you can use the CloudFlare Image Resizing service.
 * Version: 1.0
 * Author: Mecanik
 * Author URI: https://github.com/Mecanik/
 *
 * License: Apache License 2.0 (https://github.com/Mecanik/cloudflare-image-resizing-prestashop/blob/main/LICENSE)
 * Copyright (c) 2023 Mecanik
 **/

// Edit the below as needed
// START EDIT -----------------------------------------------------

// Set theme type
// 0 = Classic
// 1 = All themes by ETS (https://prestahero.com/brand/2-ets)
const PS_THEME = 0;

// Speed: Set the image quality
const IMAGE_QUALITY = 90;

// Speed: Append lazy loading to images
const IMAGE_LAZY_LOAD = true;

// END EDIT -------------------------------------------------------
// DO NOT EDIT BELOW THIS LINE.

// Classic
const SrcClassic = '(https?:\\/\\/(?:www\\.|(?!www)).*?|\\/\\/.*?)((?:\\/modules\\/ps_imageslider\\/images\\/|\\/\\d+-(?:cart_default|small_default|medium_default|home_default|large_default|category_default|stores_default)\\/|\\/modules\\/ps_banner\\/img\\/|\\/img\\/).*?\\.(?:jpe?g|gif|png|webp|svg))(.*?)';
const rgxSrcClassic = new RegExp(`${SrcClassic}`, 'g');

// ETS themes 
const SrcETS = '(https?:\\/\\/(?:www\\.|(?!www)).*?|\\/\\/.*?|)((?:\\/modules\\/ps_imageslider\\/images\\/|(?:\\/.*\\/\\d+\\-|\\/\\d+\\-[a-zA-Z]+_default)\\/|\\/modules\\/ps_banner\\/img\\/|\\/modules\\/ets_multilayerslider\\/views\\/img\\/upload\\/|\\/modules\\/ets_multilayerslider\\/views\\/img\\/|\\/modules\\/ets_megamenu\\/views\\/img\\/upload\\/|\\/.*\\/modules\\/ets_multilayerslider\\/views\\/img\\/upload\\/|\\/modules\\/ybc_widget\\/images\\/widget\\/|\\/.*\\/modules\\/ybc_widget\\/images\\/widget\\/|\\/.*\\/modules\\/ybc_blog\\/views\\/img\\/post\\/thumb\\/|\\/modules\\/ybc_blog_free\\/views\\/img\\/post\\/thumb\\/|\\/modules\\/ybc_newsletter\\/views\\/img\\/config\\/|\\/modules\\/ybc_newsletter\\/\\/?views\\/img\\/icon\\/|\\/.*\\/img\\/m\\/|\\/img\\/|\\/.*\\/modules\\/ybc_themeconfig\\/images\\/config\\/|\\/modules\\/ybc_themeconfig\\/images\\/config\\/|\\/modules\\/ybc_themeconfig\\/img\\/|\\/.*\\/modules\\/ybc_blog\\/views\\/img\\/post\\/).*?\\.(?:jpe?g|gif|png|webp|svg))(.*?)';
const rgxSrcETS = new RegExp(`${SrcETS}`, 'g');

const CssETS = '(?:url\\(\\"?\\\'?(https?:\\/\\/(?:www\\.|(?!www)).*?|\\/\\/.*?|)((?:(?:\\/.*\\/|\\/)modules\\/ets_multilayerslider\\/views\\/img\\/upload\\/).*?\\.(?:jpe?g|gif|png|webp|svg))(.*?)\\"?\\\'?\\))';
const rgxCssETS = new RegExp(`${CssETS}`, 'g');

/**
 * Rewrites the <img> tags, including source sets, plugins like Revolution Slider and more.
 * @author Mecanik
 * @version 1.0.0
 */
class ImageTagRewriter extends HTMLRewriter {
	async element(element) {

		// Base CDN
		let CDN = "/cdn-cgi/image/";
		let hasSizes = false;

		// Check if image has sizes set
		if (element.hasAttribute("width") && element.hasAttribute("height")) 
		{
			const width = element.getAttribute("width");

			if (width) {
				CDN += "width=" + width + ",";
			}

			const height = element.getAttribute("height");

			if (height) {
				CDN += "height=" + height + ",";
			}

			if (width && height)
				hasSizes = true;
		}

		// This is a normal image - I could not find srcset images in any themes
		if (element.hasAttribute("src")) 
		{
			// Add options
			if (hasSizes)
				CDN += `fit=crop,quality=${IMAGE_QUALITY},format=auto,onerror=redirect,metadata=none`;
			else
				CDN += `quality=${IMAGE_QUALITY},format=auto,onerror=redirect,metadata=none`;

			const src = element.getAttribute("src");

			// Ignore data/base64 images
			if (src && src.indexOf("base64") === -1) 
			{
				if (src.indexOf('/cdn-cgi/image/') === -1) 
				{

					let result;

					switch(PS_THEME)
					{
						case 0:
						{
							result = src.replace(rgxSrcClassic, `$1${CDN}$2$3`);
						}
						break;
						case 1:
						{
							result = src.replace(rgxSrcETS, `$1${CDN}$2$3`);
						}
						break;

						default:
							break;
					}

					element.setAttribute("src", result);
				}
			}
		}

		// Extra (slider)
		if (element.hasAttribute("data-full-size-image-url")) 
		{
			const dfsiu = element.getAttribute("data-full-size-image-url");

			if (dfsiu) 
			{
				if (dfsiu.indexOf('/cdn-cgi/image/') === -1) 
				{
					let result;

					switch(PS_THEME)
					{
						case 0:
						{
							result = dfsiu.replace(rgxSrcClassic, `$1${CDN}$2$3`);
						}
						break;
						case 1:
						{
							result = dfsiu.replace(rgxSrcETS, `$1${CDN}$2$3`);
						}
						break;

						default:
							break;
					}

					element.setAttribute("data-full-size-image-url", result);
				}
			}
		}

		// Extra (quickview)
		if (element.hasAttribute("data-image-medium-src")) 
		{
			const dims = element.getAttribute("data-image-medium-src");

			if (dims) 
			{
				if (dims.indexOf('/cdn-cgi/image/') === -1) 
				{
					let result;

					switch(PS_THEME)
					{
						case 0:
						{
							result = dims.replace(rgxSrcClassic, `$1${CDN}$2$3`);
						}
						break;
						case 1:
						{
							result = dims.replace(rgxSrcETS, `$1${CDN}$2$3`);
						}
						break;

						default:
							break;
					}

					element.setAttribute("data-image-medium-src", result);
				}
			}
		}

		// Extra (quickview)
		if (element.hasAttribute("data-image-large-src")) 
		{
			const dilc = element.getAttribute("data-image-large-src");

			if (dilc) 
			{
				if (dilc.indexOf('/cdn-cgi/image/') === -1) 
				{
					let result;

					switch(PS_THEME)
					{
						case 0:
						{
							result = dilc.replace(rgxSrcClassic, `$1${CDN}$2$3`);
						}
						break;
						case 1:
						{
							result = dilc.replace(rgxSrcETS, `$1${CDN}$2$3`);
						}
						break;

						default:
							break;
					}

					element.setAttribute("data-image-large-src", result);
				}
			}
		}

	}
}

/**
 * Rewrites the <li> tags, used to replace image sources for inline CSS (sliders and more)
 * @author Mecanik
 * @version 1.0.0
 */
class LiTagRewriter extends HTMLRewriter {
	async element(element) {
		if (element.hasAttribute("style")) {
			const style = element.getAttribute("style");

			if (style) 
			{
				if (style.indexOf('/cdn-cgi/image/') === -1) 
				{
					const CDN = `/cdn-cgi/image/quality=${IMAGE_QUALITY},format=auto,onerror=redirect,metadata=none`;

					let result;

					switch(PS_THEME)
					{
						case 0:
						{
							// Classic theme does not use this
						}
						break;
						case 1:
						{
							result = style.replace(rgxCssETS, `url('$1${CDN}$2$3')`);
						}
						break;

						default:
							break;
					}

					element.setAttribute("style", result);
				}
			}
		}

		// Extra
		if (element.hasAttribute("data-full-size-image-url")) {
			const dfsiu = element.getAttribute("data-full-size-image-url");

			if (dfsiu) {
				if (dfsiu.indexOf('/cdn-cgi/image/') === -1) {

						const CDN = `/cdn-cgi/image/quality=${IMAGE_QUALITY},format=auto,onerror=redirect,metadata=none`;
						let result;

						switch(PS_THEME)
						{
							case 0:
							{
								result = dfsiu.replace(rgxSrcClassic, `$1${CDN}$2$3`);
							}
							break;
							case 1:
							{
								result = dfsiu.replace(rgxSrcETS, `$1${CDN}$2$3`);
							}
							break;

							default:
								break;
						}

					element.setAttribute("data-full-size-image-url", result);
				}
			}
		}

		// Extra
		if (element.hasAttribute("data-slide-background-image")) {
			const dsbi = element.getAttribute("data-slide-background-image");

			if (dsbi) {
				if (dsbi.indexOf('/cdn-cgi/image/') === -1) {
						const CDN = `/cdn-cgi/image/quality=${IMAGE_QUALITY},format=auto,onerror=redirect,metadata=none`;
						let result;

						switch(PS_THEME)
						{
							case 0:
							{
								result = dsbi.replace(rgxSrcClassic, `$1${CDN}$2$3`);
							}
							break;
							case 1:
							{
								result = dsbi.replace(rgxSrcETS, `$1${CDN}$2$3`);
							}
							break;

							default:
								break;
						}

					element.setAttribute("data-slide-background-image", result);
				}
			}
		}
	}
}

/**
 * Rewrites the <scripts> tags, used to remove potentially malicious scripts (for now)
 * @author Mecanik
 * @version 1.0.0
 */
class ScriptTagRewriter extends HTMLRewriter {
	async element(element) {
		if(element.hasAttribute("src"))
		{
			const src = element.getAttribute("src");

			if(src)
			{
				// I don't know what the fuck this was, but after checking: https://web.archive.org/web/20210501040431/https://nguyenductrong.com/apm/access/remote.js
				// It looks very suspicious. Removing it for your safety.
				if(src.indexOf("nguyenductrong.com") !== -1)
				{
					element.remove();
				}
			}
		}
	}
}

/**
 * Entry point for worker in module syntax
 * @author Mecanik
 * @version 1.0.0
 */
export default {
	async fetch(request, env, ctx) {

		// If an error occurs, do not break the site, just continue
		// ctx.passThroughOnException();

		// We need to fetch the origin full response.
		const originResponse = await fetch(request);

		if (originResponse.status !== 200) {
			console.error(`Invalid Origin HTTP Status: ${originResponse.status}`);
			return originResponse;
		}

		const {
			origin,
			pathname,
			searchParams
		} = new URL(request.url);

		// Do not rewrite images inside these paths (save some cost?)
		if (pathname.indexOf("/admin") !== -1) {
			console.error(`Bypassing page by path: ${pathname}`);
			return originResponse;
		}

		// Trick or treat :)
		// Here we rewrite the images for Products "quickview"
		if(request.method === 'POST' && pathname === "/index.php")
		{
			const urlParams = new URLSearchParams(searchParams);
			const controller = urlParams.get('controller');

			if(controller && controller === "product")
			{
				let response = new Response(originResponse.body, {
					headers: originResponse.headers,
				});

				const originalBody = await originResponse.text();

				let parsed = JSON.parse(originalBody);

				if(parsed.hasOwnProperty('quickview_html'))
				{
					let newResponse = new HTMLRewriter()
						.on('img', new ImageTagRewriter())
						.transform(new Response(parsed.quickview_html));

					const finalResponse = await newResponse.text();

					parsed.quickview_html =  finalResponse;

					const body = JSON.stringify(parsed);

					// Return early because in this case only quickview_html is available
					response = new Response(body, response);
					return response;
				}
				
				if(parsed.hasOwnProperty('product_images_modal'))
				{
					let newResponse = new HTMLRewriter()
						.on('img', new ImageTagRewriter())
						.transform(new Response(parsed.product_images_modal));

					const finalResponse = await newResponse.text();

					parsed.product_images_modal =  finalResponse;
				}

				if(parsed.hasOwnProperty('product_cover_thumbnails'))
				{
					let newResponse = new HTMLRewriter()
						.on('img', new ImageTagRewriter())
						.transform(new Response(parsed.product_cover_thumbnails));

					const finalResponse = await newResponse.text();

					parsed.product_cover_thumbnails =  finalResponse;
				}

				if(parsed.hasOwnProperty('product_additional_info'))
				{
					let newResponse = new HTMLRewriter()
						.on('img', new ImageTagRewriter())
						.transform(new Response(parsed.product_additional_info));

					const finalResponse = await newResponse.text();

					parsed.product_additional_info =  finalResponse;
				}

				if(parsed.hasOwnProperty('product_details'))
				{
					let newResponse = new HTMLRewriter()
						.on('img', new ImageTagRewriter())
						.transform(new Response(parsed.product_details));

					const finalResponse = await newResponse.text();

					parsed.product_details =  finalResponse;
				}

				const body = JSON.stringify(parsed);

				response = new Response(body, response);

				return response;
			}
			else
			{
				return originResponse;
			}
		}

		// If the content type is HTML, we will run the rewriter
		const contentType = originResponse.headers.get("content-type");

		if (contentType === null) {
			console.error(`Missing Content Type: ${contentType}`);
			return originResponse;
		}

		if (contentType.startsWith("text/html")) {
			let newResponse = new HTMLRewriter()
				.on('img', new ImageTagRewriter())
				.on('li', new LiTagRewriter())
				.on('script', new ScriptTagRewriter())
				.transform(originResponse);

			return newResponse;
		} else {
			console.error(`Invalid Content Type: ${contentType}`);
			return originResponse;
		}
	}
}