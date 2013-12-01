/* global describe,it,expect,inject,beforeEach */
describe('ngClick', function() {
  'use strict';
  var element;

  beforeEach(module('ngAutodisable'));

  it('should get called on a click', inject(function($rootScope, $compile) {
    element = $compile('<div ng-click="clicked = true"></div>')($rootScope);
    $rootScope.$digest();
    expect($rootScope.clicked).toBeFalsy();

    element.click();
    expect($rootScope.clicked).toEqual(true);
  }));

  it('should pass event object', inject(function($rootScope, $compile) {
    element = $compile('<div ng-click="event = $event"></div>')($rootScope);
    $rootScope.$digest();

    element.click();
    expect($rootScope.event).toBeDefined();
  }));

  it('should get called on a click if ngAutodisable is on', inject(function($rootScope, $compile) {
    element = $compile('<div ng-click="clicked = true" ng-autodisable></div>')($rootScope);
    $rootScope.$digest();
    expect($rootScope.clicked).toBeFalsy();

    element.click();
    expect($rootScope.clicked).toEqual(true);
  }));

  it('should pass event object if ngAutodisable is on', inject(function($rootScope, $compile) {
    element = $compile('<div ng-click="event = $event" ng-autodisable></div>')($rootScope);
    $rootScope.$digest();

    element.click();
    expect($rootScope.event).toBeDefined();
  }));
});
