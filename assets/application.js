STUDIP.wtf = {
    id: 1,
    listDepth: 1,
    newline: true,
    cleanline: function (result) {
        if (!STUDIP.wtf.newline) {
            result += "\n\
";
            STUDIP.wtf.newline = true;
        }
        return result;
    },
    toMarkup: function (wtf) {
        var result = "";
        wtf.contents().each(function () {
            if (this.nodeType === 1) {
                switch (this.nodeName) {
                    case 'B':
                        result += '**' + STUDIP.wtf.toMarkup($(this)) + "**";
                        break;
                    case 'I':
                        result += '%%' + STUDIP.wtf.toMarkup($(this)) + "%%";
                        break;
                    case 'U':
                        result += '__' + STUDIP.wtf.toMarkup($(this)) + "__";
                        break;
                    case 'H1':
                        result = STUDIP.wtf.cleanline(result);
                        result += '!!!!' + STUDIP.wtf.toMarkup($(this));
                        result = STUDIP.wtf.cleanline(result);
                        break;
                    case 'UL':
                        STUDIP.wtf.listDepth++;
                        result += STUDIP.wtf.toMarkup($(this));
                        STUDIP.wtf.listDepth--;
                        break;
                    case 'LI':
                        result = STUDIP.wtf.cleanline(result);
                        result += Array(STUDIP.wtf.listDepth).join("-") + " ";
                        result += STUDIP.wtf.toMarkup($(this));
                        result = STUDIP.wtf.cleanline(result);
                        break;
                    case 'BR':
                        result = STUDIP.wtf.cleanline(result);
                        break;
                    case 'IMG':
                        result += "[img]" + (this.src)+" ";
                    default:
                        console.log(this);
                        result += STUDIP.wtf.toMarkup($(this));
                }
            } else {
                STUDIP.wtf.newline = false;
                result += this.nodeValue;
            }
        });
        return result;
    },
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
    $(document).on('focus', "textarea:not(.wtf)", function () {
        if (!$(this).hasClass('wtf')) {
            var textarea = $(this);
            
            // Remove old toolbar
            textarea.closest('.editor_toolbar').find('.buttons').remove();
            
            // Generate id
            var wtfid = "wtf-" + STUDIP.wtf.id;
            STUDIP.wtf.id++;
            textarea.attr("data-wtf", wtfid);
            textarea.addClass('wtf');
            var wtf = $('<div>', {id: wtfid, class: 'wtf', contenteditable: 'true', height: textarea.height()});
            textarea.after(wtf);
            
            // Let php convert
            $.ajax({
                type: "POST",
                url: STUDIP.URLHelper.getURL('plugins.php/WtfPlugin/wtf'),
                data: {markup: textarea.val()},
                success: function (data) {
                    wtf.html(data);
                },
                dataType: 'html'
            });
            
            // Add toolbar
            var toolbar = $('<div>', {class: "wtf-toolbar", id: 'toolbar-' + wtfid});
            STUDIP.wtf.toolbarAdd(toolbar, 'bold', "<b>b</b>");
            STUDIP.wtf.toolbarAdd(toolbar, 'italic', "<i>i</i>");
            STUDIP.wtf.toolbarAdd(toolbar, 'underline', "<u>u</u>");
            STUDIP.wtf.toolbarAdd(toolbar, 'insertUnorderedList', 'Liste');
            STUDIP.wtf.toolbarAdd(toolbar, 'formatBlock', "Ü1", "h1");
            toolbar.append($('<div>', {id: 'swap-' + wtfid, class: 'wtf-swap active', text: ""}));
            textarea.before(toolbar);
            
            // Bind swapper
            $('#swap-' + wtfid).click(function (event) {
                event.preventDefault();
                textarea.toggle();
                $(this).toggleClass('active');
                wtf.toggle();
            });
            
            // typing in wtf
            wtf.keyup(function () {
                textarea.val(STUDIP.wtf.toMarkup(wtf));
            });
            toolbar.click(function () {
                setTimeout(function () {
                    textarea.val(STUDIP.wtf.toMarkup(wtf));
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

