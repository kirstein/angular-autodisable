/* 
 * angular-autodisable 0.0.1
 * http://github.com/kirstein/angular-autodisable
 * 
 * Licensed under the MIT license
 */
(function (angular) {
  'use strict';

  return angular.module('ngAutodisable', []).directive('ngClick', [ '$parse', function($parse) {

    var EVENT    = 'click',     // Binding event
        DISABLED = 'disabled';  // Disabled attribute

    /**
     * Validates if the given promise is really a promise that we can use.
     * Out promises must have at least `then` and `finally` functions
     *
     * @param {Object} promise promise to test
     * @return {Boolean} true if its a promise, otherwise false
     */
    function isPromise(promise) {
      return promise                          &&
             angular.isFunction(promise.then) &&
             angular.isFunction(promise['finally']);
    }

    /**
     * Checks if the attributes have the `ngAutodisable` attribute
     *
     * @param {Object} attrs attributes
     * @return {Boolean} true/false
     */
    function hasAutodisable(attrs) {
      return 'ngAutodisable' in attrs;
    }

    /**
     * @param {Object} attr attributes
     */
    function setDisabled(attrs, value) {
      attrs.$set(DISABLED, value);
    }

    /**
     * Handle disabled style.
     * Will attach the disabled style from get-go and remove it after the promise is resolved.
     *
     * @param {Promise} promise promise
     * @param {Object} attrs attributes
     */
    function handleDisabled(promise, attrs) {
      setDisabled(attrs, true);

      // Wrap the promise and on each return case
      // since finally is reserved word we must use string notation to call the function
      promise['finally'](function() {
        setDisabled(attrs);
      });
    }

    /**
     * The link function for this directive.
     * Contains a prepended function that represents the ngClick handler.
     *
     * @param {Function} fn click handler
     * @param {Object} scope scope
     * @param {Angular Element} element directive element
     * @param {Object} attrs attributes
     */
    function linkFn(fn, scope, element, attrs) {

      // Remove the click handler and replace it with our new one
      // with this move we completely disable the original ngClick functionality
      element.unbind(EVENT).bind(EVENT, function() {

        var result = fn(scope, { $event : EVENT });

        // If the autodisable "keyword" is set and the result is a promise
        // then lets handle the disabled style
        if (hasAutodisable(attrs) && isPromise(result)) {
          handleDisabled(result, attrs);
        }
      });
    }

    return {
      restrict : 'A',
      priority : 100,
      compile  : function(el, attr) {
        return linkFn.bind(null, $parse(attr.ngClick));
      }
    };
  }]);

})(angular);
