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