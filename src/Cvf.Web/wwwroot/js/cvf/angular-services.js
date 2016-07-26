var serviceModule = angular.module('services', [])
                           .config(function ($httpProvider) {
                               $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
                               var param = function (obj) {
                                   var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

                                   for (name in obj) {
                                       value = obj[name];

                                       if (value instanceof Array) {
                                           for (i = 0; i < value.length; ++i) {
                                               subValue = value[i];
                                               fullSubName = name + '[' + i + ']';
                                               innerObj = {};
                                               innerObj[fullSubName] = subValue;
                                               query += param(innerObj) + '&';
                                           }
                                       }
                                       else if (value instanceof Object) {
                                           for (subName in value) {
                                               subValue = value[subName];
                                               fullSubName = name + '[' + subName + ']';
                                               innerObj = {};
                                               innerObj[fullSubName] = subValue;
                                               query += param(innerObj) + '&';
                                           }
                                       }
                                       else if (value !== undefined && value !== null)
                                           query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
                                   }

                                   return query.length ? query.substr(0, query.length - 1) : query;
                               };
                               $httpProvider.defaults.transformRequest = [function (data) {
                                   return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
                               }];
                           });
serviceModule.constant('routePrefix', {
    car: '/api/car/'
});
serviceModule.service('routeService', ['routePrefix', function (prefix) {
    var self = this;
    var serverUrl = window.location.href.indexOf('http://localhost') == -1 ? "http://qorosservicefabric.eastasia.cloudapp.azure.com:81" : "http://localhost:8125";
    self.car = {
        getCars: function () { return serverUrl + prefix.car; },
        getCarMessage: function (id) { return serverUrl + prefix.car + id; }
    };
    return self;
}]);
serviceModule.service('iotService', ['$http', 'routeService', function (http, route) {
    var self = this;
    this.car = {
        getCars: function () { return http.get(route.car.getCars()); },
        getCarMessage: function (id) { return http.get(route.car.getCarMessage(id)); }
    };
    return self;
}]);