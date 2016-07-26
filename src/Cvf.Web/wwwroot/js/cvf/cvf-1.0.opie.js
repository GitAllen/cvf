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