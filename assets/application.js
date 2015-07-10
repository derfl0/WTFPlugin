STUDIP.wtf = {
    id: 1,
    replacements: [
        [/<b>(.*?)<\/b>/g, '**$1**'], //bold
        [/<u>(.*?)<\/u>/g, '__$1__'], //underlined
        [/<i>(.*?)<\/i>/g, '%%$1%%'], //italic
        [/<h1>(.*?)<\/h1>\W?/g, '\n!$1\n'], //header
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
    $('textarea').focus(function () {
        if (!$(this).hasClass('wtf')) {
            var textarea = $(this);

            // Generate id
            var wtfid = "wtf-" + STUDIP.wtf.id;
            STUDIP.wtf.id++;
            $(this).attr("data-wtf", wtfid);
            $(this).addClass('wtf');
            console.log(textarea);
            var wtf = $('<div>', {id: wtfid, class: 'wtf', contenteditable: 'true', html: STUDIP.wtf.toRealHtml(textarea.html())});
            wtf.css('width', textarea.css('width'));
            wtf.css('height', textarea.css('height'));
            $(this).after(wtf);

            // Add toolbar
            var toolbar = $('<div id="toolbar-' + wtfid + '">\n\
<a data-wysihtml5-command="bold">bold</a>\n\
<a data-wysihtml5-command="italic">italic</a>\n\
<a data-wysihtml5-command="underline">underlined</a>\n\
<a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1">H1</a>\n\
</div>');
            wtf.before(toolbar)

            wtf.keyup(function () {
                //wtf.find('*:empty').remove();
                textarea.val(STUDIP.wtf.cover(wtf.html()));
            });
            toolbar.click(function () {
                setTimeout(function () {
                    textarea.val(STUDIP.wtf.cover(wtf.html()));
                }, 50);
            });



            // Apply the library
            var editor = new wysihtml5.Editor(wtfid, {
                toolbar: 'toolbar-' + wtfid,
                parserRules: wysihtml5ParserRules
            });

            wtf.focus();
        }

    });


});

