# angular-autodisable [![Build Status](https://travis-ci.org/kirstein/angular-autodisable.png)](https://travis-ci.org/kirstein/angular-autodisable)

An extension to angular `ng-click` directive that automatically sets the element to disabled if the handler would return a promise.

### Requirements
---

1. angular.js version >1.2+
2. following es5 functions:  
    1. [`bind`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)
    2. [`map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
    3. [`forEach`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach)
    4. [`indexOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)


### Usage
---

Include `ngAutodisable` as dependency  

```
  angular.module('MyApp', [ 'ngAutodisable', ... ]);
``` 

If thats done then just follow those simple steps:  

1. just attach `ng-autodisable` directive to the element which happens to have `ng-click` directive.
2. ???
3. profit!

```
  <button ng-click="doSomething()" ng-autodisable>Do something</button>
```
#### Loading class

You can optianlly add a list of classes which will be added to the element while this is disabled. This is usefull to add a spinner or something similar.

```
  <button ng-click="doSomething()" ng-autodisable-class="class1 class2" ng-autodisable>Do something</button>
```


### Demo
---

A quick demo is available at [jsfiddle](http://jsfiddle.net/kirstein/wXnks/embedded/result/)

### How it works
---

When `ngClick` and `ngAutodisable` are on the same element then `ngAutodisable` overwrites the handler for `click` event. The default `ngClick` action is recreated _(and passes all the angular specs)_.  

If the click handlers result happens to be a `promise` _(`$http` or `$q`)_ then the element attribute `disabled` will be set as true. If the promise fulfils then the element `disabled` attribute will be removed.

This also works with multiple click handlers, given that click handlers are separated by `;` as such:  

```
  <button ng-click="doSomething();doSomethingElse()" ng-autodisable>Do something</button>
```

If there are multiple click handlers then the element disabled style will be removed after the last promise resolves.

### Note
---

Throws an exception `ngAutodisable requires ngClick attribute in order to work` if `ngAutodisable` is on an element without `ngClick`.

### Devel
---

```
  npm install
  bower install
  grunt test
  grunt build
```

### License
---

MIT



