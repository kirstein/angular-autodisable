/* 
 * angular-autodisable 0.0.1
 * http://github.com/kirstein/angular-autodisable
 * 
 * Licensed under the MIT license
 */
(function (angular) {
  'use strict';

  return angular.module('ngAutodisableModule', []).directive('ngClick', [ '$parse', '$q', function($parse, $q) {

    var EVENT    = 'click',     // Binding event
        DISABLED = 'disabled';  // Disabled attribute

    /**
     * @param {Object} result unknown result
     * @return {Boolean} true if httppromise, otherwise false
     */
    function isHTTPPromise(result) {
      return angular.isFunction(result.success) && angular.isFunction(result.error);
    }

    /**
     * @param {Object} result unknown result
     * @return {Boolean} true if $q promise, otherwise false
     */
    function isQPromise(result) {
      return angular.isFunction(result.then);
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
     * Wraps promises to $q promise.
     * Always returns a new promise!
     *
     * @param {HTTPPromise|Promise} promise promise to wrap
     * @return {Promise} $q promise
     */
    function wrapPromise(promise) {
      var defer = $q.defer();

      if (isHTTPPromise(promise)) {
        promise.success(defer.resolve).error(defer.reject);
      } else {
        promise.then(defer.success, defer.reject);
      }

      return defer.promise;
    }

    /**
     * Handle disabled style.
     * Will attach the disabled style from get-go and remove it after the promise is resolved.
     *
     * @param {HTTPPromise|Promise} result promise
     * @param {Object} attrs attributes
     */
    function handleDisabled(result, attrs) {
      setDisabled(attrs, true);

      // Wrap the promise and on each return case
      // lets release the disable
      wrapPromise(result).then(function() {
        setDisabled(attrs);
      }, function() {
        setDisabled(attrs);
      });
    }

    return {
      restrict : 'A',
      compile  : function(el, attr) {
        var fn = $parse(attr.ngClick);
        return function(scope, element, attrs) {

          // Remove the click handler and replace it with our new one
          // with this move we completely disable the original ngClick functionality
          element.off(EVENT).on(EVENT, function() {
            var result = fn(scope, { $event : EVENT });

            // If the autodisable "keyword" is set and the result is a promise
            // then lets handle the disabled style
            if (hasAutodisable(attrs) && (isQPromise(result) || isHTTPPromise(result))) {
              handleDisabled(result, attrs);
            }
          });
        };
      }
    };
  }]);

})(angular);
