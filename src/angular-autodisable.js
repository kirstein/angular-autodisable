(function (angular) {
  'use strict';

  /**
   * Wraps a given function in callback
   *
   * @param {Function} fn function to wrap
   * @return {Function} closure
   */
  function wrap(fn) {
    var args = [].slice.call(arguments, 1);
    return function () {
      return fn.apply(null, args);
    };
  }

  return angular.module('ngAutodisableModule', []).directive('ngClick', [ '$parse', function($parse) {

    var EVENT    = 'click',     // Binding event
        DISABLED = 'disabled';  // Disabled attribute

    /**
     * Validate that the input is a promise.
     * Currently only works on HTTP promises....
     *
     * @param {Object} result unknown result
     * @return {Boolean} true if promise, otherwise false
     */
    function isPromise(result) {
      return (angular.isFunction(result.success) && angular.isFunction(result.error));
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
    function toggleDisabled(attrs) {
      attrs.$set(DISABLED, !attrs[DISABLED]);
    }

    /**
     * Handle disabled style.
     * Will attach the disabled style from get-go and remove it after the promise is resolved.
     *
     * @param {HTTPPromise} result promise
     * @param {Object} attrs attributes
     */
    function handleDisabled(result, attrs) {
      toggleDisabled(attrs);
      result.success(wrap(toggleDisabled, attrs))
            .error(wrap(toggleDisabled, attrs));
    }

    return {
      restrict : 'A',
      compile  : function(el, attr) {
        var fn = $parse(attr.ngClick);
        return function(scope, element, attrs) {

          // Remove the click handler and replace it with our new one
          // with this move we completely disable the original ngClick functionality
          element.off(EVENT).on(EVENT, function() {
            scope.$apply(function() {
              var result = fn(scope, { $event : EVENT });

              // If the autodisable "keyword" is set and the result is a promise
              // then lets handle the disabled style
              if (hasAutodisable(attrs) && isPromise(result)) {
                handleDisabled(result, attrs);
              }
            });
          });

        };
      }
    };
  }]);

})(angular);
