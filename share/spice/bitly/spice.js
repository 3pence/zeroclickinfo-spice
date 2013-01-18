function ddg_spice_bitly (r) {
	"use strict";
	if (r && r.status_code === 200) {
		var url = r.data && r.data.url;
		var items = [[]];
		items[0] = {
			a: '<span>Here is a shortened version of that URL: <input type="text" autofocus value="' + url + '"/></span><br />',
			h: 'Shortened URL (Bitly)',
			i: 'http://i.imgur.com/xVpFr.png',
			s: 'Bitly',
			u: url + "+",
			force_big_header: true
		};
		nra(items, 1, 2);
	}
}
