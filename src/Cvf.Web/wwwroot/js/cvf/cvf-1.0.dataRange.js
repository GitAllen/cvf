(function ($, cvf, global) {

    var defaultOptions = {};

    cvf.controls.extend("dateRange", {
        init: function (element, options) {
            var t = this;
            if (!(element instanceof $)) {
                element = $(element);
            }
            element.empty();
            options = $.extend({}, defaultOptions, options);
            element.addClass('select-box cursor-pointer');
            element.append('<i class="fa fa-calendar"></i> <span></span> <b class="caret"></b>');
            //var end = options.end || moment(),
            //    start = options.start || moment().startOf('month');
            //element.find('span').html(start.format('YYYY/MM/DD h:mm A') + ' - ' + end.format('YYYY/MM/DD h:mm A'));

            var now = cvf.common.normalize(moment().startOf('minutes'));
            var todayZero = moment().startOf('day');
            var monthZero = moment().startOf('month');

            var lastMonth = moment().subtract(1, 'month');
            var ranges = {
                    'Today': [todayZero, now],
                    'Last 24 Hours': [now.clone().subtract(1, 'days'), now],
                    'Yesterday': [todayZero.clone().subtract(1,'days'), todayZero],
                    'Last 7 Days': [now.clone().subtract(7, 'days'), now],
                    'Last 30 Days': [now.clone().subtract(30, 'days'), now],
                    'This Month': [monthZero, now.clone()],
                    'Last Month': [monthZero.clone().subtract(1, 'months'), monthZero]
                };
            var end, start;
            //i: how many monthes (from last to before) will be shown in the list
            for (var i = 0; i < 4; i++) {
                var s = lastMonth.clone().subtract(i, 'months').startOf('month');
                var e = s.clone().endOf('month');
                if (i === 0) {
                    end = e;
                    start = s;
                }
                var p = e.format('YYYY/MM');
                ranges[p] = [s,e];
            }

            element.find('span').html(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));

            element.daterangepicker(
            {
                timePicker: false,
                //timePickerIncrement: 15,
                //ranges: {
                //    'Today': [todayZero, now],
                //    'Last 24 Hours': [now.clone().subtract(1, 'days'), now],
                //    'Yesterday': [todayZero.clone().subtract(1,'days'), todayZero],
                //    'Last 7 Days': [now.clone().subtract(7, 'days'), now],
                //    'Last 30 Days': [now.clone().subtract(30, 'days'), now],
                //    'This Month': [monthZero, now.clone()],
                //    'Last Month': [monthZero.clone().subtract(1, 'months'), monthZero]
                //},
                ranges: ranges,
                opens: 'left',
                format: 'YYYY/MM/DD',
                startDate: moment("2016/02/01", "YYYY/MM/DD"),
                endDate: moment("2016/02/29", "YYYY/MM/DD")
            },
            function (start, end, label) {
                //$('span', this.element).html(start.format('YYYY/MM/DD h:mm A') + ' - ' + end.format('YYYY/MM/DD h:mm A'));
                $('span', this.element).html(start.format('YYYY/MM/DD') + ' - ' + end.format('YYYY/MM/DD'));
                if (options.onChange) {
                    options.onChange.call(t, start, end, label);
                }
            });
            if (options.onLoad) {
                options.onLoad.call(t, start, end);
            }
            return t;
        }
    });

    if (typeof (angular) != 'undefined') {
        angular.module('cvfDateRange', [])
            .controller('mainCtrl', function AppCtrl($scope) {
            }).directive('cvfDateRange', function () {
                return {
                    restrict: 'EA',
                    replace: true,
                    template: '<div class="pull-right cursor-pointer"></div>',
                    link: function ($scope, element, attrs) {
                        var options = {};
                        options.start = $scope.start;
                        options.end = $scope.end;
                        options.onChange = $scope.onDateRangeChange;
                        options.onLoad = $scope.onDateRangeLoad;
                        cvf.controls.dateRange(element, options);
                    }
                };
            });
    }
})($, cvf, window);