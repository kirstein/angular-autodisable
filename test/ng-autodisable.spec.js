/* global jasmine,describe,it,expect,beforeEach,inject */
describe('angular autodisable', function() {
  'use strict';

  it('should pass', function() {
    expect(true).toBe(true);
    expect(false).toBe(!true);
  });

  describe('directive', function() {
    var $compile, $rootScope;

    beforeEach(module('ngAutodisable'));

    beforeEach(inject(function(_$compile_, _$rootScope_) {
      $compile   = _$compile_;
      $rootScope = _$rootScope_;
    }));

    function compile(html) {
      var el = $compile(html)($rootScope);
      $rootScope.$apply();
      return el;
    }

    it('should only call the handler once', function() {
      $rootScope.clickHandler = jasmine.createSpy();
      var el = compile('<a ng-click="clickHandler()" ng-autodisable></a>');
      el.click();
      expect($rootScope.clickHandler.callCount).toBe(1);
    });

    describe('http promise', function() {
      it('should disable the button if ngClick returns HTTP promise', inject(function($http, $httpBackend) {
        $rootScope.clickHandler = function() {
          $httpBackend.expectGET('/').respond(200);
          return $http.get('/');
        };
        var el = compile('<a ng-click="clickHandler()" ng-autodisable></a>');
        el.click();
        expect(el.attr('disabled')).toBeDefined();
        $httpBackend.flush();
      }));

      it('should enable the button if ngClick returns HTTP promise resolves', inject(function($http, $httpBackend) {
        $rootScope.clickHandler = function() {
          $httpBackend.expectGET('/').respond(200);
          return $http.get('/');
        };
        var el = compile('<a ng-click="clickHandler()" ng-autodisable></a>');
        el.click();
        $httpBackend.flush();
        expect(el.attr('disabled')).not.toBeDefined();
      }));

      it('should enable the button if ngClick returns HTTP promise resolves with an error', inject(function($http, $httpBackend) {
        $rootScope.clickHandler = function() {
          $httpBackend.expectGET('/').respond(400);
          return $http.get('/');
        };
        var el = compile('<a ng-click="clickHandler()" ng-autodisable></a>');
        el.click();
        $httpBackend.flush();
        expect(el.attr('disabled')).not.toBeDefined();
      }));


    });

    describe('$q promise', function() {
      it('should disable the button if ngClick returns $q promise', inject(function($q) {
        $rootScope.clickHandler = function() {
          var defer = $q.defer();
          return defer.promise;
        };
        var el = compile('<a ng-click="clickHandler()" ng-autodisable></a>');
        el.click();
        expect(el.attr('disabled')).toBeDefined();
      }));

      it('should remove disabled after the promise is resolved with success', inject(function($q) {
        var defer = $q.defer();
        $rootScope.clickHandler = function() {
          return defer.promise;
        };
        var el = compile('<a ng-click="clickHandler()" ng-autodisable></a>');
        el.click();
        defer.resolve('resolved');
        $rootScope.$apply();
        expect(el.attr('disabled')).not.toBeDefined();
      }));

      it('should remove disabled after the promise is resolved with error', inject(function($q) {
        var defer = $q.defer();
        $rootScope.clickHandler = function() {
          return defer.promise;
        };
        var el = compile('<a ng-click="clickHandler()" ng-autodisable></a>');
        el.click();
        defer.reject('resolved');
        $rootScope.$apply();
        expect(el.attr('disabled')).not.toBeDefined();
      }));

      it('should not disable the button if it does not return a promise', function() {
        $rootScope.clickHandler = function() { return true; };
        var el = compile('<a ng-click="clickHandler()" ng-autodisable></a>');
        el.click();
        expect(el.attr('disabled')).not.toBeDefined();
      });
    });
  });
});
