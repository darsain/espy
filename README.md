# Espy

jQuery plugin for on-scroll detecting whether the element entered or left the viewport.

Any time you scroll, Espy checks whether the element entered or left the trigger area (window viewport by default)
specified in the options. On each change in state, callback will be fired with all necessary diagnostics of the element
position relative to the trigger area.

What is considered a trigger area is configurable. By default, the trigger area is the visible part of the screen.

#### Dependencies

- jQuery 1.7+

#### Compatibility

So simple, it should work everywhere. Briefly tested in IE6+, Chrome, FF, Opera, Safari.

### [Changelog](https://github.com/Darsain/espy/wiki/Changelog)

Espy upholds the [Semantic Versioning Specification](http://semver.org/), and currently is in **Beta**.

## API documentation

```js
$(selector).espy( callback [, options ] );
```

#### callback

Function to be executed when element enters or leaves the trigger area.

Function context - *this* - is the concerned element.

Receives these arguments:

- **entered** `Boolean` True when element entered the viewport, false when it left.
- **state** `String` Specifying in which direction is the element in regard to the trigger area.
Can be: `up` & `down` in vertical mode, `left` & `right` in horizontal mode, and `inside` when covering, or contained in
the trigger area.

Example:

```js
$(selector).espy(function (entered, state) {
	if (entered) {
		// element entered the viewport
		// state === 'inside'
	} else {
		// element left the viewport
		if (state === 'up') {
			// element is now above the trigger area
		} else if (state === 'down') {
			// element is now below the trigger area
		}
	}
});
```

#### [ options ]

**context**: `Node` `window` Element scrolling context.

**horizontal**: `Bool` `0` Enables the horizontal scrolling mode.

**offset**: `Int` `0` Offset from start of the context (top in vertical, left in horizontal) specifying the trigger
area. Can be integer for offset in pixels, % for offset relative to the size of the context, positive number for offset
from start, and negative for offset from end.

**size**: `Mixed` `100%` Size of the trigger area. Can be integer for size in pixels, or % string for size relative to
the size of the context.

**contain**: `Bool` `0` By enabling this, the callback with `entered=true` will be called only when the whole element is
completely contained within the trigger area, as opposed to just partially covering it. If the element is bigger than
the trigger area itself, the callback with `entered=true` will never be fired.

## Using the Espy class

`jQuery.fn.espy` (described above) is basically just a simple proxy for Espy class declared in `jQuery.Espy` namespace.
You can use this class directly to get more power over the Espy functionality.

```js
jQuery.Espy( context [, callback ] [, options ] );
```

Arguments:

**context**: `Node` Scrolling context.

**callback**: `Function` Global function to be called for each element that changes state. Receives the same arguments
as `callback` documented above.

**options**: `Object` Global options for this object instance. Same properties as options defined above. Extends default
 options, and can be further overridden for each element. Has one extra property called `delay`, specifying the minimum
 delay in milliseconds that throttles the frequency of `scroll` events to once per `delay`. Default `delay` is `100`.

Example:

Create an Espy object for window context:

```js
var windowSpy = new jQuery.Espy(window, callback);
```

### Methods

---

#### add

```js
windowSpy.add( element [, callback ] [, options ] );
```

Add element(s) to spying list. Arguments:

**element**: `Mixed` Can be a selector, element node, or a jQuery object with one or multiple elements.

**callback**: `Function` Function to be executed on **element** state change. Same arguments as callbacks documented
above. Doesn't override the main instance's callback, but is triggered along with it.

**options**: `Object` Object with options. Same properties as options defined above.

Examples:

```js
windowSpy.add('#element'); // jQuery selector
windowSpy.add(document.getElementById('element')); // Direct element node
windowSpy.add(jQuery('.elements')); // Multiple elements in jQuery object
```

**Note!**: When you add an item multiple times, you won't produce duplicates, you will just override it's callback and
options.

---

#### reload

```js
windowSpy.reload( element );
```

Reload element(s)'s dimensions. Call this on element that has changed it's position or size. Arguments:

**element**: `Mixed` Can be a selector, element node, or a jQuery object with one or multiple elements.

---

#### remove

```js
windowSpy.remove( element );
```

Remove element(s) from spying list. Arguments:

**element**: `Mixed` Can be a selector, element node, or a jQuery object with one or multiple elements.

---

#### destroy

```js
windowSpy.destroy();
```

Destroy Espy object. Removes registered events, clears spying list, ...


## Contributing

Contributions are welcome! But please:

- Maintain the coding style used throughout the project, and defined in the `.editorconfig` file.
	[Editorcofig plugin for SublimText 2](https://github.com/sindresorhus/editorconfig-sublime).
- Resulting code has to pass JSHint with options defined in the `.jshintrc` file. You can install
	[SublimeLinter plugin for SublimText 2](https://github.com/SublimeLinter/SublimeLinter) to do it automatically, or
	run `grunt lint` task.

## Credits

- Inspired by the need for something like [imakewebthings/jquery-waypoints](https://github.com/imakewebthings/jquery-waypoints),
	but more functional, with better API, and simple - not bloated to 8KB minified o.O.
- Espy is internally using simplified [jquery-throttle-debounce](https://github.com/cowboy/jquery-throttle-debounce/)
	from [Ben "Cowboy" Alman](https://github.com/cowboy).
