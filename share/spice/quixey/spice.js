function ddg_spice_quixey (data) {

  /*****************/
  /* Init */
  /*****************/
  var query = data.q.replace(/\s/g, '+')

  var appKey = {};
  for (var i in data.results ) {
    app = data.results[i]
    appKey[app.id] = app
  }
   
  var getApp = function(id) {
    return appKey[id]
  };

  
  /********************/
  /* Helper Functions */
  /********************/
   // Make sure a property is defined on an object
  function isProp(obj, prop) {
    prop = prop.split('.')
    for (var i = 0, len = prop.length; i < len; i++) {
      if ((obj = obj[prop[i]]) === undefined)
        return false
    }
    return true
  }

  // Cross-browser prevent default
  function preventDefault(e) {
    e.preventDefault ? e.preventDefault() : e.returnValue = false
  }


  /********/
  /* Main */
  /********/
  
  var state = {}

  // placeholder for the videos
  state.apps = []
 
  function setup() {

    /* Initialize globals */
  
    state.min_win = 500 // minimum window width to show dots

    state.li_width = 90 // default total width and border of each carousel <li>
    state.li_padding = 14
    state.li_border = 0

    state.frame_padding = 14 // default frame padding and border
    state.frame_border = 2 
    
    state.current_item = 0 // current video in nav 
    
    //Set total width of <li>
    state.thumb_width = state.li_width + state.li_padding + state.li_border;

    // store window width
    state.win = YAHOO.util.Dom.getRegion('nav').width 
    var frame_width = state.win - state.frame_padding - state.frame_border
   
    // increment by how many thumbs
    state.inc = Math.floor(frame_width / state.thumb_width)

    // stretch li to fit max
    var extra = frame_width - (state.thumb_width * state.inc)
    state.li_width += Math.floor(extra / state.inc)

    // last video
    var linc = state.apps.length % state.inc
    state.last = Math.max(0, state.apps.length - (linc ? linc : state.inc))

    // whole states
    state.current_item -= state.current_item % state.inc

    // add the navigation
    createNav()

    // moves the slide to their current position
    setSlides()

    // style for prev / next
    pnClasses()

    // add the dots
    makeDots()

    // listen for window resizes
    YAHOO.util.Event.addListener(window, 'resize', function () {
      clearTimeout(state.resize)
      state.resize = setTimeout(setup, 400)  // tune
    })

  }


  /************************/
  /* FUNCTION DEFINITIONS */
  /************************/


  /*******************/
  /* Data Extraction */
  /*******************/
  function getInfo(id){
    app = getApp(id)

    var app_id_string = app.id.toString()

    var app_container = d.createElement("div")
    var img_anchor = d.createElement("a")
    var img = d.createElement('img')
        img_anchor.href = app.url || app.developer.url || dir_url
        img.src = app.icon_url
    var info = d.createElement('div')
    var name_wrap = d.createElement('div')
    var details = d.createElement('div')
        details.innerHTML = getDetails(app)
    var name = d.createElement('a')
        name.href = app.url
        name.innerHTML = shorten(app.name, 80)
    var price = d.createElement('div')
        price.innerHTML = getPrice(app.editions)
    var rating = d.createElement('div')
        if (app.rating != null) {
    rating.innerHTML = getRating(app)
  }
    var description = d.createElement('div');
    var clear = d.createElement('div')
    
    if (isProp(app, 'short_desc')) description.innerHTML += shorten(app.short_desc, 180)
       
    name_wrap.appendChild(name)
    name_wrap.appendChild(rating)
    name_wrap.appendChild(price)
    name_wrap.appendChild(description);
    img_anchor.appendChild(img)
    info.appendChild(img_anchor)
    info.appendChild(name_wrap)
    app_container.appendChild(info)
    app_container.appendChild(details)
    app_container.appendChild(clear)

    // Set Styles
    YAHOO.util.Dom.setAttribute(app_container, "id", app_id_string)
    YAHOO.util.Dom.setAttribute(details, "id", "details_" + app_id_string)
    if (app.rating != null){
      YAHOO.util.Dom.setAttribute(rating, "title", app.rating.toFixed(1))
      YAHOO.util.Dom.addClass(rating, "rating")
    }
    YAHOO.util.Dom.setAttribute(description, "title", app.short_desc)
    YAHOO.util.Dom.addClass(app_container, 'app_container')
    YAHOO.util.Dom.addClass(img_anchor, 'app_icon_anchor')
    YAHOO.util.Dom.addClass(img, 'app_icon')
    YAHOO.util.Dom.addClass(info, "app_info")
    YAHOO.util.Dom.addClass(price, "price")
    YAHOO.util.Dom.addClass(name_wrap, "name_wrap")
    YAHOO.util.Dom.addClass(details, "app_details ")
    YAHOO.util.Dom.addClass(name, 'name')
    YAHOO.util.Dom.setAttribute(name, "title", app.name)
    YAHOO.util.Dom.addClass(clear, "clear")
    YAHOO.util.Dom.addClass(description, "app_description")

    return app_container.innerHTML
  }
    
  function getDetails(app){
    var more_info   = d.createElement('div');
    var editions    = d.createElement('div');
    editions.innerHTML = getEditions(app.editions);
  
    more_info.appendChild(editions);
  
    YAHOO.util.Dom.addClass(editions, "app_editions")
    
    return more_info.innerHTML;
  } 

  function getEditions(editions_array){
    var editions = d.createElement("div")
    
    for (var i in editions_array){
      var current = editions_array[i]
      var img_anchor = d.createElement("a")
          img_anchor.href = current.url || dir_url
      var img = d.createElement('img')
          img.src = current.icon_url
      var edition = d.createElement("div")
      var price = "$" + ((current.cents)/100).toFixed(2).toString()
          price = price.replace("$0.00", "FREE")

      YAHOO.util.Dom.addClass(img_anchor, "app_edition_icon")
      YAHOO.util.Dom.addClass(edition, "app_edition")
      if (current.rating != null){
        rating = app.rating.toFixed(1)
        YAHOO.util.Dom.setAttribute(edition, "title", current.name + ' - Rating: ' + rating + ' - Price: ' + price)
      }else{
        YAHOO.util.Dom.setAttribute(edition, "title", current.name + ' - Price: ' + price)
      }
      img_anchor.appendChild(img)
      edition.appendChild(img_anchor)
      edition.innerHTML += getPlatforms(current.platforms, current.url)
      editions.appendChild(edition)
    }

    return editions.innerHTML
  }

  function getPlatforms (platforms_array, url){
    var platforms = d.createElement("div");

    for (var i in platforms_array){
      var current  = platforms_array[i];
      var platform = d.createElement("a");
          if (url != undefined) platform.href = url
      var img  = d.createElement("img");
      var name = d.createElement("span");
          name.innerHTML = current.name;

      // Get proper apple icon
      if (current.id === 2004 || current.id === 2015) {
        img.src = "https://icons.duckduckgo.com/i/itunes.apple.com.ico";
      }else {
        img.src = current.icon_url;
      }

      YAHOO.util.Dom.addClass(img, 'platform_icon');
      YAHOO.util.Dom.addClass(name, 'platform_name');
      YAHOO.util.Dom.addClass(platform, 'app_platform');

      platform.appendChild(img);
      platform.appendChild(name);
      platforms.appendChild(platform);
    }
    return platforms.innerHTML;
  }

  function getPrice (editions_array){
    var low  = editions_array[0].cents
    var high = editions_array[0].cents  
    var temp, range, lowp, highp
    for (var i in editions_array){
      temp = editions_array[i].cents
      if (temp < low) low = temp
      if (temp > high) high = temp
    }
   
    if (low == 0) {
      lowp = "FREE"
    }else{
      lowp = "$" + (low/100).toFixed(2).toString()
    }

    if (high > low) {
       highp =  "$" + (high/100).toFixed(2).toString()
       range = lowp + " - " + highp
    }else{
      range = lowp
    }
   
    return range
  }

  function getRating (app){
    var rating = d.createElement('div')
    repeat = Math.round(app.rating)
    for (var i=0; i < repeat; i++){
      star = d.createElement('span')
      YAHOO.util.Dom.addClass(star, "star")
      rating.appendChild(star)
    }
    return rating.innerHTML
  }

  function shorten (string, length) {
    if (length === undefined) length = 40;
    
    if (string.length > length){
      return string.slice(0,length-3) + '...';
    } else {
      return string;
    }
  }

  
  /**************/
  /* Navigation */
  /**************/

  function createNav() {

    // get main nav element
    var nav = d.getElementById('nav')
    nav.innerHTML = ''  // clear

    // create slider to hold thumbnails
    // will hide overflowing elements to look like slide
    var slider = d.createElement('div')
    slider.id = 'slider'

    var frame = d.createElement('div')
    frame.id = 'frame'

    // store state
    var len = state.apps.length
    var total_width = state.li_width + state.li_padding + state.li_border
    var end = total_width * len

    // create list of videos
    var ul = d.createElement('ul')
    ul.id = 'slides'
    YAHOO.util.Dom.setStyle(ul, 'width', end + 'px')

    var i, li, img, a, id, app, p, txt
    for (i = 0; i < len; i++) {
      li = d.createElement('li')
      YAHOO.util.Dom.addClass(li, 'item')
      YAHOO.util.Dom.setStyle(li, 'width', state.li_width + 'px')

      app = state.apps[i]
      
      if (!isProp(app, 'id')) continue
      id = app.id

      if (!isProp(app, 'url')) continue
      a = d.createElement('a')
      a.href = app.url

      YAHOO.util.Event.addListener(a, 'click', clickA(id))
      
      img = d.createElement('img')
      if (!isProp(app, 'icon_url')) continue
      img.src = app.icon_url 
  
      p = d.createElement('p')
      if (!isProp(app, 'name')) continue
      span= d.createElement('span')
      span.innerHTML = shorten(app.name, 40)

      p.appendChild(img)

      a.appendChild(p)
      a.appendChild(span)

      li.appendChild(a)
      ul.appendChild(li)
    }

    frame.appendChild(ul)
    slider.appendChild(frame)
    nav.appendChild(slider)

  }

  // Close around clicking thumbs
  function clickA(id) {
    return function (e) {
      preventDefault(e)
      var ul = d.getElementById('slides')
      var j = 0, len = ul.childNodes.length
      for (; j < len; j++) {
        YAHOO.util.Dom.removeClass(ul.childNodes[j], 'sel')
      }
      YAHOO.util.Dom.addClass(this.parentNode, 'sel')
      addPreview(id)
    }
  }

  // Make prev / next arrows
  function makeArrow(id, next) {
    var na = d.createElement('a')
    na.href = '#'
    na.id = id
    
    var na_img = d.createElement('img')
    na_img.id = id + '_img'
    na_img.src = (next) ? DDG.get_asset_path("arrow-next.png") : DDG.get_asset_path("arrow-prev.png");

    na.appendChild(na_img)

    YAHOO.util.Dom.addClass(na_img, 'npa_img')
    YAHOO.util.Dom.addClass(na, 'npa')
    YAHOO.util.Event.addListener(na, 'click', wrapCB(next))
    var pagination = d.getElementById('pagination')
    pagination.appendChild(na)
  }

  // Click handler for prev / next arrows
  function wrapCB(next) {
    return function (e) {
      preventDefault(e)

      if (state.current_item === 0 && !next) return
      if (state.current_item === state.last && next) return

      state.current_item += (next ? 1 : -1) * state.inc

      // edge conditions when resizing
      if (state.current_item < 0) state.current_item = 0
      if (state.current_item > state.last) state.current_item = state.last

      doNav(state.current_item / state.inc)
    }
  }

  // Invoke common nav methods
  function doNav(i) {
    setSlides()
    pnClasses()
    highlightDot(i)
  }

  // Slide the thumbnails around
  function setSlides() {
    var mar = '-' + (state.current_item * (state.li_width + state.li_padding + state.li_border)) + 'px'
    YAHOO.util.Dom.setStyle('slides', 'margin-left', mar)
  }

  // Set styling on previous / next buttons
  function pnClasses() {
    if (state.current_item > 0) YAHOO.util.Dom.removeClass('preva', 'npah')
    else YAHOO.util.Dom.addClass('preva', 'npah')

    if (state.current_item < state.last) YAHOO.util.Dom.removeClass('nexta', 'npah')
    else YAHOO.util.Dom.addClass('nexta', 'npah')
  }

  // Highlight the appropriate dot
  function highlightDot(j) {
    var dots = d.getElementById('dots')
    var n = Math.ceil(state.apps.length / state.inc)

    if (n > 4 && state.win < state.min_win)  // small screen
      return showPage(dots, n)

    dots = dots.childNodes
    var l = dots.length
    var k = 0
    for (; k < l; k++) YAHOO.util.Dom.removeClass(dots[k], 'selected')
    YAHOO.util.Dom.addClass(dots[j], 'selected')
  }

  // Close around dot handler
  function dotHandler(j) {
    return function (e) {
      preventDefault(e)
      state.current_item = j * state.inc
      doNav(j)
    }
  }

  // Show page numbers
  function showPage(dots, n) {
    var sel = state.current_item / state.inc
    var p = d.createElement('p')
    YAHOO.util.Dom.addClass(p, 'page')
    p.appendChild(d.createTextNode((sel + 1) + '/' + n))
    dots.innerHTML = ''  // clear
    dots.appendChild(p)
  }

  // Make the dots
  function makeDots() {
    var dots = d.getElementById('dots')
    if (!dots) {
      dots = d.createElement('div')
      dots.id = 'dots'
      var nav = d.getElementById('nav')
      
      pagination = d.createElement('div');
      pagination.id = "pagination";
      nav.appendChild(pagination);

      // add the prev / next arrows
      makeArrow('nexta', true)
      makeArrow('preva', false)
      pagination.appendChild(dots)
    }
    var lin, j = 0, n = Math.ceil(state.apps.length / state.inc)
    var sel = state.current_item / state.inc

    if (n > 4 && state.win < state.min_win)  // at most 4 dots on small screens
      return showPage(dots, n)

    dots.innerHTML = ''  // clear
    for (; j < n; j++) {
      lin = d.createElement('a')
      lin.appendChild(d.createTextNode('\u2022'))
      lin.href = '#'
      if (j === sel) YAHOO.util.Dom.addClass(lin, 'selected')
      YAHOO.util.Event.addListener(lin, 'click', dotHandler(j))
      dots.appendChild(lin)
    }
  }


  /*****************/
  /* Preview Embed */
  /*****************/

  // Add app preview to screen
  function addPreview(id) {
    var preview
    if (!id) {
      preview = d.getElementById('preview')
      if (!preview) return
      id = YAHOO.util.Dom.getAttribute(preview, 'app')
    }
    preview = d.createElement('div')
    preview.id = 'preview'
    preview.innerHTML = getInfo(id)
    
    YAHOO.util.Dom.setStyle(preview, 'width', '100%')
    YAHOO.util.Dom.setStyle(preview, 'height', '100%')
    YAHOO.util.Dom.setAttribute(preview, 'app', id)

    var emb = d.getElementById('emb')
    emb.innerHTML = '' //clear
    emb.appendChild(preview)
    YAHOO.util.Dom.setStyle('emb', 'display', 'block')
  }

  // If we have a videos to display
  if (data && isProp(data, 'results') && data.results.length > 0) {

    // store the apps
    state.apps = data.results

    // main container
    var container = d.createElement('div')
    var div = d.createElement('div')
    div.id = 'quixey'

    // container for navigation
    var nav = d.createElement('div')
    nav.id = 'nav'
    div.appendChild(nav)

    // container for the app preview, initially hidden
    var emb  = d.createElement('div')
    emb.id = 'emb'
    div.appendChild(emb)

   // Append Quixey div to container
   container.appendChild(div)

    // set more at link
    var u = 'https://www.quixey.com/search?q='
    if (isProp(data, 'q')) {
      var q = data.q.replace(/\s/g, '+')
    }

    // ddg: add to page
    var items = [{
      f: 1,
      a: container.innerHTML,
      h: data.q + ' (App Search)',
      s: 'Quixey',
      u: u + q,
      force_big_header: true,
      force_more_at_logo:"quixey_logo.png"
    }]
    nra(items, 0, true)

    // start spice
    setup()
  }
}
