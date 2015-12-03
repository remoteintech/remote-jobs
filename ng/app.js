'use strict';

var app = angular.module('remote-jobs', ['yaru22.md']);

app.controller('menuController', function ($scope, $http, $filter) {

    $scope.search = {};


    $http.get('https://rawgit.com/jessicard/remote-jobs/master/README.md').then(function (data) {
        var dataSection = false;
        var res = [];
        var preData = data.data.split("\n");
        preData.forEach(function (entry) {
            if (dataSection) {
                var e = entry.split('|');

                var rName = e[0];
                var cName = rName;

                var mdRef = null;
                if (rName.indexOf('[') != -1) {
                    cName = rName.split('[')[1].split(']')[0];

                    mdRef = cName;

                    if (rName.indexOf('(') != -1) {
                        mdRef = rName.split('(')[1].split(')')[0];
                    }

                }
                res.push({ company: cName, mdRef: mdRef, url: e[1], place: e[2] });
            }
            else
                if (entry.indexOf('---') != -1) dataSection = true;
        });
        $scope.data = res;
    }, function (data) {
        //Failed to load: Decide what to do later.
    });

    $scope.loadMd = function (ref) {
        $http.get('https://rawgit.com/jessicard/remote-jobs/' + ref.mdRef )
            .then(function (data) { $scope.mdContent = data.data }, function (data) { $scope.mdContent = data });

    }
});
