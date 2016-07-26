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