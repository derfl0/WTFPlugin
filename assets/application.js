STUDIP.wtf = {
    replacements: [
        [/<b>(.*?)<\/b>/g, '**$1**'], //bold
        [/<u>(.*?)<\/u>/g, '__$1__'], //underlined
        [/<i>(.*?)<\/i>/g, '%%$1%%'], //italic
        [/<h1>(.*?)<\/h1>/g, '!$1\n'], //header
        [/<br(.*?)>/ig, '\n'], //newline
    ],
    forward: [
        [/\*\*(.*?)\*\*/g, '<b>$1</b>'],
        [/__(.*?)__/g, '<u>$1</u>'],
        [/%%(.*?)%%/g, '<i>$1</i>'],
    ],
    cover: function (input) {
        $.each(STUDIP.wtf.replacements, function (index, value) {
            input = input.replace(value[0], value[1]);
        });
        return input;
    },
    toRealHtml: function (input) {
        $.each(STUDIP.wtf.forward, function (index, value) {
            input = input.replace(value[0], value[1]);
        });
        return input;
    }
};

$(document).ready(function () {
    $('textarea').each(function (id, elem) {
        var textarea = $(this);
        var wtf = $('<div>', {id: 'mywtf', class: 'wtf', contenteditable: 'true', html: STUDIP.wtf.toRealHtml(textarea.html())});
        wtf.css('width', textarea.css('width'));
        wtf.css('height', textarea.css('height'));
        $(this).after(wtf);
        wtf.keyup(function () {
            //wtf.find('*:empty').remove();
            textarea.val(STUDIP.wtf.cover(wtf.html()));
        });
        $('#toolbar').click(function () {
            setTimeout(function(){ textarea.val(STUDIP.wtf.cover(wtf.html())); }, 50);
        });
    });

    var editor = new wysihtml5.Editor('mywtf', {
        toolbar: 'toolbar',
        parserRules: wysihtml5ParserRules
    });
});

