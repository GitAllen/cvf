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