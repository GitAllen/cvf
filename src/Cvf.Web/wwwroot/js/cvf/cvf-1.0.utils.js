(function ($, global, cvf) {

    Date.fromJSON = function (json) {
        if (json != null) {
            if (json.indexOf('Date') > -1) {
                var lud = new Date(parseInt(json.substr(6)));//utc time but with local time zone.
                var ld = new Date(); ld.getTimezoneOffset();
                return new Date(lud.getTime() - ld.getTimezoneOffset() * 60000);
            } else {
                return new Date(json);
            }
        }
    };

    Date.formatJSON = function (json, fmt) {
        if (!json) {
            return "N/A";
        } else {
            var d = Date.fromJSON(json), now = new Date();
            var formatStr = fmt;
            if (!formatStr || typeof (formatStr) != 'string') {
                formatStr = 'hh:mm:ss';
                if (d.toDateString() != now.toDateString()) {
                    formatStr = 'MM/dd/yyyy HH:mm:ss';
                }
            }
            return d.format(formatStr);
        }
    };
    Date.prototype.format = function (fmt) {
        var o = {
            "M+": this.getMonth() + 1,
            "d+": this.getDate(),
            "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
            "H+": this.getHours(),
            "m+": this.getMinutes(),
            "s+": this.getSeconds(),
            "q+": Math.floor((this.getMonth() + 3) / 3),
            "S": this.getMilliseconds()
        };
        var week = {
            "0": "\u65e5",
            "1": "\u4e00",
            "2": "\u4e8c",
            "3": "\u4e09",
            "4": "\u56db",
            "5": "\u4e94",
            "6": "\u516d"
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        if (/(E+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    };

    Math.o_round = Math.round;
    Math.round = function (num, decimals) {
        if (!decimals || decimals < 0) {
            return Math.o_round(num);
        }
        var p = Math.pow(10, decimals);
        return Math.o_round(num * p) / p;
    };

    cvf.common = cvf.common || {};
    $.extend(cvf.common, {
        getSize: function (size, orgUnit, targetUnit, dif) {
            if (!orgUnit) {
                orgUnit = "B";
            }
            if (!targetUnit) {
                targetUnit = "Auto";
            }
            if (dif) {
                size += dif;
            }
            var units = ["B", "KB", "MB", "GB", "TB", "PB"];
            var idx = -1;
            for (idx = 0; idx < units.length; idx++) {
                if (units[idx].toLowerCase() == orgUnit.toLowerCase()) {
                    break;
                }
            }
            var dsize = size;
            targetUnit = targetUnit.toLowerCase();
            while (idx < units.length) {
                unit = units[idx];
                idx++;
                if (targetUnit != "auto" && unit.toLowerCase() == targetUnit) {
                    break;
                }
                if (targetUnit == "auto" && dsize < 1024) {
                    break;
                }
                dsize = dsize / 1024;
            }
            unit = units[idx - 1];
            return { value: Math.round(dsize, 2), unit: unit };
        },
        getSizeStr: function (size, orgUnit, targetUnit, dif) {
            var v = this.getSize(size, orgUnit, targetUnit, dif);
            if (v) {
                return v.value + v.unit;
            }
            return null;
        }, random: function (s, e) {
            return parseInt((Math.random() * (e - s) + s));
        },
        getRandomColor: function () {
            var letters = '0123456789ABCDEF'.split('');
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.round(Math.random() * 15)];
            }
            return color;
        },
        numberFormatter: function (v) {
            var f = parseFloat(v);
            if (isNaN(f)) {
                return 'N/A';
            }
            return Math.round(f, 2);
        },
        datetimeFormatter: function (v) {
            if (!v) {
                return 'N/A';
            }
            return Date.fromJSON(v).format('MM/dd/yyyy hh:mm');
        },
        dateFormatter: function (v) {
            if (!v) {
                return "N/A";
            }
            return Date.fromJSON(v).format('MM/dd/yyyy');
        },
        max: function (a, b) {
            return a > b ? a : b;
        },
        min: function (a, b) {
            return a > b ? b : a;
        }, wrapeUrl: function (url) {
            if (url) {
                return '<a target="_blank" href="' + url + '">' + url + '</a>';
            }
            return '';
        },
        setReadonlyProperty: function (obj, propName, value) {
            Object.defineProperty(obj, propName, { value: value, writable: false, configurable: false });
        },
        setReadonlyProperties: function (obj, props) {
            for (var n in props) {
                cvf.common.setReadonlyProperty(obj, n, props[n]);
            }
        },
        //daterangepicker offers only 15-minute or 30-minute increments
        //here i choose 15
        normalize: function (time) {
            var t = time.clone();
            t._d.setSeconds(0);
            var m = t._d.getMinutes();
            if (m >= 45) {
                t._d.setMinutes(45);
            } else if (m >= 30) {
                t._d.setMinutes(30);
            } else if (m >= 15) {
                t._d.setMinutes(15);
            } else {
                t._d.setMinutes(0);
            }
            return t;
        }
    });

    if (typeof (ko) != 'undefined') {
        ko.bindingHandlers.donut = {
            init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

            },
            update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                var value = valueAccessor();
                var valueUnwrapped = ko.unwrap(value);
                var bindings = allBindings();
                var lfield = bindings.donutLabel, vfield = bindings.donutValue;
                if (lfield) {
                    $.each(valueUnwrapped, function () {
                        if (!this.hasOwnProperty('value')) {
                            this.value = this[vfield];
                        }
                    });
                }
                if (vfield) {
                    $.each(valueUnwrapped, function () {
                        if (!this.hasOwnProperty('label')) {
                            this.label = this[lfield];
                        }
                    });
                }
                Morris.Donut({
                    element: element,
                    data: valueUnwrapped
                });
            }
        }
    }

    if (typeof (angular) != 'undefined') {
        var morris = angular.module("cvfMorris", [])
            .controller('mainCtrl', function ($scope, $attrs) {
                console.log("attrs:", $attrs);
            });
        morris.directive('cvfDonut', function () {
            return {
                restrict: 'EA',
                replace: true,
                template: '<div></div>',
                scope: {
                    data: "=data",
                    label: "@label",
                    value: "@value",
                    colors: '=colors'
                },
                link: function (scope, element, attrs) {
                    scope.$watch('data', function (newVal, oldVal) {
                        var values = scope.data;
                        var datas = [];
                        if ($.isArray(values)) {
                            $.each(values, function () {
                                datas.push({ value: Math.round(this[scope.value], 2), label: this[scope.label] });
                            });
                        }
                        if (datas.length > 0) {
                            var colors = scope.colors || Morris.Donut.prototype.defaults.colors;
                            Morris.Donut({
                                element: element,
                                data: datas,
                                colors: colors,
                            });
                        } else {
                            element.empty();
                        }
                    })
                }
            }
        });

        morris.directive('cvfArea', function () {
            return {
                restrict: 'EA',
                replace: true,
                template: '<div></div>',
                scope: {
                    data: "=data",
                    xkey: "@xkey",
                    ykeys: "@ykeys",
                    labels: "@labels",
                    colors: '=colors'
                },
                link: function (scope, element, attrs) {
                    scope.$watch('data', function (newVal, oldVal) {
                        var ykeys = scope.ykeys.split(',');
                        var labels = scope.labels.split(',');
                        if (scope.data && scope.data.length > 0) {
                            var colors = scope.colors || Morris.Area.prototype.defaults.lineColors;
                            Morris.Area({
                                element: element,
                                data: scope.data,
                                lineColors: colors,
                                xkey: scope.xkey,
                                ykeys: ykeys,
                                labels: labels
                            });
                        } else {
                            element.empty();
                        }
                    })
                }
            }
        });

        morris.directive('cvfHistory', function () {
            var colors = ["#0b62a4", "#7A92A3", "#4da74d", "#afd8f8", "#edc240", "#cb4b4b", "#9440ed", "#1d953f", "#56452d"];
            return {
                restrict: 'EA',
                replace: true,
                template: '<div><div history-chart style="height:350px;"></div><div history-data>' +
                    '<table class="table"><thead><tr>' +
                        '<th>Name</th>' +
                        '<th>Source</th>' +
                        '<th>Max</th>' +
                        '<th>Min</th>' +
                        '<th>Avg</th>' +
                    '</tr></thead><tbody>' +
                       '<tr ng-repeat="raw in Raws">' +
                       '    <td class="cursor-pointer donut-color-mark" ng-click="toggleLine(raw)" ng-style="{\'border-left-color\':raw.Display?raw.Color:\'#CCC\'}">{{raw.Name}}</td>' +
                       '    <td>{{raw.Source}}</td>' +
                       '    <td>{{raw.Max}}</td>' +
                       '    <td>{{raw.Min}}</td>' +
                       '    <td>{{raw.Avg}}</td>' +
                       '</tr>' +
                    '</tbody></table>' +
                    '</div></div>',
                scope: {
                    data: "=data"
                },
                link: function (scope, element, attrs) {
                    var defaultShowLines = 5;
                    function processData(data) {
                        var raws = [], chartRaws = [];
                        data = data || [];
                        $.each(data, function (idx) {
                            var t = this, min = null, max = null, total = 0, count = 0, avg = null;
                            var key = t.Name + '(' + t.Source + ')';
                            var _min = function (a, b) {
                                return a === null ?
                                    b : b === null ?
                                    a : a > b ? b : a;
                            }
                            var _max = function (a, b) {
                                return a === null ?
                                    b : b === null ?
                                    a : a > b ? a : b;
                            }
                            $.each(t.Raws, function (idx) {
                                var c = chartRaws[idx];
                                if (!c) {
                                    var c = chartRaws[idx] = {};
                                    c.Date = Date.fromJSON(this.Date).format('yyyy-MM-dd HH:mm');
                                }
                                var v = this.Value;
                                c[key] = v;
                                max = _max(max, v);
                                min = _min(min, v);
                                if (v !== null) {
                                    count++;
                                    total += v;
                                }
                            });
                            if (count !== 0)
                                avg = Math.round(total / count, 3);
                            raws.push({
                                Name: t.Name,
                                Key: key,
                                Source: t.Source,
                                Max: max === null ? '--' : max,
                                Min: min === null ? '--' : min,
                                Avg: avg === null ? '--' : avg,
                                Raws: t.Raws,
                                Color: colors[idx % colors.length],
                                Display: idx < defaultShowLines
                            });
                        });
                        return { Raws: raws, ChartRaws: chartRaws };
                    }

                    function toggleLine(raw) {
                        raw.Display = !raw.Display;
                        showChart();
                    }
                    function showChart() {
                        var ykeys = [], colors = [];
                        $.each(scope.Raws, function () {
                            if (this.Display) {
                                ykeys.push(this.Key);
                                colors.push(this.Color);
                            }
                        });
                        var ele = element.find('[history-chart]').empty();
                        if (scope.ChartRaws.length > 0) {
                            Morris.Line({
                                element: ele,
                                data: scope.ChartRaws,
                                lineColors: colors,
                                xkey: 'Date',
                                ykeys: ykeys,
                                labels: ykeys,
                                ymax: 45,
                                ymin: -45
                            });
                        }
                    }
                    scope.toggleLine = toggleLine;
                    scope.$watch('data', function (newVal, oldVal) {
                        var template = processData(scope.data);
                        scope.Raws = template.Raws;// processData(scope.data);
                        scope.ChartRaws = template.ChartRaws;
                        showChart();
                    }, true);
                }
            }
        })
    }

})(jQuery, window, cvf);