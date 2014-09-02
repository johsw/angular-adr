'use strict';

/**
 * @ngdoc overview
 * @name adrApp
 * @description
 * # adrApp
 *
 * Main module of the application.
 */
angular
  .module('adrApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
