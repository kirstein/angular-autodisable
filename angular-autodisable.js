/* 
 * angular-autodisable 0.2.0
 * http://github.com/kirstein/angular-autodisable
 * 
 * Licensed under the MIT license
 */
(function (angular) {
  'use strict';

  return angular.module('ngAutodisable', [])

  /**
   * Overwrites ngClick directive if the `ngClick` and `ngAutodisable` directives are both on the same element
   * then will evaluate the click response and check if its a promise or not
   * if it happens to be a promise then will set `disabled` as true for as long as the promise is fulfilled
   *
   * @throws error if the `ngAutodisable` is on the element without the `ngClick` directive.
   */
  .directive('ngAutodisable', [ '$parse', function($parse) {

    var DISABLED = 'disabled',      // Disabled attribute
        ATTRNAME = 'ngAutodisable', // The attribute name to which we store the handlers ids
        CLICK_EVENT = 'click',
        CLICK_ATTR = 'ngClick',
        SUBMIT_EVENT = 'submit',
        SUBMIT_ATTR = 'ngSubmit',
        LOADING_CLASS_ATTR = 'ngAutodisableClass';

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
     * Trigger the defined handler.
     *
     * @param {Object} scope scope of the element
     * @param {Object} attrs attributes
     * @param {Function} fn function to trigger
     */
    function triggerHandler(handler, scope, fn) {
      var result = fn(scope, { $event : handler.eventName });

      // If the function result happens to be a promise
      // then handle the `disabled` state of the element.
      // registers the result handler as an attribute
      if (isPromise(result)) {
        handler.handlePromise(result);
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
    function linkFn(scope, element, attrs) {
      var handler;

      if (attrs.hasOwnProperty(CLICK_ATTR)) {
          handler = handlerInstance(element,
              CLICK_EVENT,
              getLoadingClass(attrs),
              getCallbacks(attrs[CLICK_ATTR]));
      } else if (attrs.hasOwnProperty(SUBMIT_ATTR)) {
          handler = handlerInstance(element.find('button[type=submit]'),
              SUBMIT_EVENT,
              getLoadingClass(attrs),
              getCallbacks(attrs[SUBMIT_ATTR]));
      } else {
          throw new Error('ngAutodisable requires ngClick or ngSubmit attribute in order to work');
      }
        
      // Remove the click handler and replace it with our new one
      // with this move we completely disable the original ngClick functionality
      element.unbind(handler.eventName).bind(handler.eventName, function() {
        // Make sure we run the $digest cycle
        scope.$apply(function() {
          handler.callbacks.forEach(triggerHandler.bind(null, handler, scope));
        });
      });
    }

    function getCallbacks(expression) {
      return expression.split(';').map(function(callback) {
            return $parse(callback, /* interceptorFn */ null, /* expensiveChecks */ true);
          });
    }

    function getLoadingClass(attrs) {
      return attrs.hasOwnProperty(LOADING_CLASS_ATTR) ? attrs[LOADING_CLASS_ATTR] : false;
    }


    /**
     * Returns a new instance that can handle the promises returned by the callbacks.
     * It will disable the given element when the first promise is triggered. And will
     * re-enable the element, when the last promise is finished.
     *
     * @param  {Element} elementToDisable     DOM element that should be enabled and disabled.
     * @param  {String} eventName             Name of the event ('click' or 'submit')
     * @param  {String|Boolean} loadingClass  Class(es) to toggle to the element or false not disired.
     * @param  {Array} callbacks              Array of callback functions to trigger.
     * @return {Object}                       Object that handles the promises.
     */
    function handlerInstance(elementToDisable, eventName, loadingClass, callbacks) {
      var instance = {},
          promisesTriggered = 0;

      instance.eventName = eventName;
      instance.callbacks = callbacks;

      /**
       * This should be called everytime a callback returns a promise.
       *
       * Disables the element for the first promise. And re-enables it when
       * the last promise is done.
       *
       * @param  {Promise} promise promise returned by a callback.
       */
      instance.handlePromise = function(promise) {
        if (promisesTriggered === 0) {
          disableElement();
        }
        promisesTriggered++;

        promise['finally'](function() {
          promiseDone();
        });
      };

      /**
       * This is called every time a promise is done.
       *
       * Re-enables the element when the last promise is done.
       */
      function promiseDone() {
        promisesTriggered--;
        if (promisesTriggered === 0) {
          enableElement();
        }
      }

      /**
       * Disables the element. It can also add the classes listed by
       * loadingClass.
       */
      function disableElement() {
        elementToDisable.attr(DISABLED, true);
        if (loadingClass) {
          elementToDisable.addClass(loadingClass);
        }
      }

      /**
       * Enables the element. It can also remove the classes listed by
       * loadingClass.
       */
      function enableElement() {
        elementToDisable.attr(DISABLED, false);
        if (loadingClass) {
          elementToDisable.removeClass(loadingClass);
        }
      }

      return instance;
    }

    return {
      restrict : 'A',
      link  : linkFn
    };
  }]);

})(angular);
