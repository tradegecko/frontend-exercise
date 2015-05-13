(function () {
  var app = angular.module('githubSearchApp', []);

  app.controller('mainController', function ($http, $scope) {
    $scope.search = function () {
      if ($scope.q && $scope.q.length >= 3) {
        $scope.searching = true;
        $http.get('https://api.github.com/legacy/repos/search/' + $scope.q)
          .success(function (data, status, headers, config) {
            $scope.searching = false;
            $scope.repositories = data.repositories;
          })
          .error(function (data, status, headers, config) {
            $scope.searching = false;
            $scope.repositories = null;
          });
      }
      else {
        $scope.searching = false;
        $scope.repositories = null;
      }
    };
  });
})();