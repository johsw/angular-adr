'use strict';

/**
 * @ngdoc function
 * @name adrApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the adrApp
 */
angular.module('adrApp')
  .controller('MainCtrl', ['$scope', 'infAddressTypeahead', function ($scope, infAddressTypeahead) {

  }])
  .directive('infAddressField', ['infAddressTypeahead', function(infAddressTypeahead) {
    return {
      require: 'ngModel',
      link: function($scope, element, attr, ngModel) {
        $scope.$watch('address.address', function(val){
          var check = val.search(/[. ]*[0-9]+, [., ]*[1-9][0-9]{3} [\w ]+/);
          console.log(check);
          ngModel.$setValidity('formalAddress', check > 0);
        });
        
      }
    };
  }])
  .directive('infAddressForm', ['infAddressTypeahead', function(infAddressTypeahead) {
    return {
      templateUrl: 'views/address-form.html',
      link: function($scope, element, attr) {
        $scope.showSuggestions = false;
        $scope.currentIndex = -1;
        $scope.suggestions = [];
        $scope.address = {
          address: '',
          postalcode: '',
          selected: {},
        };
        
        
        // Update textfield accoding to choise
        $scope.selectTypeahead = function($event) {
          $scope.showSuggestions = false;
          $scope.address.address = $event.target.dataset.suggestion;
          $scope.address.selected = $scope.suggestions[$event.target.dataset.index].adresse;
          //$scope.address.selected = 
          // This somehow feels wrong
          element[0].querySelectorAll('#addresse-input')[0].focus()
          
        }
        // Update suggestions based on input
        $scope.updateTypeahead = function() {
          //If something's written...
          if ($scope.address.address.length > 0) {
            //If there's no number...
            if ($scope.address.address.search(/[0-9]/) <= 0) {
              infAddressTypeahead.lookupStreet($scope.address.address, $scope.address.postalcode).then(function(data){
                var suggestions = data.data.map(function(item) {
                  return {
                    tekst: item.tekst + ' '
                  };
                })
                
                $scope.suggestions = suggestions;
              });
            // If there is a number...
            } else {
              $scope.address.street = $scope.address.address.match(/[^0-9]*/)[0].trim();
              infAddressTypeahead.lookupNumber($scope.address.street, $scope.address.address, $scope.address.postalcode).then(function(data){
                var sorted = data.data.sort(function(a,b) {
                  return a.tekst.localeCompare(b.tekst);
                });
                $scope.suggestions = sorted;
              });
            }
            $scope.showSuggestions = true;
          // If nothing is written
          } else {
            $scope.showSuggestions = false;
          } 
        }
        $scope.hoverRow = function(index) {
          $scope.currentIndex = index;
        }
        element.on("keyup", function (event) {
          switch (event.which) {
            case 40: // DOWN
              if ($scope.suggestions && ($scope.currentIndex + 1) < $scope.suggestions.length) {
                $scope.currentIndex++;
                $scope.$apply();
                event.preventDefault;
                event.stopPropagation();
              }
              break;
            case 38: // UP
              if ($scope.currentIndex >= 1) {
                $scope.currentIndex --;
                $scope.$apply();
                event.preventDefault;
                event.stopPropagation();
              }
              break;
            case 13: // ENTER
              if ($scope.suggestions && $scope.currentIndex >= 0 && $scope.currentIndex < $scope.suggestions.length) {
                $scope.address.address = $scope.suggestions[$scope.currentIndex].tekst;
                $scope.address.selected = $scope.suggestions[$scope.currentIndex].adresse;
                $scope.showSuggestions = false;
                $scope.currentIndex = 0;
                $scope.$apply();
                event.preventDefault;
                event.stopPropagation();
              }

          } 
              /*
              } else {
                  $scope.results = [];
                  $scope.$apply();
                  event.preventDefault;
                  event.stopPropagation();
              }

          } else if (event.which == 27) {
              $scope.results = [];
              $scope.showDropdown = false;
              $scope.$apply();
          } else if (event.which == 8) {
              $scope.selectedObject = null;
              $scope.$apply();
          }*/
        });
      }
    };
  }])
  .factory('infAddressTypeahead', ['$http', function($http) {
    var lookup = {
      lookupStreet: function(streetParticle, postalCode) {
        return $http.get('http://dawa.aws.dk/vejnavne/autocomplete?postnr=' + postalCode + '&q=' + streetParticle);
      },
      lookupNumber: function(street, addressParticle, postalCode) {
        /* http://dawa.aws.dk/adresser/autocomplete?vejnavn=Rødkildevej&q=Rødkildevej 4 */
        return $http.get('http://dawa.aws.dk/adresser/autocomplete?postnr=' + postalCode + '&vejnavn=' + street + '&q=' + addressParticle);
      }/*,
      lookupPostal: function(postalCode) {
        return $http.get('http://dawa.aws.dk/postnumre/autocomplete?q=' + postalCode);
      }*/
    }
    return lookup;
  }]);
