(function (angular) {
  'use strict';

  return angular.module('ngAutodisable', []).directive('ngClick', [ '$parse', function($parse) {
    var EVENT    = 'click',         // Binding event
        DISABLED = 'disabled',      // Disabled attribute
        ATTRNAME = 'ngAutodisable'; // The main attributes name

    // Id for the registered handlers.
    // Will be incremented in order to make sure that handler is uniquely registered
    var handlerId = 0;

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
      return ATTRNAME in attrs;
    }

    /**
     * Unregisters promise from the attributes list.
     *
     * @param {Object} attrs attributes
     * @param {Number} id id of the current promise to unregister
     * @return {Array} array of remaining ids
     */
    function unregisterPromise(attrs, id) {
      var ids = attrs[ATTRNAME];
      ids.splice(ids.indexOf(id), 1);
      attrs.$set(ATTRNAME, ids);
      return ids;
    }

    /**
     * Register the promise to the attributes list.
     * Grant its the unique ID
     *
     * @param {Object} attrs attributes
     * @return {Number} registered attribute id
     */
    function registerPromise(attrs) {
      var id = handlerId++;
      attrs.$set(ATTRNAME, (attrs[ATTRNAME] || []).concat(id));
      return id;
    }


    /**
     * Sets disabled property for the element.
     * If the element contains more unfulfilled promises then it will not allow the element disabled set to false
     *
     * @param {Object} attrs attributes
     * @param {Number} id id of the current handler
     * @param {Boolean|Undefined} value value of the disabled property
     */
    function setDisabled(attrs, id, value) {
      if (!value && unregisterPromise(attrs, id).length) {
        return;
      }

      attrs.$set(DISABLED, value, true);
    }

    /**
     * Handle disabled style.
     * Will attach the disabled style from get-go and remove it after the promise is resolved.
     *
     * @param {Promise} promise promise
     * @param {Object} attrs attributes
     * @param {Number} promiseId promise to handle
     */
    function handlePromise(promise, attrs, promiseId) {
      setDisabled(attrs, promiseId, true);

      // Wrap the promise and on each return case
      // since finally is reserved word we must use string notation to call the function
      promise['finally'](function() {
        setDisabled(attrs, promiseId);
      });
    }

    /**
     * Trigger the defined handler.
     *
     * @param {Object} scope scope of the element
     * @param {Object} attrs attributes
     * @param {Function} fn function to trigger
     */
    function triggerHandler(scope, attrs, fn) {
      var result = fn(scope, { $event : EVENT });

      // If the autodisable "keyword" is set and the result is a promise
      // then lets handle the disabled style
      if (hasAutodisable(attrs) && isPromise(result)) {
        handlePromise(result, attrs, registerPromise(attrs));
      }
    }

    /**
     * The link function for this directive.
     * Contains a prepended function that represents the ngClick handler.
     *
     * @param {Array} handlers array of click handler
     * @param {Object} scope scope
     * @param {Angular Element} element directive element
     * @param {Object} attrs attributes
     */
    function linkFn(handlers, scope, element, attrs) {

      // Remove the click handler and replace it with our new one
      // with this move we completely disable the original ngClick functionality
      element.unbind(EVENT).bind(EVENT, function() {
        // Make sure we run the $digest cycle
        scope.$apply(function() {
          handlers.forEach(triggerHandler.bind(null, scope, attrs));
        });
      });
    }

    return {
      restrict : 'A',
      priority : 100,
      compile  : function(el, attr) {
        var handlers = attr.ngClick.split(';').map($parse);
        return linkFn.bind(null, handlers);
      }
    };
  }]);

})(angular);
