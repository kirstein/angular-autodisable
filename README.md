# angular-autodisable [![Build Status](https://travis-ci.org/kirstein/angular-autodisable.png)](https://travis-ci.org/kirstein/angular-autodisable)

An extension to angular `ng-click` directive that automatically sets the element to disabled if the handler would return a promise.

### Requirements

1. angular.js version >1.2+
2. following es5 functions:  
    1. `bind`
    2. `map`
    3. `forEach`


### Getting started

Include `ngAutodisable` as dependency  

```
  angular.module('MyApp', [ 'ngAutodisable', ... ]);
``` 

### Usage

1. just attach `ng-autodisable` directive to the element which happens to have `ng-click` directive.
2. ???
3. profit!

```
  <button ng-click="doSomething()" ng-autodisable>Do something</button>
```


### Demo

A quick demo is available at [jsfiddle](http://jsfiddle.net/kirstein/wXnks/)

### How it works

`ngAutodisable` overrides the default `ngClick` directive. The default `ngClick` action is recreated _(and passes all the angular specs)_.  

When `ngClick` and `ngAutodisable` are on the same element then after the `click` event happens on the element the click handlers result will be evaluated.

If the click handlers result happens to be a `promise` _(`$http` or `$q`)_ then the element attribute `disabled` will be set as true. If the promise fulfils then the element `disabled` attribute will be removed.

This also works with mutliple click handlers, given that click handlers are sepereted by `;` as such:  

```
  <button ng-click="doSomething();doSomethingElse()" ng-autodisable>Do something</button>
```

If there are multiple click handlers then the element disabled style will be removed after the last promise resolves.

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



