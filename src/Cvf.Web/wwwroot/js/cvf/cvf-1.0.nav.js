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