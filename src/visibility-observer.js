// visibilityObserver
//
// Uses:
// Intersection Observer (V1)
// https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API


class visibilityObserver {
  constructor(options) {
    this.options = Object.assign({}, {
      el: null,
      log: false, // en-/disable logging
      callback: null,
      intersectionRoot: null,
      intersectionRootMargin: "0px",
      intersectionThreshold: 0, // default 0, meaning as soon as even one pixel is visible it is considered visible
      observe: true
    }, options);


    if (!this.options.el || this.options.el.length) return false;


    this.cfg = {
      documentVisibilityEventName: this._getDocumentVisibilityEventName(),
      documentVisibilityStateName: this._getDocumentVisibilityStateName(),
    }


    // Needed to intersect data-setup due to order of initializing
    this.data = {
      observing: false,
      state: null
    }
    this.data.handlers = {
      documentFocus: this._documentFocusHandler.bind(this),
      documentVisibility: this._documentVisibilityHandler.bind(this),
      mutation: this._mutationHandler.bind(this),
      viewport: this._viewportHandler.bind(this)
    }
    this.data.observers = {
      mutation: this._mutationObserver(),
      viewport: this._viewportObserver()
    }
    this.data.states = {
      cssVisibility: false,
      cssDisplay: false,
      cssOpacity: false,
      viewport: false,
      documentFocus: false,
      documentVisibility: false
    }


    this.options.el.visibilityObserver = this;


    if (this.options.observe) {
      this.startObserve();
    }
  }


  startObserve() {
    if (this.data.observing) return false;


    //
    // CSS Visibility
    //

    // Set value once
    this.data.states.cssVisibility = this._testCssVisibility();



    //
    // CSS display
    //

    // Set value once
    this.data.states.cssDisplay = this._testCssDisplay();



    //
    // CSS Opacity
    //

    // Set value once
    this.data.states.cssOpacity = this._testCssOpacity();



    //
    // Document focus
    //

    // Add handler
    this._addEventListener(window, ["focus", "blur"], this.data.handlers.documentFocus);

    // Set value once
    this.data.states.documentFocus = this._testDocumentFocus();



    //
    // Document visibility
    //

    // Add handler
    this._addEventListener(window, this.cfg.documentVisibilityEventName, this.data.handlers.documentVisibility, {capture: false});

    // Set value once
    this.data.states.documentVisibility = this._testDocumentVisibility();



    //
    // Viewport observer
    //

    // Start observer
    this.data.observers.viewport.observe(this.options.el);




    //
    // Mutation observer
    //

    // Start observer
    this.data.observers.mutation.observe(this.options.el, {
      attributes: true
    });



    this.data.observing = true;


    return true;
  }


  stopObserve() {
    if (!this.data.observing) return false;


    // Remove document focus handler
    this._removeEventListener(window, ["focus", "blur"], this.data.handlers.documentFocus);


    // Remove document visibility handler
    this._removeEventListener(window, this.cfg.documentVisibilityEventName, this.data.handlers.documentVisibility, {capture: false});


    // Viewport Observer
    this.data.observers.viewport.unobserve(this.options.el);


    this.data.observing = false;


    return true;
  }


  _test() {
    for (let [key, value] of Object.entries(this.data.states)) {
      if (!value) {
        return false;
      }
    }

    return true;
  }


  _callback() {
    var previousState = this.data.state,
      state = this._test();

    if (state == previousState) return;

    this.data.state = state;

    if (this.options.log) this._log();

    if (!this.options.callback) return;

    this.options.callback(state);
  }


  _log() {
    console.log({
      state: this.data.state,
      states: this.data.states
    });
  }


  _testCssVisibility() {
    return this._getStyle(this.options.el, 'visibility') == 'visible';
  }


  _testCssDisplay() {
    return this._getStyle(this.options.el, 'display') !== 'none';
  }


  _testCssOpacity() {
    return parseFloat(this._getStyle(this.options.el, 'opacity')) == 0 ? false : true;
  }


  _testViewport(IntersectionObserverEntry) {
    if (IntersectionObserverEntry) {
      this.data.states.viewport = IntersectionObserverEntry[0].isIntersecting;
    }

    return this.data.states.viewport;
  }


  _testDocumentFocus() {
    return document.hasFocus();
  }


  _testDocumentVisibility() {
    return document[this.cfg.documentVisibilityStateName] == 'visible';
  }



  // Window Focus/Blur Handler/Event
  _documentFocusHandler() {
    this.data.states.documentFocus = this._testDocumentFocus();

    this._callback();
  }



  _getDocumentVisibilityEventName() {
    var e;

    if (typeof document.hidden !== "undefined") { // Generic
      e = "visibilitychange";
    } else if (typeof document.mozHidden !== "undefined") { // Mozilla
      e = "mozvisibilitychange";
    } else if (typeof document.msHidden !== "undefined") { // IE/Edge
      e = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") { // Webkit
      e = "webkitvisibilitychange";
    }

    return e;
  }


