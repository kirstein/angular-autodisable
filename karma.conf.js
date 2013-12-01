module.exports = function (config) {
  'use strict';
  config.set({
    frameworks : [ 'jasmine' ],
    files : [
      'components/jquery/jquery.js',
      'components/angular/angular.js',
      'components/angular-mocks/angular-mocks.js',

      // The phantomJs does not support bind. Hence we inclde a shim
      'components/es5-shim/es5-shim.js',

      // The library itself
      'src/*.js',

      'test/**.spec.js'
    ],

    colors    : true,
    singleRun : true,
    autoWatch : false,
    browsers  : ['PhantomJS'],
    reporters : ['progress', 'growl'],
  });
};
