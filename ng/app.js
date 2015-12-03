'use strict';

var app = angular.module('remote-jobs', ['yaru22.md']);

app
    .filter('globalSearch', function () {
        return function (sourceCol, parm) {

            if (!parm) return sourceCol;

            parm = parm.trim().toLowerCase();

            var out = [];

            sourceCol.forEach(function (i) {
                if (angular.toJson(i).toLowerCase().indexOf(parm) != -1) {
                    out.push(i);
                }
            });

            return out;
        }
    });

app.controller('menuController', function ($scope, $http, $filter) {

    var baseUrl = 'https://rawgit.com/jessicard/remote-jobs/master';

    $scope.search = {};

    $http.get(baseUrl + '/README.md').then(function (data) {
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

                        if (mdRef.charAt(0) != '/')
                            mdRef = '/' + mdRef;

                    }
                }
                res.push({ company: cName, mdRef: mdRef, url: e[1], place: e[2] });
            }
            else
                if (entry.indexOf('---') != -1) dataSection = true;
        });
        $scope.data = res;

        $scope.data.forEach(function (i) {

            if (i.mdRef != null) {
                $http.get(baseUrl + i.mdRef)
                    .then(function (data) { i.md = data.data }, function (data) { i.md = '(Error loading markdown definition.)' });
            }
        });

    }, function (data) {
        //Failed to load: Decide what to do later.
    });

    $scope.select = function (ref) {
        $scope.selected = ref;
    }
});
