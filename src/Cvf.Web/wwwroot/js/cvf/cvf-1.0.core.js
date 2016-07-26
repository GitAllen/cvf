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