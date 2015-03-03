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

    it('should throw if no ng-click is defined', function() {
      expect(function() {
        compile('<button ng-autodisable></button>');
      }).toThrow('ngAutodisable requires ngClick or ngSubmit attribute in order to work');
    });

    it('should only call the handler once', function() {
      $rootScope.clickHandler = jasmine.createSpy();
      var el = compile('<button ng-click="clickHandler()" ng-autodisable></button>');
      el.click();
      expect($rootScope.clickHandler.callCount).toBe(1);
    });

    it('should trigger $scope.$apply when calling the handler', function() {
      $rootScope.clickHandler = function() {
        $rootScope.data = 'hello';
      };
      var el = compile('<div><button ng-click="clickHandler()" ng-autodisable></button><span>{{ data }}</span></div>');
      el.find('button').click();
      expect(el.find('span').text()).toEqual('hello');
    });

    describe('multiple handlers', function() {
      it('should trigger both handlers', function() {
        $rootScope.firstHandler  = jasmine.createSpy();
        $rootScope.secondHandler = jasmine.createSpy();
        var el = compile('<button ng-click="firstHandler();secondHandler()" ng-autodisable></button>');
        el.click();
        expect($rootScope.firstHandler).toHaveBeenCalled();
        expect($rootScope.secondHandler).toHaveBeenCalled();
      });

      it('should trigger $scope.$apply when calling the handler', function() {
        $rootScope.firstHandler = function() {};
        $rootScope.secondHandler = function() {
          $rootScope.data = 'hello';
        };
        var el = compile('<div><button ng-click="firstHandler();secondHandler()" ng-autodisable></button><span>{{ data }}</span></div>');
        el.find('button').click();
        expect(el.find('span').text()).toEqual('hello');
      });

      it('should disable the button if atleast one ngClick handler returns $q promise', inject(function($q) {
        $rootScope.defaultHandler = function() {};
        $rootScope.promiseHandler = function() {
          var defer = $q.defer();
          return defer.promise;
        };
        var el = compile('<button ng-click="defaultHandler();promiseHandler()" ng-autodisable></button>');
        el.click();
        expect(el.attr('disabled')).toBeDefined();
      }));

      it('should not enable the button if the last promise resolves before others', inject(function($q) {
        var defer1 = $q.defer();
        var defer2 = $q.defer();
        $rootScope.firstHandler = function() {
          return defer1.promise;
        };
        $rootScope.secondHandler = function() {
          return defer2.promise;
        };
        var el = compile('<button ng-click="firstHandler();secondHandler()" ng-autodisable></button>');
        el.click();

        defer2.resolve();
        $rootScope.$apply();

        expect(el.attr('disabled')).toBeDefined();
      }));

      it('should not enable the button if the last promise resolves before others', inject(function($q) {
        var defer1 = $q.defer();
        var defer2 = $q.defer();
        $rootScope.firstHandler = function() {
          return defer1.promise;
        };
        $rootScope.secondHandler = function() {
          return defer2.promise;
        };
        var el = compile('<button ng-click="firstHandler();secondHandler()" ng-autodisable></button>');
        el.click();

        defer2.resolve();
        $rootScope.$apply();

        expect(el.attr('disabled')).toBeDefined();
      }));

      it('should enable the button if the all promises resolve', inject(function($q) {
        var defer1 = $q.defer();
        var defer2 = $q.defer();
        $rootScope.firstHandler = function() {
          return defer1.promise;
        };
        $rootScope.secondHandler = function() {
          return defer2.promise;
        };
        var el = compile('<button ng-click="firstHandler();secondHandler()" ng-autodisable></button>');
        el.click();

        defer2.resolve();
        $rootScope.$apply();

        defer1.resolve();
        $rootScope.$apply();
        expect(el.attr('disabled')).not.toBeDefined();
      }));
    });

    describe('loading class', function() {
      it('should add a class to the button if the promise is not resolved', inject(function($q) {
        $rootScope.clickHandler = function() {
          var defer = $q.defer();
          return defer.promise;
        };
        var el = compile('<button ng-click="clickHandler()" ng-autodisable-class="loading" ng-autodisable></button>');
        el.click();
        expect(el.hasClass('loading')).toBe(true);
      }));

      it('should add multiple class to the button if the promise is not resolved', inject(function($q) {
        $rootScope.clickHandler = function() {
          var defer = $q.defer();
          return defer.promise;
        };
        var el = compile('<button ng-click="clickHandler()" ng-autodisable-class="firstClass secondClass" ng-autodisable></button>');
        el.click();
        expect(el.hasClass('firstClass')).toBe(true);
        expect(el.hasClass('secondClass')).toBe(true);
      }));
    });

    describe('http promise', function() {
      it('should disable the button if ngClick returns HTTP promise', inject(function($http, $httpBackend) {
        $rootScope.clickHandler = function() {
          $httpBackend.expectGET('/').respond(200);
          return $http.get('/');
        };
        var el = compile('<button ng-click="clickHandler()" ng-autodisable></button>');
        el.click();
        expect(el.attr('disabled')).toBeDefined();
        $httpBackend.flush();
      }));

      it('should enable the button if ngClick returns HTTP promise resolves', inject(function($http, $httpBackend) {
        $rootScope.clickHandler = function() {
          $httpBackend.expectGET('/').respond(200);
          return $http.get('/');
        };
        var el = compile('<button ng-click="clickHandler()" ng-autodisable></button>');
        el.click();
        $httpBackend.flush();
        expect(el.attr('disabled')).not.toBeDefined();
      }));

      it('should enable the button if ngClick returns HTTP promise resolves with an error', inject(function($http, $httpBackend) {
        $rootScope.clickHandler = function() {
          $httpBackend.expectGET('/').respond(400);
          return $http.get('/');
        };
        var el = compile('<button ng-click="clickHandler()" ng-autodisable></button>');
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
        var el = compile('<button ng-click="clickHandler()" ng-autodisable></button>');
        el.click();
        expect(el.attr('disabled')).toBeDefined();
      }));

      it('should remove disabled after the promise is resolved with success', inject(function($q) {
        var defer = $q.defer();
        $rootScope.clickHandler = function() {
          return defer.promise;
        };
        var el = compile('<button ng-click="clickHandler()" ng-autodisable></button>');
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
        var el = compile('<button ng-click="clickHandler()" ng-autodisable></button>');
        el.click();
        defer.reject('resolved');
        $rootScope.$apply();
        expect(el.attr('disabled')).not.toBeDefined();
      }));

      it('should not disable the button if it does not return button promise', function() {
        $rootScope.clickHandler = function() { return true; };
        var el = compile('<button ng-click="clickHandler()" ng-autodisable></button>');
        el.click();
        expect(el.attr('disabled')).not.toBeDefined();
      });
    });
  });


});
