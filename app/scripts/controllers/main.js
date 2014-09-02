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
          if (!angular.isUndefined(val) && val.length > 0) {
            var check = val.search(/^\D+[\D ]*?[0-9]+[a-zA-ZæøåÆØÅ]*,\s*([\w\.]* [\w\.]*, ){0,1}[0-9]{4} [\D ]+$/);
            ngModel.$setValidity('formalAddress', check > -1);
          }
        });
      }
    };
  }])
  .directive('infAddressForm', ['infAddressTypeahead', function(infAddressTypeahead) {
    return {
      templateUrl: 'views/address-form.html',
      link: function($scope, element, attr) {
        $scope.showSuggestions = false;
        $scope.showModal = false;
        $scope.currentIndex = -1;
        $scope.suggestions = [];
        $scope.address = {
          address: '',
          postalcode: '',
          selected: {},
        };

        // Update textfield accoding to choice
        $scope.validateAddress = function() {
          // If no address has been selected
          if (angular.isUndefined($scope.address.selected)) {
            infAddressTypeahead.lookupAutocompleteValidate($scope.address.address).then(function(data){
               var sorted = data.data.sort(function(a,b) {
                 return a.tekst.localeCompare(b.tekst);
               });
               $scope.suggestions = sorted;
               $scope.showModal = true;
            });
          }
        }

        // Update textfield accoding to choice
        $scope.selectTypeahead = function($event) {
          console.log($event.currentTarget.id);
          $scope.showSuggestions = false;
          $scope.showModal = false;
          $scope.address.address = $event.target.dataset.suggestion;
          $scope.address.selected = $scope.suggestions[$event.target.dataset.index].adresse;
          //$scope.address.selected =
          // This somehow feels wrong
          element[0].querySelectorAll('#addresse-input')[0].focus()
        }
        // Update suggestions based on input
        $scope.updateTypeahead = function() {
          //If something's written...
          if (!angular.isUndefined($scope.address.address) && $scope.address.address.length > 0) {
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
            case 27: // ENTER
              $scope.address.selected = {};
              $scope.showSuggestions = false;
              $scope.$apply();
              event.preventDefault;
              event.stopPropagation();
              break;
          }
        });
      }
    };
  }])
  .directive('infAddressModal', function() {
      return {
          link: function($scope, element, attrs) {
              $scope.$watch('showModal', function(value) {
                  if (value) {
                    $scope.showSuggestions = false;
                    element.modal('show');
                  }
                  else { 
                    element.modal('hide');
                  }
              });
          }
      };
  })
  .factory('infAddressTypeahead', ['$http', function($http) {
    var lookup = {
      lookupStreet: function(streetParticle, postalCode) {
        return $http.get('http://dawa.aws.dk/vejnavne/autocomplete?postnr=' + postalCode + '&q=' + streetParticle);
      },
      lookupNumber: function(street, addressParticle, postalCode) {
        return $http.get('http://dawa.aws.dk/adresser/autocomplete?postnr=' + postalCode + '&vejnavn=' + street + '&q=' + addressParticle);
      },
      lookupAutocompleteValidate: function(addressParticle) {
        return $http.get('http://dawa.aws.dk/adresser/autocomplete?q=' + addressParticle);
      }
    }
    return lookup;
  }]);