  _getDocumentVisibilityStateName() {
    var prop;

    if (typeof document.hidden !== "undefined") { // Generic
      prop = "visibilityState";
    } else if (typeof document.mozHidden !== "undefined") { // Mozilla
      prop = "mozVisibilityState";
    } else if (typeof document.msHidden !== "undefined") { // IE/Edge
      prop = "msVisibilityState";
    } else if (typeof document.webkitHidden !== "undefined") { // Webkit
      prop = "webkitVisibilityState";
    }

    return prop;
  }


  // Window visibility handler
  _documentVisibilityHandler() {
    this.data.states.documentVisibility = this._testDocumentVisibility();

    this._callback();
  }



  _viewportObserver() {
    return new IntersectionObserver(this.data.handlers.viewport, {
      root: this.options.intersectionRoot,
      rootMargin: this.options.intersectionRootMargin,
      threshold: this.options.intersectionThreshold
    });
  }


  // Viewport Intersection Handler
  _viewportHandler(IntersectionObserverEntry) {
    this.data.states.viewport = this._testViewport(IntersectionObserverEntry);

    this._callback();
  }



  //
  // Mutation observer
  //

  _mutationObserver() {
    return new MutationObserver(this.data.handlers.mutation);
  }


  // Viewport Intersection Handler
  _mutationHandler(mutations) {
    mutations.forEach(
      function(mutation) {
        if (mutation.type == 'attributes') {
          this.data.states.cssVisibility = this._testCssVisibility();
          this.data.states.cssDisplay = this._testCssDisplay();
          this.data.states.cssOpacity = this._testCssOpacity();
        }
      }.bind(this)
    );

    this._callback();
  }



  _addEventListener(el, type, fn, options) {
    // Adds an event of type(s) to object(s)
    // It extends "addEventListener" with functionality to pass arrays of objects(=elements) and types
    //
    // Examples:
    // this._addEventListener(window, "resize", console.log("resized"));
    // this._addEventListener([window, document], ["resize", "orientationchange"], console.log("resized"), {once: true});
    //
    // @param object|array object - object to add event(s)
    // @param string|array type - event-type
    // @param function callback - callback function
    // @param object options - optional parameters (see Link below) plus: dkDebounce (int - milliseconds), dkRequestIdleCallback
    //
    // https://developer.mozilla.org/de/docs/Web/API/EventTarget/addEventListener

    if (Array.isArray(el) || NodeList.prototype.isPrototypeOf(el) || HTMLCollection.prototype.isPrototypeOf(el)) {
      // iterate el-array
      for (const elTmp of el) {
        this._addEventListener(elTmp, type, fn, options);
      }
    } else if (Array.isArray(type)) {
      // iterate type-array
      for (const typeTmp of type) {
        this._addEventListener(el, typeTmp, fn, options);
      }
    } else {
      if (options && options.dkDebounce) {
        // w/ debounce
        var debounce = function(fn) {
          var t;
          return function(e) {
            if (t) clearTimeout(t);
            t = setTimeout(fn, options.dkDebounce);
          }
        }
        el.addEventListener(type, debounce(fn), options);
      } else if (options && options.dkRequestIdleCallback) {
        // w/ RequestIdleCallback
        el.addEventListener(type, function() {
          window.requestIdleCallback(fn);
        });
      } else {
        // w/o debounce
        el.addEventListener(type, fn, options);
      }
    }
  }


  _removeEventListener(el, type, fn, options) {
    if (Array.isArray(el) || NodeList.prototype.isPrototypeOf(el) || HTMLCollection.prototype.isPrototypeOf(el)) {
      // iterate el-array
      for (const elTmp of el) {
        this._removeEventListener(elTmp, type, fn, options);
      }
    } else if (Array.isArray(type)) {
      // iterate type-array
      for (const typeTmp of type) {
        this._removeEventListener(el, typeTmp, fn, options);
      }
    } else {
      el.removeEventListener(type, fn, options);
    }
  }


  // https://stackoverflow.com/a/16112771
  _getStyle(el, styleProp) {
    var value, defaultView = (el.ownerDocument || document).defaultView;
    // W3C standard way:
    if (defaultView && defaultView.getComputedStyle) {
      // sanitize property name to css notation
      // (hyphen separated words eg. font-Size)
      styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
      return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    } else if (el.currentStyle) { // IE
      // sanitize property name to camelCase
      styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
        return letter.toUpperCase();
      });
      value = el.currentStyle[styleProp];
      // convert other units to pixels on IE
      if (/^\d+(em|pt|%|ex)?$/i.test(value)) {
        return (function(value) {
          var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
          el.runtimeStyle.left = el.currentStyle.left;
          el.style.left = value || 0;
          value = el.style.pixelLeft + "px";
          el.style.left = oldLeft;
          el.runtimeStyle.left = oldRsLeft;
          return value;
        })(value);
      }
      return value;
    }
  }
};
