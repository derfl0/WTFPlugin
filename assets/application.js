STUDIP.wtf = {
    id: 1,
    replacements: [
        [/<br>/ig, '\n'], //newline
        [/&nbsp;/ig, ' '], //space
        [/<h.>\s*(<img.*?>)\s*<\/h.>/img, '$1 '], //image header fix
        [/<span.*?>(.*?)<\/span>/img, '$1'], //spanfix
        [/<img.*?src=["|'](.*?)["|'].*?>/ig, '[img]$1 '], //image
        [/<b>([^]*?)<\/b>/gm, '**$1**'], //bold
        [/<u>([^]*?)<\/u>/gm, '__$1__'], //underlined
        [/<i>([^]*?)<\/i>/gm, '%%$1%%'], //italic
        [/(?:\n?)<h1>((?:.|\n)*?)<\/h1>/g, '\n!!!!$1\n'], //header1
        [/(?:\n?)<h2>((?:.|\n)*?)<\/h2>/g, '\n!!!$1\n'], //header2
        [/(?:\n?)<h3>((?:.|\n)*?)<\/h3>/g, '\n!!$1\n'], //header3
        [/(?:\n?)<h4>((?:.|\n)*?)<\/h4>/g, '\n!$1\n'], //header4
        [/<li>(.*?)<\/li>/gi, '- $1\n'], //list  
        [/<ul>([\s|\S]*?)<\/ul>/gi, '$1'], //list  

    ],
    forward: [
        [/- (.*)/ig, "<ul><li>$1</li></ul>"],
        [/<\/ul>\s*<ul>/ig, ""],
        [/\*\*(.*?)\*\*/g, '<b>$1</b>'],
        [/__(.*?)__/g, '<u>$1</u>'],
        [/%%(.*?)%%/g, '<i>$1</i>'],
        [/\!\!\!\!(.+)/g, '<h1>$1</h1>'],
        [/\!\!\!(.+)/g, '<h2>$1</h2>'],
        [/\!\!(.+)/g, '<h3>$1</h3>'],
        [/\!(.+)/g, '<h4>$1</h4>'],
        [/\[img\](\S*)/g, '<img contenteditable=true src="$1">'],
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
    },
    toolbarAdd: function (toolbar, command, text, block) {
        var button = $('<div>', {'data-wysihtml5-command': command, html: text});
        if (command === "formatBlock") {
            button.attr('data-wysihtml5-command-value', block);
        }
        toolbar.append(button);
    }
};

$(document).ready(function () {
    $('textarea').focus(function () {
        if (!$(this).hasClass('wtf')) {
            var textarea = $(this);

            // Remove old toolbar
            textarea.closest('.editor_toolbar').find('.buttons').remove();

            // Generate id
            var wtfid = "wtf-" + STUDIP.wtf.id;
            STUDIP.wtf.id++;
            textarea.attr("data-wtf", wtfid);
            textarea.addClass('wtf');
            var text = STUDIP.wtf.toRealHtml(textarea.val());
            var wtf = $('<div>', {id: wtfid, class: 'wtf', contenteditable: 'true', height: textarea.height(), html: text});
            textarea.after(wtf);
            wtf.css('width', textarea.css('width') - 2);
            wtf.height(textarea.css('height') - 2);

            // Add toolbar
            var toolbar = $('<div>', {class: "wtf-toolbar", id: 'toolbar-' + wtfid});
            STUDIP.wtf.toolbarAdd(toolbar, 'bold', "<b>b</b>");
            STUDIP.wtf.toolbarAdd(toolbar, 'italic', "<i>i</i>");
            STUDIP.wtf.toolbarAdd(toolbar, 'underline', "<u>u</u>");
            STUDIP.wtf.toolbarAdd(toolbar, 'insertUnorderedList', 'Liste');
            STUDIP.wtf.toolbarAdd(toolbar, 'formatBlock', "Ü1", "h1");
            toolbar.append($('<div>', {id: 'swap-' + wtfid, class: 'wtf-swap active', text: "WYSIWYG"}));
            textarea.before(toolbar);

            // Bind swapper
            $('#swap-' + wtfid).click(function (event) {
                event.preventDefault();
                textarea.toggle();
                $(this).toggleClass('active');
                wtf.toggle();
            });

            // typing in textarea
            textarea.keyup(function () {
                wtf.html(STUDIP.wtf.toRealHtml(textarea.val()));
            });

            // typing in wtf
            wtf.keyup(function (event) {
                wtf.find('*:not(br):empty').remove();

                // active markup conversion
                /*
                 if (wtf.html() !== STUDIP.wtf.toRealHtml(wtf.html())) {
                 var sel = document.selection.createRange();
                 wtf.html(STUDIP.wtf.toRealHtml(wtf.html()));
                 sel.restoreCharacterRanges(el, savedSel);
                 }
                 
                 // active remove
                 if (event.shiftKey && event.keyCode === 8) {
                 
                 }*/


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

            textarea.hide();
            wtf.focus();
        }

    });


});

