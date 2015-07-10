STUDIP.wtf = {
    id: 1,
    replacements: [
        [/<b>(.*?)<\/b>/g, '**$1**'], //bold
        [/<u>(.*?)<\/u>/g, '__$1__'], //underlined
        [/<i>(.*?)<\/i>/g, '%%$1%%'], //italic
        [/<h1>((?:.|\n)*?)<\/h1>/g, '\n!!!!$1\n'], //header1
        [/<h2>((?:.|\n)*?)<\/h2>/g, '\n!!!$1\n'], //header2
        [/<h3>((?:.|\n)*?)<\/h3>/g, '\n!!$1\n'], //header3
        [/<h4>((?:.|\n)*?)<\/h4>/g, '\n!$1\n'], //header4    
        [/<br(.*?)>/ig, '\n'], //newline
    ],
    forward: [
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
    }
};

$(document).ready(function () {
    $('textarea').focus(function () {
        if (!$(this).hasClass('wtf')) {
            var textarea = $(this);
            
            // Remove old toolbar
            //textarea.closest('.editor_toolbar').remove();

            // Generate id
            var wtfid = "wtf-" + STUDIP.wtf.id;
            STUDIP.wtf.id++;
            $(this).attr("data-wtf", wtfid);
            $(this).addClass('wtf');
            var wtf = $('<div>', {id: wtfid, class: 'wtf', contenteditable: 'true', html: STUDIP.wtf.toRealHtml(textarea.html())});
            wtf.css('width', textarea.css('width') - 2);
            //wtf.css('height', textarea.css('height') - 2);
            $(this).after(wtf);

            // Add toolbar
            var toolbar = $('<div id="toolbar-' + wtfid + '">\n\
<a data-wysihtml5-command="bold">bold</a>\n\
<a data-wysihtml5-command="italic">italic</a>\n\
<a data-wysihtml5-command="underline">underlined</a>\n\
<a data-wysihtml5-command="formatBlock" data-wysihtml5-command-value="h1">H1</a>\n\
<a id="swap-'+wtfid+'">WYSIWYG</a>\n\
</div>');
            textarea.before(toolbar)
            
            // Bind swapper
            $('#swap-'+wtfid).click(function(event) {
                event.preventDefault();
                textarea.toggle();
                wtf.toggle();
            });

            wtf.keyup(function (event) {
                //wtf.find('*:empty').remove();
                
                // active markup conversion
                var converted = STUDIP.wtf.toRealHtml(wtf.html());
                if (wtf.html() !== converted) {
                    wtf.html(converted);
                }
                
                // active remove
                if (event.shiftKey && event.keyCode === 8) {
                    
                }
                
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

            //textarea.hide();
            wtf.focus();
        }

    });


});

