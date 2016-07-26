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