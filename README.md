# visibility-observer

**visibility-observer** adds events for visibility-changes of HTML elements.
It extends the [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) with Document focus & visibility-checks and provides an all-in-one solution for observing element visibility.



It does cover following properties/states:

* CSS properties: display, visibility, opacity
* Document/Window focus
* Document/Window visibility



Where it *cannot* help you:

* Element hidden due to Z-Indexes
* Element is hidden due to elements not in document-flow (fixed, absolute, ...)



## Installation

### Download

Download and copy this repository to `/site/plugins/visibility-observer`.

### Git submodule

```
git submodule add https://github.com/swiegmann/visibility-observer.git
```

### Composer

```
composer require swiegmann/visibility-observer
```



## Usage

```
var observer = new visibilityObserver({
	el: document.querySelector("#doc > footer"),
	callback: function(b) {
		// ...Do your stuff
	}
});
```

This will log visibility results to console by default.



## Options

| Property               | Default        | Description               |
|---------------------------|----------------|---------------------------|
| **el** (required) | null | (element) the Element to observe |
| callback | null | (function) callback-function. Will be called initially and on visibility-changes. |
| log | false | (bool) en-/disable logging to console |
| intersectionRoot | null | (element) The element that is used as the viewport for checking visibility of the  target. Must be the ancestor of the target. Defaults to the browser-viewport. |
| intersectionRootMargin | "0px" | (string) Margin around the root. Can have values similar to the CSS [`margin`](https://developer.mozilla.org/en-US/docs/Web/CSS/margin) property. |
| intersectionThreshold | 0 | (float) consider the element visible when this amount is in the viewport. The default is 0 (meaning as soon as even one pixel is visible, the  callback will be run). A value of 1.0 means that the threshold isn't  considered passed until every pixel is visible. |
| observe | true | (bool) If true, will start to observe immediately |



## Methods

| Name         | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| startObserve | programmatically start observing. Will be called when option **`observe`** is `true`. |
| stopObserve  | programmatically stop observing.                             |