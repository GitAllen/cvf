(function ($, global) {
    var cvf = window.cvf = {};

    cvf.content = $('.cvf-content'),
    cvf.panorama = $('.cvf-content-panorama');
    cvf.body = $('.cvf-content-body');
    cvf.home = $('.cvf-content-home');

    $.extend(cvf, {
        render: function (html, content) {
            var re = /<%(.+?)%>/g, reExp = /(^( )?(if|for|else|switch|case|break|var|{|}))(.*)?/g, code = 'var r=[];\n', cursor = 0;
            if (content) {
                for (var n in content) {
                    code += 'var ' + n + '= this["' + n + '"];\n';
                }
            }
            var add = function (line, js) {
                js ? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
                    (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
                return add;
            }
            while (match = re.exec(html)) {
                add(html.slice(cursor, match.index))(match[1], true);
                cursor = match.index + match[0].length;
            }
            add(html.substr(cursor, html.length - cursor));
            code += 'return r.join("");';
            return new Function('', code.replace(/[\r\t\n]/g, '')).apply(content);
        },
        load: function (element, url, options, success) {
            if (!success && options) {
                success = options.success;
            }
            if (!(element instanceof $)) {
                element = $(element);
            }
            $.get(url, function (html) {
                element.empty().html(cvf.render(html, options));
                if (success) {
                    success(element, options);
                }
            })
        }, append: function (element) {
            element.appendTo(cvf.body);
        }, remove: function (element) {
            element.element.remove();
        }, clear: function () {
            cvf.body.empty();
        }, open: function (element) {
            this.clear();
            this.append(element);
        }, progress: function (element) {
            element.find('.cvf-panel').addClass('cvf-loading');
        }, unprogress: function (element) {
            element.find('.cvf-panel').removeClass('cvf-loading');
        }, guid: {
            'new': function () {
                var s4 = function () { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); };
                return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
            },
            test: function (v) {
                return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(v);
            },
            empty: '00000000-0000-0000-0000-000000000000'
        }
    });

    cvf.controls = {
        extend: function (name, prototype) {
            var cons = function (element, options) {
                var t = new cons.prototype.init(element, options);
                t.element = t.element || element;
                t.options = t.options || options;
                return t;
            }
            cons.prototype = prototype;
            cons.prototype.init.prototype = cons.prototype;
            cons.prototype.constructor = cons;

            cvf.controls[name] = cons;
        }
    }
})(jQuery, window);
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
(function ($, cvf, global) {
    cvf.extensions = cvf.extensions || {};

    function loadExtensionJs(ext) {
        $.each(ext.scripts, function () {
            var jsUrl = this.src.replace('~', ext.baseUri);
            var extJs = document.createElement("script");
            extJs.src = jsUrl;
            document.body.appendChild(extJs);
        });
    }

    function loadExtensionStylesheets(ext) {
        // <link href="/Content/bootstrap.css" rel="stylesheet">
        $.each(ext.stylesheets, function () {
            var cssUrl = this.src.replace('~', ext.baseUri);
            var cssLink = document.createElement('link');
            cssLink.href = cssUrl;
            cssLink.rel = "stylesheet";
            document.body.appendChild(cssLink);
        });
    }

    function getSrc(baseUri, src) {
        return src ? src.replace('~', baseUri) : '';
    }

    function extension(name, baseUri, scripts, stylesheets, templates) {
        var t = this;
        t.name = name;
        t.baseUri = baseUri;
        t.scripts = [];
        if (!$.isArray(scripts)) {
            scripts = [scripts];
        }
        $.each(scripts || [], function () {
            if (this.src) {
                t.scripts.push(getSrc(baseUri, this.src));
            }
        });
        t.stylesheets = [];
        if (!$.isArray(stylesheets)) {
            stylesheets = [stylesheets];
        }
        $.each(stylesheets || [], function () {
            if (this.src) {
                t.stylesheets.push(getSrc(baseUri, this.src));
            }
        });
        t.templates = {};
        if (!$.isArray(templates)) {
            templates = [templates];
        }
        $.each(templates || [], function () {
            t.templates[this.name] = getSrc(baseUri, this.src);
        });
        return t;
    };
    extension.prototype = {
        load: function () {
            $.each(this.scripts, function () {
                var extJs = document.createElement("script");
                extJs.src = this.valueOf();
                extJs.async = false;
                document.body.appendChild(extJs);
            });
            $.each(this.stylesheets, function () {
                var cssLink = document.createElement('link');
                cssLink.href = this.valueOf();
                cssLink.rel = "stylesheet";
                document.body.appendChild(cssLink);
            });
        }
    }

    cvf.extensions.register = function (name) {
        if ($.isArray(name)) {
            $.each(name, function () {
                cvf.extensions.register(this.valueOf());
            });
        } else {
            var manifestUrl = '/Extensions/' + name + '/' + name + 'Extension.Manifest.xml';
            $.ajax({
                url: manifestUrl,
                dataType: 'xml',
                success: function (xml) {
                    var ext = $.xml2json(xml).extension;
                    var exp = new extension(ext.name, ext.baseUri || '', ext.scripts.script, ext.stylesheets.stylesheet, ext.templates.template);
                    cvf.extensions[exp.name] = exp;
                    exp.load();
                },
                async: false
            });
        }
    }
})(jQuery, cvf, window);
(function ($, cvf, global) {
    cvf.controls = cvf.controls || {};

    //reference to http://bl.ocks.org/tomerd/1499279

    var colors = {
        success: '#5CB85C',
        info: '#5BC0DE',
        warning: '#F0AD4E',
        danger: '#D9534F'
    };

    function Gauge(element, option) {
        this.element = element;

        var self = this; // for internal d3 functions

        this.configure = function (option) {
            this.config = option;

            this.config.size = this.config.size * 0.9;

            this.config.raduis = this.config.size * 0.97 / 2;
            this.config.cx = this.config.size / 2;
            this.config.cy = this.config.size / 2;

            this.config.min = undefined != option.min ? option.min : 0;
            this.config.max = undefined != option.max ? option.max : 100;
            this.config.range = this.config.max - this.config.min;

            this.config.majorTicks = option.majorTicks || 5;
            this.config.minorTicks = option.minorTicks || 2;

            this.config.greenColor = option.greenColor || "#109618";
            this.config.yellowColor = option.yellowColor || "#FF9900";
            this.config.redColor = option.redColor || "#DC3912";

            this.config.color = option.color || 'auto';
            this.config.transitionDuration = option.transitionDuration || 500;
            this.config.onLabelClick = option.onLabelClick;
            this.config.onTextClick = option.onTextClick;
        }

        this.render = function () {
            this.body = d3.select(this.element)
                                .append("svg:svg")
                                .attr("class", "cvf-gauges")
                                .attr("width", this.config.size)
                                .attr("height", this.config.size);

            this.body.append("svg:circle")
                        .attr("cx", this.config.cx)
                        .attr("cy", this.config.cy)
                        .attr("r", this.config.raduis)
                        .classed("cvf-gauges-circle-out", true);

            this.body.append("svg:circle")
                        .attr("cx", this.config.cx)
                        .attr("cy", this.config.cy)
                        .attr("r", 0.9 * this.config.raduis)
                        .classed("cvf-gauges-circle-in", true);

            for (var index in this.config.greenZones) {
                this.drawBand(this.config.greenZones[index].from, this.config.greenZones[index].to, self.config.greenColor);
            }

            for (var index in this.config.yellowZones) {
                this.drawBand(this.config.yellowZones[index].from, this.config.yellowZones[index].to, self.config.yellowColor);
            }

            for (var index in this.config.redZones) {
                this.drawBand(this.config.redZones[index].from, this.config.redZones[index].to, self.config.redColor);
            }

            if (undefined != this.config.label) {
                var fontSize = Math.round(this.config.size / 9);
                var label = this.body.append("svg:text")
                            .attr("x", this.config.cx)
                            .attr("y", this.config.cy / 2 + fontSize / 2)
                            .attr("dy", fontSize / 2)
                            .text(this.config.label)
                            .classed("cvf-gauges-label", true)
                            .classed("cvf-gauges-label-respon", function () { return !!option.onLabelClick; })
                            .style("font-size", fontSize + "px");
                if (option.onLabelClick) {
                    label.on('click', option.onLabelClick);
                }
            }

            var fontSize = Math.round(this.config.size / 16);
            var majorDelta = this.config.range / (this.config.majorTicks - 1);
            for (var major = this.config.min; major <= this.config.max; major += majorDelta) {
                var minorDelta = majorDelta / this.config.minorTicks;
                for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, this.config.max) ; minor += minorDelta) {
                    var point1 = this.valueToPoint(minor, 0.75);
                    var point2 = this.valueToPoint(minor, 0.85);

                    this.body.append("svg:line")
                                .attr("x1", point1.x)
                                .attr("y1", point1.y)
                                .attr("x2", point2.x)
                                .attr("y2", point2.y)
                                .style("stroke", "#666")
                                .style("stroke-width", "1px");
                }

                var point1 = this.valueToPoint(major, 0.7);
                var point2 = this.valueToPoint(major, 0.85);

                this.body.append("svg:line")
                            .attr("x1", point1.x)
                            .attr("y1", point1.y)
                            .attr("x2", point2.x)
                            .attr("y2", point2.y)
                            .style("stroke", "#333")
                            .style("stroke-width", "2px");

                if (major == this.config.min || major == this.config.max) {
                    var point = this.valueToPoint(major, 0.63);

                    this.body.append("svg:text")
                                .attr("x", point.x)
                                .attr("y", point.y)
                                .attr("dy", fontSize / 3)
                                .attr("text-anchor", major == this.config.min ? "start" : "end")
                                .text(major)
                                .style("font-size", fontSize + "px")
                                .style("fill", "#333")
                                .style("stroke-width", "0px");
                }
            }

            var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer");

            var midValue = (this.config.min + this.config.max) / 2;

            var pointerPath = this.buildPointerPath(midValue);

            var pointerLine = d3.svg.line()
                                        .x(function (d) { return d.x })
                                        .y(function (d) { return d.y })
                                        .interpolate("basis");

            pointerContainer.selectAll("path")
                                .data([pointerPath])
                                .enter()
                                    .append("svg:path")
                                        .attr("d", pointerLine)
                                        .style("fill", "#dc3912")
                                        .style("stroke", "#c63310")
                                        .style("fill-opacity", 0.7)

            pointerContainer.append("svg:circle")
                                .attr("cx", this.config.cx)
                                .attr("cy", this.config.cy)
                                .attr("r", 0.12 * this.config.raduis)
                                .style("fill", "#4684EE")
                                .style("stroke", "#666")
                                .style("opacity", 1);

            var fontSize = Math.round(this.config.size / 10);
            var text = pointerContainer.selectAll("text")
                                .data([midValue])
                                .enter()
                                    .append("svg:text")
                                        .attr("x", this.config.cx)
                                        .attr("y", this.config.size - this.config.cy / 4 - fontSize)
                                        .attr("dy", fontSize / 2)
                                        .classed("cvf-gauges-text", true)
                                        .classed("cvf-gauges-text-respon", function () { return !!option.onTextClick; })
                                        .style("font-size", fontSize + "px");
            if (option.onTextClick) {
                text.on('click', option.onTextClick);
            }

            this.redraw(this.config.min, 0);
        }

        this.buildPointerPath = function (value) {
            var delta = this.config.range / 13;

            var head = valueToPoint(value, 0.85);
            var head1 = valueToPoint(value - delta, 0.12);
            var head2 = valueToPoint(value + delta, 0.12);

            var tailValue = value - (this.config.range * (1 / (270 / 360)) / 2);
            var tail = valueToPoint(tailValue, 0.28);
            var tail1 = valueToPoint(tailValue - delta, 0.12);
            var tail2 = valueToPoint(tailValue + delta, 0.12);

            return [head, head1, tail2, tail, tail1, head2, head];

            function valueToPoint(value, factor) {
                var point = self.valueToPoint(value, factor);
                point.x -= self.config.cx;
                point.y -= self.config.cy;
                return point;
            }
        }

        this.drawBand = function (start, end, color) {
            if (0 >= end - start) return;

            this.body.append("svg:path")
                        .style("fill", color)
                        .attr("d", d3.svg.arc()
                            .startAngle(this.valueToRadians(start))
                            .endAngle(this.valueToRadians(end))
                            .innerRadius(0.65 * this.config.raduis)
                            .outerRadius(0.85 * this.config.raduis))
                        .attr("transform", function () { return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)" });
        }

        this.redraw = function (value, transitionDuration) {
            var pointerContainer = this.body.select(".pointerContainer");
            var percent = Math.round(value * 100 / this.config.max);

            pointerContainer.selectAll("text").text(Math.round(value));
            if (this.config.color == 'auto') {
                var color = colors.success;
                if (percent > 90) {
                    color = colors.danger;
                } else if (percent > 80) {
                    color = colors.warning;
                } else if (percent > 60) {
                    color = colors.info;
                }
                this.body.selectAll('.cvf-gauges-circle-out').style('fill', color);
            } else if (this.config.color) {
                this.body.selectAll('.cvf-gauges-circle-out').style('fill', this.config.color)
            }

            var pointer = pointerContainer.selectAll("path");
            pointer.transition()
                        .duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
                        //.delay(0)
                        //.ease("linear")
                        //.attr("transform", function(d) 
                        .attrTween("transform", function () {
                            var pointerValue = value;
                            if (value > self.config.max) pointerValue = self.config.max + 0.02 * self.config.range;
                            else if (value < self.config.min) pointerValue = self.config.min - 0.02 * self.config.range;
                            var targetRotation = (self.valueToDegrees(pointerValue) - 90);
                            var currentRotation = self._currentRotation || targetRotation;
                            self._currentRotation = targetRotation;

                            return function (step) {
                                var rotation = currentRotation + (targetRotation - currentRotation) * step;
                                return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")";
                            }
                        });
        }

        this.valueToDegrees = function (value) {
            // thanks @closealert
            //return value / this.config.range * 270 - 45;
            return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45);
        }

        this.valueToRadians = function (value) {
            return this.valueToDegrees(value) * Math.PI / 180;
        }

        this.valueToPoint = function (value, factor) {
            return {
                x: this.config.cx - this.config.raduis * factor * Math.cos(this.valueToRadians(value)),
                y: this.config.cy - this.config.raduis * factor * Math.sin(this.valueToRadians(value))
            };
        }

        // initialization
        this.configure(option);
    }

    cvf.controls.gauge = function (element, option) {
        if (element instanceof $) {
            element = element.get(0);
        }
        return new Gauge(element, option);
    }
})(jQuery, cvf, window);
(function ($, cvf, global) {
    if (cvf.nav) {
        return;
    }
    var nav = {};
    cvf.nav = nav;

    var items = [],
        bar = $('.cvf-nav-bar'),
        panel = $('.cvf-nav-panel');

    var regions = {
        top: $('.cvf-nav-top-region'),
        middle: $('.cvf-nav-middle-region'),
        bottom: $('.cvf-nav-bottom-region')
    }

    function openNavPanel(btn, options) {
        var url = btn.attr('data-url'),
            title = btn.attr('data-title');
        panel.removeClass('cvf-nav-panel-zoomout')
            .addClass('cvf-nav-panel-zoomin')
            .find('.cvf-nav-panel-heading h1').text(title);
        panel.find('.cvf-nav-panel-body').empty();
        if (url) {
            var element = panel.addClass('cvf-loading').find('.cvf-nav-panel-body');
            cvf.load(element, url, options, function () {
                if (options.success) {
                    options.success.apply(this, arguments);
                }
                panel.removeClass('cvf-loading');
            });
        }
    }

    function closeNavPanel() {
        bar.find('.active').removeClass('active');
        panel.removeClass('cvf-nav-panel-zoomin')
            .removeClass('cvf-loading')
            .addClass('cvf-nav-panel-zoomout')
            .find('.cvf-nav-panel-body').empty();
    }


    function buttonClick(options) {
        var t = $(this);
        if (t.hasClass('active')) {
            t.removeClass('active');
            closeNavPanel();
        } else {
            bar.find('.active').removeClass('active');
            t.addClass('active');
            openNavPanel(t, options);
        }
    }

    nav.close = closeNavPanel;
    nav.open = openNavPanel;

    nav.register = function (item, region) {
        if ($.isArray(item)) {
            var len = item.length;
            for (var idx = 0; idx < len; idx++) {
                nav.register(item[idx], region);
            }
        } else {
            var region = regions[region] || regions.middle;
            items.push(item);
            var button = $('<div class="cvf-nav-button"/>'),
                icon = $('<span class="cvf-nav-button-icon"><i class="fa"></i></span>');
            if (item.color) {
                icon.addClass('color-' + item.color);
            }
            if (item.icon) {
                icon.find('i').addClass(item.icon);
            }
            button.click(function () {
                if (item.onClick) {
                    item.onClick.call();
                } else {
                    buttonClick.call(this, item);
                }
            });
            button.attr('data-url', item.url)
                .attr('data-title', item.title)
                .append(icon);
            if (item.showText !== false) {
                button.append('<div class="cvf-nav-button-title">' + item.title + '</div>');
            }
            region.find('ul').append($('<li/>').append(button));

        }
    }

    var itemsForNew = [];

    nav.registerNew = function (item) {
        itemsForNew.push(item);
    }

    function openNewPanel() {
        var ul = $('<table class="cvf-nav-panel-list"/>');
        $.each(itemsForNew, function () {
            var t = this, li = $('<tr/>');
            li.appendTo(ul);
            var icon = $('<td class="cvf-nav-panel-list-icon"/>').append($('<i class="fa">').addClass(t.icon)).addClass(t.color);
            var text = $('<td class="cvf-nav-panel-list-text"/>').append(
                $('<div class="cvf-nav-panel-list-title"/>').text(t.title),
                $('<div class="cvf-nav-panel-list-description"/>').text(t.description)
                );
            li.append(icon, text);
            li.click(function () {
                if (t.handler) {
                    t.handler();
                }
                closeNavPanel();
            });
        });
        panel.removeClass('cvf-nav-panel-zoomout')
            .addClass('cvf-nav-panel-zoomin')
            .find('.cvf-nav-panel-heading h1').text('New');
        panel.find('.cvf-nav-panel-body').empty().append(ul);
    }

    panel.find('.cvf-controls-close').click(closeNavPanel);

    cvf.panorama.click(function () {
        closeNavPanel();
    })

    bar.find('.cvf-nav-button').click(buttonClick);

    regions.bottom.find('.cvf-nav-button[data-title="New"]').unbind('click').click(function () {
        openNewPanel();
    });

})(jQuery, cvf, window);
(function ($, cvf, global) {
    cvf.controls = cvf.controls || {};

    function drawPie(element, options, data) {
        var duration = options.duration || 1500,
            delay = options.delay || 500,
            width = element.clientWidth,
            height = options.height || (width / 2),
            radius = Math.min(width, height) / 2,
            container = d3.select(element),
            pieDatas = data,
            gposition = options.position || 'left',
            svg = container.append('svg').style({ 'width': width });//, 'height': height });

        var tx = gposition == 'left' ? radius : (width - radius), ty = radius;

        var filterId = initDefs(svg),
            pie = svg.append('g').attr('transform', 'translate(' + tx + ',' + ty + ')'),
            detailedInfo = svg.append('g'),
            pieData = d3.layout.pie()
                .value(function (d) {
                    return d.value;
                }),
            arc = d3.svg.arc().outerRadius(radius - 20).innerRadius(0),
            pieChartPieces = pie.datum(data)
                .selectAll('path')
                .data(pieData)
                .enter()
                .append('path')
                .style('fill', function (d) {
                    return d.data.color;
                }).attr('filter', 'url(#' + filterId + '-InsetShadow)')
                .attr('d', arc)
                .each(function () {
                    this._current = { startAngle: 0, endAngle: 0 };
                }).transition()
                .duration(duration)
                .attrTween('d', function (d) {
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);

                    return function (t) {
                        return arc(interpolate(t));
                    };
                }).each('end', function handleAnimationEnd(d) {
                    drawDetailedInformation(d.data, this);
                });

        drawChartCenter();

        function drawChartCenter() {
            var centerContainer = pie.append('g').style('class', 'cvf-opie-center');

            centerContainer.append('circle')
                .style('fill', 'rgba(255, 255, 255, 0.75)')
                .attr('r', 0)
                .attr('filter', 'url(#' + filterId + '-DropShadow)')
                .transition()
                .duration(duration)
                .delay(delay)
                .attr('r', radius - 90);

            var inc = centerContainer.append('circle')
                .style('fill', '#fff')
                .attr('r', 0)
                .transition()
                .delay(delay)
                .duration(duration)
                .attr('r', radius - 95)
                .attr('fill', '#fff')
                .each('end', function () {
                    centerContainer.append('text')
                        .text(options.centerText).attr('text-anchor', 'middle')
                        .attr('class', 'cvf-opie-center-text');
                });
        }

        function drawDetailedInformation(data, element) {
            var bBox = element.getBBox(),
                infoWidth = width - radius * 2 - 50,
                anchor,
                infoContainer,
                idx = pieDatas.indexOf(data) + 1,
                infoHeight = Math.min(height / pieDatas.length + 1, 60),
                tx = width - infoWidth,
                ty = infoHeight * idx;
            if (gposition != 'left') {
                tx = 0;
            }

            infoContainer = detailedInfo.append('g')
                .attr('width', infoWidth)
                .attr(
                    'transform',
                    'translate(' + tx + ',' + ty + ')'
                );
            anchor = 'end';
            position = 'right';

            infoContainer.data([data.title])
                .append('text')
                .attr('y', -10)
                .style('fill', data.color)
                .style('font-size', '20px')
                .text(data.title);

            infoContainer.data([data.value])
                .append('text')
                .text('0' + options.valuePostfix)
                .attr('class', 'cvf-opie-detail-percentage')
                .style('fill', data.color)
                .attr('x', (position === 'left' ? 0 : infoWidth))
                .attr('y', -10)
                .attr('text-anchor', anchor)
                .transition()
                .duration(duration)
                .tween('text', function (d) {
                    var i = d3.interpolateNumber(+this.textContent.replace(options.valuePostfix, ''), d);
                    return function (t) {
                        this.textContent = i(t).toFixed(2) + options.valuePostfix;
                    };
                });

            infoContainer.append('line')
                .attr({ 'class': 'cvf-opie-detail-divider', 'x1': 0, 'x2': 0, 'y1': 0, 'y2': 0 })
                .transition()
                .duration(duration)
                .attr('x2', infoWidth).each('end', function () {
                    infoContainer.data([data.description])
                    .append('text')//.append('foreignObject')
                    .attr('width', infoWidth)
                    .attr('height', 100)
                    .attr('y', '20')
                    .attr('class', 'cvf-opie-detail-textContainer')
                    .text(data.description);
                });
        }
    }

    function initDefs(svg) {
        var id = cvf.guid.new();
        var defs = svg.append('defs');
        var is = defs.append('filter').attr('id', id + '-InsetShadow');
        is.append('feOffset').attr({ 'dx': '0', 'dy': '0' });
        is.append('feGaussianBlur').attr({ 'stdDeviation': '3', 'result': 'offset-blur' });
        is.append('feComposite').attr({ 'operator': "out", 'in': "SourceGraphic", 'in2': "offset-blur", 'result': "inverse" });
        is.append('feFlood').attr({ 'flood-color': "black", 'flood-opacity': "1", 'result': "color" });
        is.append('feComposite').attr({ 'operator': "in", 'in': "color", 'in2': "inverse", 'result': "shadow" });
        is.append('feComposite').attr({ 'operator': "over", 'in': "shadow", 'in2': "SourceGraphic" });

        var ds = defs.append('filter').attr('id', id + '-DropShadow');
        ds.append('feGaussianBlur').attr({ 'in': "SourceAlpha", 'stdDeviation': "3", 'result': "blur" });
        ds.append('feOffset').attr({ 'in': 'blur', 'dx': '0', 'dy': '3', 'result': 'offsetBlur' });
        var fe = ds.append('feMerge');
        fe.append('feMergeNode');
        fe.append('feMergeNode').attr('in', 'SourceGraphic');
        return id;
    }
    var opie = function (element, options) {
        return new opie.prototype.init(element, options);
    }
    opie.prototype = {
        init: function (element, options) {
            this.options = $.extend({ valuePostfix: '' }, options);
            this.element = element;
            this.ul = null;
            return this;
        },
        draw: function (data, options) {
            if (!this.ul) {
                this.ul = $('<ul class="cvf-opie"/>').appendTo(this.element);
            }
            var op = this.options;
            if (options) {
                op = $.extend({}, this.options, options);
            }
            var li = $('<li/>'), div = $('<div></div>');
            li.appendTo(this.ul);
            if (op.caption) {
                li.append('<div class="cvf-opie-headline">' + op.caption + '</div>');
            }
            if (op.description) {
                li.append('<div class="cvf-opie-subHeadline">' + op.description + '</div>');
            }
            div.appendTo(li);
            drawPie(div.get(0), op, data);
        }, clear: function () {
            if (this.ul) {
                this.ul.empty();
            }
        }, destroy: function () {
            if (this.ul) {
                this.ul.remove();
            }
        }
    };

    opie.prototype.init.prototype = opie.prototype;

    cvf.controls.opie = opie;

})($, cvf, window);
$.extend($.validator.defaults, {
    highlight: function (element) {
        $(element).closest('.form-group,form').addClass('has-error');
    },
    unhighlight: function (element) {
        $(element).closest('.form-group,form').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function (error, element) {
        if (element.parent('.input-group').length) {
            error.insertAfter(element.parent());
        } else {
            error.insertAfter(element);
        }
    }
});

$.validator.addMethod("guid", function (value) {
    return cvf.guid.test(value);
}, 'Please enter valid guid.');

$.validator.addMethod("password", function (value) {
    var reg = /^[^%\s]{6,}$/;
    var reg1 = /[a-zA-Z]/;
    var reg2 = /[0-9]/;
    var reg3 = /[^a-zA-Z0-9]/;
    return reg.test(value) && reg1.test(value) && reg2.test(value) && reg3.test(value);
}, 'Password must have at least 6 characters, at least one non leter or digit character, one uppercase, one lowercase and one digit');
(function ($, cvf, global) {

    var start = cvf.start = {},
        panel = $('.cvf-content-panorama .cvf-content-home .cvf-panel-body');

    var templateCache = {}, boxs = boxs || {};
    cvf.box = cvf.box || {};
    cvf.box.create = function (option) {
        var box = $('<div class="cvf-box"/>');
        if (option.col) {
            box.addClass('cvf-box-col' + option.col);
        }
        if (option.row) {
            box.addClass('cvf-box-row' + option.row);
        }
        if (option.theme) {
            box.addClass('cvf-box-' + option.theme);
        }
        if (option.class) {
            box.addClass(option.class);
        }
        if (option.color) {
            option.style = option.style || {};
            option.style.color = option.color;
        }
        if (option.style) {
            box.css(option.style);
        }

        if (option.url) {
            if (!templateCache[option.url]) {
                box.html('<div class="cvf-box-loading"><i class="fa fa-spinner fa-spin"></i></div>');
                $.get(option.url, function (html) {
                    templateCache[option.url] = html;
                    box.html(cvf.render(html, option));
                    if (option.onLoad) {
                        option.onLoad.call(box, option);
                    }
                }).error(box.html('<div class="cvf-box-error"><i class="fa fa-warning"></i></div>'));
            } else {
                box.html(cvf.render(templateCache[option.url], option));
            }

        } else {
            if (option.html) {
                box.html(option.html);
            } else if (option.icon || option.title) {
                var icon, title;
                if (option.icon) {
                    icon = $('<div class="cvf-box-icon"></div>');
                    var ic = option.icon.indexOf('fa') == 0 ? "fa " + option.icon : option.icon;
                    icon.append('<i class="' + ic + '"></i>');
                }
                if (option.title) {
                    title = '<span class="cvf-box-title">' + option.title + '</span>';
                }
                box.append($('<div/>').append(icon, title));
            }
            if (option.onLoad) {
                option.onLoad.call(box, option);
            }
        }
        if (option.onClick) {
            box.css('cursor', 'pointer');
            box.click(function (ev) {
                option.onClick.call(box, option, ev);
            })
        }
        box.option = option;
        boxs[option.name || option.title] = box;
        return box;
    }
    cvf.box.get = function (name) {
        return boxs[name];
    }
    start.register = function (item) {
        if ($.isArray(item)) {
            for (var idx = 0, len = item.length; idx < len; idx++) {
                start.register(item[idx]);
            }
        } else {
            panel.append(cvf.box.create(item));
        }
    }


})(jQuery, cvf, window);
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
(function ($, cvf, global) {
    cvf.window = cvf.window || {};

    var animateDuration = 300, content = cvf.content, panorama = cvf.panorama;

    function setWindowEvent(win) {
        win.element.find('.cvf-controls').unbind('click').click(function (ev) {
            var tar = $(ev.target);
            if (tar.hasClass('cvf-controls-maximize')) {
                win.maximize();
            } else if (tar.hasClass('cvf-controls-restore')) {
                win.restore();
            } else if (tar.hasClass('cvf-controls-refresh')) {
                win.refresh(); // open a refresh function for special business logic
                win.render();
                if (win.children) {
                    for (var i = 0; i < win.children.length; i++) {
                        win.children[i].close();
                    }
                    win.children = [];
                }
            } else if (tar.hasClass('cvf-controls-close')) {
                win.close();
            } else if (tar.hasClass('cvf-controls-toolbar')) {
                if (tar.attr('shown') == 'false') {
                    win.showToolbar();
                } else {
                    win.hideToolbar();
                }
            }
        });
    }


    var cvfWindow = function (options) {
        var html = [];
        html.push('<div class="cvf-window" data-trigger="controls">');
        html.push('     <div class="cvf-window-msgbar"></div>');
        html.push('     <div class="cvf-window-title"></div>');
        html.push('     <div class="cvf-window-content">');
        html.push('         <div class="cvf-panel">');
        html.push('             <div class="cvf-panel-heading">');
        html.push('                 <h1>' + options.title + '</h1>');
        html.push('                 <div class="cvf-controls">');
        if (options.controls) {
            html.push('                     <div  data-cvf-focusable="true" class="cvf-controls-maximize">');
            html.push('                     </div>');
        }
        html.push('<div data-cvf-focusable="true" class="cvf-controls-refresh"><i class="fa fa-refresh cvf-controls-refresh"></i>');
        html.push('</div>');
        html.push('                     <div data-cvf-focusable="true" class="cvf-controls-close">');
        html.push('                     </div>');
        html.push('                 </div>');
        if (options.tools) {
            html.push('<div class="cvf-panel-toolbar"><ul>');
            $.each(options.tools, function () {
                html.push('<li data-cvf-focusable="true">')
                html.push('<div class="cvf-panel-toolbar-button" data-toolname="' + this.name + '">');
                html.push('<div class="cvf-panel-toolbar-button-text">' + (this.text || this.name) + '</div>');
                html.push('<div class="cvf-panel-toolbar-button-icon"><i class="fa ' + this.icon + '"/></div>');
                html.push('</div>');
                html.push('</li>');
            });
            html.push('</ul></div>');
        }
        html.push('             </div>');

        html.push('             <div class="cvf-panel-body">');
        html.push('             </div>');
        html.push('         </div>');
        html.push('     </div>');
        html.push('</div>');
        var t = this;
        t.element = $(html.join(''));
        if (['large', 'small', 'extrasmall'].indexOf(options.width) >= 0) {
            t.element.addClass('cvf-window-' + options.width);
        } else {
            t.element.width(options.width);
        }
        t.body = t.element.find('.cvf-panel-body');
        t.options = options;
        t.content = options.content || {};
        if (options.tools) {
            t.toolbar = t.element.find('.cvf-panel-toolbar');
        }
        t.templates = {};
        if (options.background) {
            t.body.addClass(options.background);
        }
    }

    function subscrib(thisObj, func) {
        if (typeof (func) == "function") {
            return function () {
                func.apply(thisObj, arguments)
            };
        }
    }

    function initToolbar(win) {
        win.element.find('.cvf-panel-toolbar-button').click(function () {
            var tools = win.options.tools;
            var name = $(this).attr('data-toolname');
            for (var idx = tools.length - 1; idx >= 0; idx--) {
                if (tools[idx].name == name) {
                    if (tools[idx].handler) {
                        tools[idx].handler();
                    }
                    return;
                }
            }
        });
    }

    function formSubmitSuccess(data, statu, xhr, form) {
        var win = this;
        if (data.TypeName) {
            win.message(data.Message, data.TypeName);
        } else {
            win.message("submit success", "success");
        }
        if (win.options.submitSuccess) {
            win.options.submitSuccess.apply(win, arguments);
        }
    }

    function formSubmitError(data, statu, xhr, form) {
        var win = this;
        win.message('submit error', 'error');
        if (win.options.submitError) {
            win.options.submitError.apply(win, arguments);
        }
    }

    function setFormAjaxAndValidation(win) {
        var form = win.body.find('form');
        form.validate();
        form.ajaxForm({
            beforeSubmit: subscrib(win, win.options.beforeSubmit),
            success: subscrib(win, formSubmitSuccess),
            error: subscrib(win, formSubmitError)
        });
    }

    function setFocusableElementFocusHandler(win) {
        win.element.find('[data-cvf-focusable="true"]').mousedown(function () {
            $('[tabindex=0]').attr('tabindex', null);
            $(this).attr('tabindex', 0);
        });
    }

    function loadWindowTemplate(win, callback) {
        if (!win.templates[win.options.url]) {
            $.get(win.options.url, function (html) {
                win.templates[win.options.url] = html;
                callback(win);
            });
        } else {
            callback(win);
        }
    }

    function renderWindow(win) {
        if (!win.templates[win.options.url]) {
            $.get(win.options.url, function (html) {
                win.templates[win.options.url] = html;
                renderWindow(win);
            });
        } else {
            win.body.html(cvf.render(win.templates[win.options.url], win.content));
            setFormAjaxAndValidation(win);
            setFocusableElementFocusHandler(win);
            if (win.options.afterRender) {
                var resources = win.body.find('link[rel="stylesheet"],script[src]');
                var resourceCount = resources.length;
                if (resourceCount > 0) {
                    resources.on('load', function () {
                        resourceCount--;
                        if (resourceCount == 0) {
                            win.options.afterRender.call(win, win.content.data);
                        }
                    });
                } else {
                    win.options.afterRender.call(win, win.content.data);
                }
            }
            win.cascading();
            if (win.options.autoInitControls !== false) {
                initControls(win);
            }
        }
    }

    function restoreWindowWithoutAnimate(win) {

    }

    function initControls(win) {
        win.body.find('table[data-table="true"]').each(function () {
            var t = $(this);
            if ($.fn.dataTable.isDataTable(t)) {
                t.dataTable().fnDestroy();
            }
            t.dataTable({
                "pageLength": 15,
                "paging": t.attr('data-table-paging') != 'false',
                "ordering": t.attr('data-table-ordering') != 'false',
                "order": [[t.attr('data-table-order-index'), t.attr('data-table-order-sort')]],
                "info": t.attr('data-table-info') != 'false'
            });
        });
        setFocusableElementFocusHandler(win);
    }

    cvfWindow.prototype = {
        appendTo: function (target) {
            this.element.appendTo(target);
            setWindowEvent(this);
            initToolbar(this);
            return this;
        }, progress: function (msg) {
            return this.message(msg || '', 'progress');
            //this.element.find('.cvf-panel').addClass('cvf-loading')
            //return this;
        }, unprogress: function () {
            this.element.find('.cvf-window-msgbar').removeClass('cvf-window-msgbar-progress');
            return this;
            //this.element.find('.cvf-panel').removeClass('cvf-loading')
            //return this;
        }, message: function (msg, type) {
            var bar = this.element.find('.cvf-window-msgbar').text(msg || '');
            if (typeof msg == 'undefined' && typeof type == 'undefined') {
                bar.attr('class', 'cvf-window-msgbar');
            }
            if (type) {
                bar.attr('class', 'cvf-window-msgbar cvf-window-msgbar-' + type);
            }
            return this;
        }, clean: function () {
            return this.message();
        }
        , success: function (msg) {
            return this.message(msg, 'success');
        }, info: function (msg) {
            return this.message(msg, 'info');
        }, warning: function (msg) {
            return this.message(msg, 'warning');
        }, error: function (msg) {
            return this.message(msg, 'error');
        }, clear: function (element) {
            if (typeof (element) == 'undefined') {
                this.message('');
                this.body.empty();
            } else {
                if (typeof (element) == 'string') {
                    element = $(element, this.body);
                }
                else if (!element instanceof jQuery) {
                    element = $(element);
                }
                element.val('').text('');
            }
            return this;
        }, title: function (v) {
            if (v === undefined) {
                return this.element.find('.cvf-panel-heading h1').text();
            } else {
                this.element.find('.cvf-panel-heading h1').html(v);
            }
            return this;
        }, url: function (v) {
            if (v === undefined) {
                return this.options.url;
            } else {
                this.options.url = v;
            }
            return this;
        }, visible: function () {
            return this.element.is(':visible');
        }, showToolbar: function () {
            if (this.toolbar) {
                this.toolbar.show();
                this.body.addClass('cvf-panel-bodywithtoolbar');
                this.element.find('.cvf-controls-toolbar').attr('shown', 'true');
            }
        }, hideToolbar: function () {
            if (this.toolbar) {
                this.toolbar.hide();
                this.body.removeClass('cvf-panel-bodywithtoolbar');
                this.element.find('.cvf-controls-toolbar').attr('shown', 'false');
            }
        }, openChild: function (options) {
            var win = (options instanceof cvfWindow) ? options : cvf.window.create(options);
            win.parent = this;
            if (!this.children) {
                this.children = [];
            }
            this.children.push(win);
            win.element.insertAfter(this.element);
            setWindowEvent(win);
            initToolbar(win);
            win.active();
            return this;
        }, submit: function () {
            var form = this.body.find('form');
            if (form.length != 0) {
                this.progress();
                form.submit();
            } else {
                this.unprogress();
                this.warning("Need a form element to trigger the submit action.");
            }
        }, reset: function () {
            return this.render();
        }, render: function (data) {
            var t = this;
            t.content = t.content || {};
            t.content.data = data || {};
            if (t.options.beforeRender) {
                t.options.beforeRender.call(t, data);
            }
            renderWindow(t);
            return this;
        }, apply: function (data, section) {
            if (!section) {
                section = this.body.find('section[data-conent="ko"]');
                if (section.length == 0) {
                    section = this.body;
                }
            } else if (typeof (section) == 'string') {
                section = this.body.find(section);
            }
            section.each(function () {
                ko.cleanNode(this);
                ko.applyBindings(data, this);
            });
            return this;
        }, ajax: function (url, settings) {
            settings = settings || {};
            var t = this, success = function (data) {
                t.unprogress();
                t.open().render(data);
                if (settings.success) {
                    settings.success.apply(t, arguments);
                }
            }, error = function (xhr, stat, err) {
                t.error(stat || err);
                if (settings.error) {
                    settings.error.apply(this, arguments);
                }
            }
            var options = $.extend({}, settings, { success: success, error: error });
            t.progress();
            $.ajax(url, options);
            return this;
        }, get: function (url, data, callback, type) {
            return this.ajax(url, {
                type: 'GET',
                data: data,
                success: callback,
                dataType: type
            });
        }, getJSON: function (url, data, callback) {
            return this.get(url, data, callback, 'json');
        }, post: function (url, data, callback, type) {
            return this.ajax(url, {
                type: 'POST',
                data: data,
                success: callback,
                dataType: type
            });
        }, open: function () {
            if (!this.visible()) {
                this.appendTo(cvf.body);
                this.element.removeClass('cvf-maximize')
                    .removeClass('cvf-minimum')
                    .width('')
                    .find('.cvf-controls-restore').attr('class', 'cvf-controls-maximize');
            }
            this.active();
            return this;
        }, refresh: function () {
            if (this.options.refresh && typeof this.options.refresh == 'function') {
                this.options.refresh();
            }
            return this;
        }, close: function () {
            if (this.children) {
                $.each(this.children, function () {
                    this.close();
                });
            }
            var ele = this.element;
            ele.animate({ width: 20 }, 100, function () {
                ele.remove();
                ele.width('');
            });
            //this.element.remove();
            if (this.options.afterClose) {
                this.options.afterClose.call();
            }
            return this;
        }, maximize: function () {
            var width = panorama.outerWidth(), t = this;
            if (!t._orgw) {
                t._orgw = t.element.outerWidth();
            }
            t.element.find('.cvf-controls-maximize').attr('class', 'cvf-controls-restore');
            //t.element.children().width(width);
            t.element.animate({ width: width }, animateDuration, function () {
                t.active();
                //t.element.children().width('');
            }).css('overflow', 'visible').removeClass('cvf-minimum').addClass('cvf-maximize');
            return this;
        }, minimize: function () {
            this.element.removeClass('cvf-maximize').addClass('cvf-minimum');
            return this;
        }, restore: function () {
            var t = this, width = t._orgw
            t.element.removeClass('cvf-maximize')
                .removeClass('cvf-minimum')
                .animate({ width: width }, animateDuration, function () {
                    t.active();
                }).css('overflow', 'visible')
                .find('.cvf-controls-restore').attr('class', 'cvf-controls-maximize');
            return this;
        }, active: function () {
            panorama.scrollLeft(panorama.scrollLeft() + this.element.offset().left - panorama.offset().left - (panorama.outerWidth() - this.element.outerWidth()) / 2);
            return this;
        }, bootstrap: function (element, models) {
            if (!element) {
                element = this.body.find('[ng-app]');
            } else if (typeof (element) == 'string') {
                element = this.body.find(element);
            }
            if (!models) {
                models = [];
            } else if (!$.isArray(models)) {
                models = [models];
            }
            element.each(function () {
                var apps = $(this).attr('ng-app');
                if (!apps) {
                    apps = [].concat(models);
                } else {
                    apps = [apps].concat(models);
                }
                angular.bootstrap(this, apps);
            });
        }, scope: function (element) {
            if (!element) {
                element = this.body.find('[ng-controller]');
            } else if (typeof (element) == 'string') {
                element = this.body.find(element);
            }
            if (element.length <= 1) {
                return angular.element(element).scope();
            } else {
                var scopes = [];
                element.each(function () {
                    scopes.push(angular.element(this).scope());
                });
                return scopes;
            }
        }, cascading: function () {
            if (this.children) {
                var args = arguments;
                $.each(this.children, function () {
                    var t = this;
                    if (t.visible() && t.options.cascade) {
                        t.options.cascade.apply(t, args);
                    }
                });
            }
        }, initControls: function () {
            initControls(this);
        }
    }

    cvf.window.create = function (options) {
        return new cvfWindow(options);
    }


})(jQuery, cvf, window);