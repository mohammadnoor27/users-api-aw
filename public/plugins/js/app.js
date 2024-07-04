/**
 Core script to handle the entire theme and core functions
 **/
var App = function() {

    // IE mode
    var isRTL = false;
    var isIE8 = false;
    var isIE9 = false;
    var isIE10 = false;

    var resizeHandlers = [];


    var globalImgPath = 'global/img/';

    var globalPluginsPath = 'global/plugins/';

    var globalCssPath = 'global/css/';

    // theme layout color set

    var brandColors = {
        'blue': '#89C4F4',
        'red': '#F3565D',
        'green': '#1bbc9b',
        'purple': '#9b59b6',
        'grey': '#95a5a6',
        'yellow': '#F8CB00'
    };

    $(document).on('select2:select change.select2', 'select', function(e) {
        var parent = $(this).next('.select2-container--bootstrap');
        var element = parent.find('.select2-selection__rendered');
        if(element.length){
            setTimeout(function() {
                var title = element.attr('title') !== undefined ? element.attr('title') : '';
                element.attr('title', title.trim().replace(new RegExp('\\s{2,}', 'gm'), ' '));
            }, 1);
        }
    });

    $(document).on('processing.dt', function ( e, settings, processing ) {
        var table = $(e.target).parent().parent().parent();
        if(processing){
            App.blockUI({
                target: table,
                boxed: true
            });
        }else{
            handleUniform(table);
            table.find('.popovers').popover({html: true});
            App.unblockUI(table);
        }
    });

    // initializes main settings
    var handleInit = function() {

        if ($('body').css('direction') === 'rtl') {
            isRTL = true;
        }

        isIE8 = !!navigator.userAgent.match(/MSIE 8.0/);
        isIE9 = !!navigator.userAgent.match(/MSIE 9.0/);
        isIE10 = !!navigator.userAgent.match(/MSIE 10.0/);

        if (isIE10) {
            $('html').addClass('ie10'); // detect IE10 version
        }

        if (isIE10 || isIE9 || isIE8) {
            $('html').addClass('ie'); // detect IE10 version
        }
    };

    // runs callback functions set by App.addResponsiveHandler().
    var _runResizeHandlers = function() {
        // reinitialize other subscribed elements
        for (var i = 0; i < resizeHandlers.length; i++) {
            var each = resizeHandlers[i];
            each.call();
        }
    };

    var handleOnResize = function() {
        var windowWidth = $(window).width();
        var resize;
        if (isIE8) {
            var currheight;
            $(window).resize(function() {
                if (currheight == document.documentElement.clientHeight) {
                    return; //quite event since only body resized not window.
                }
                if (resize) {
                    clearTimeout(resize);
                }
                resize = setTimeout(function() {
                    _runResizeHandlers();
                }, 50); // wait 50ms until window resize finishes.
                currheight = document.documentElement.clientHeight; // store last body client height
            });
        } else {
            $(window).resize(function() {
                if ($(window).width() != windowWidth) {
                    windowWidth = $(window).width();
                    if (resize) {
                        clearTimeout(resize);
                    }
                    resize = setTimeout(function() {
                        _runResizeHandlers();
                    }, 50); // wait 50ms until window resize finishes.
                }
            });
        }
    };

    // Handles portlet tools & actions
    var handlePortletTools = function() {
        // handle portlet remove
        $('body').on('click', '.portlet > .portlet-title > .tools > a.remove', function(e) {
            e.preventDefault();
            var portlet = $(this).closest(".portlet");

            if ($('body').hasClass('page-portlet-fullscreen')) {
                $('body').removeClass('page-portlet-fullscreen');
            }

            portlet.find('.portlet-title .fullscreen').tooltip('destroy');
            portlet.find('.portlet-title > .tools > .reload').tooltip('destroy');
            portlet.find('.portlet-title > .tools > .remove').tooltip('destroy');
            portlet.find('.portlet-title > .tools > .config').tooltip('destroy');
            portlet.find('.portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand').tooltip('destroy');

            portlet.remove();
        });

        // handle portlet fullscreen
        $('body').on('click', '.portlet > .portlet-title .fullscreen', function(e) {
            e.preventDefault();
            var portlet = $(this).closest(".portlet");
            if (portlet.hasClass('portlet-fullscreen')) {
                $(this).removeClass('on');
                portlet.removeClass('portlet-fullscreen');
                $('body').removeClass('page-portlet-fullscreen');
                portlet.children('.portlet-body').css('height', 'auto');
            } else {
                var height = App.getViewPort().height -
                    portlet.children('.portlet-title').outerHeight() -
                    parseInt(portlet.children('.portlet-body').css('padding-top')) -
                    parseInt(portlet.children('.portlet-body').css('padding-bottom'));

                $(this).addClass('on');
                portlet.addClass('portlet-fullscreen');
                $('body').addClass('page-portlet-fullscreen');
                portlet.children('.portlet-body').css('height', height);
            }
        });

        $('body').on('click', '.portlet > .portlet-title > .tools > a.reload', function(e) {
            e.preventDefault();
            var el = $(this).closest(".portlet").children(".portlet-body");
            var url = $(this).attr("data-url");
            var error = $(this).attr("data-error-display");
            if (url) {
                App.blockUI({
                    target: el,
                    animate: true,
                    overlayColor: 'none'
                });
                $.ajax({
                    type: "GET",
                    cache: false,
                    url: url,
                    dataType: "html",
                    success: function(res) {
                        App.unblockUI(el);
                        el.html(res);
                        App.initAjax() // reinitialize elements & plugins for newly loaded content
                    },
                    error: function(xhr, ajaxOptions, thrownError) {
                        App.unblockUI(el);
                        var msg = 'Error on reloading the content. Please check your connection and try again.';
                        if (error == "toastr" && toastr) {
                            toastr.error(msg);
                        } else if (error == "notific8" && $.notific8) {
                            $.notific8('zindex', 11500);
                            $.notific8(msg, {
                                theme: 'ruby',
                                life: 3000
                            });
                        } else {
                            alert(msg);
                        }
                    }
                });
            } else {
                // for demo purpose
                App.blockUI({
                    target: el,
                    animate: true,
                    overlayColor: 'none'
                });
                window.setTimeout(function() {
                    App.unblockUI(el);
                }, 1000);
            }
        });

        // load ajax data on page init
        $('.portlet .portlet-title a.reload[data-load="true"]').click();

        $('body').on('click', '.portlet > .portlet-title > .tools > .collapse, .portlet .portlet-title > .tools > .expand', function(e) {
            e.stopImmediatePropagation();
            e.preventDefault();
            var el = $(this).closest(".portlet").children(".portlet-body");
            if ($(this).hasClass("collapse")) {
                $(this).removeClass("collapse").addClass("expand");
                el.slideUp(200);
            } else {
                $(this).removeClass("expand").addClass("collapse");
                el.slideDown(200);
            }
        });
    };

    // Handlesmaterial design checkboxes
    var handleMaterialDesign = function() {

        // Material design ckeckbox and radio effects
        $('body').on('click', '.md-checkbox > label, .md-radio > label', function() {
            var the = $(this);
            // find the first span which is our circle/bubble
            var el = $(this).children('span:first-child');

            // add the bubble class (we do this so it doesnt show on page load)
            el.addClass('inc');

            // clone it
            var newone = el.clone(true);

            // add the cloned version before our original
            el.before(newone);

            // remove the original so that it is ready to run on next click
            $("." + el.attr("class") + ":last", the).remove();
        });

        if ($('body').hasClass('page-md')) {
            // Material design click effect
            // credit where credit's due; http://thecodeplayer.com/walkthrough/ripple-click-effect-google-material-design
            var element, circle, d, x, y;
            $('body').on('click', 'a.btn, button.btn, input.btn, label.btn', function(e) {
                element = $(this);

                if(element.find(".md-click-circle").length == 0) {
                    element.prepend("<span class='md-click-circle'></span>");
                }

                circle = element.find(".md-click-circle");
                circle.removeClass("md-click-animate");

                if(!circle.height() && !circle.width()) {
                    d = Math.max(element.outerWidth(), element.outerHeight());
                    circle.css({height: d, width: d});
                }

                x = e.pageX - element.offset().left - circle.width()/2;
                y = e.pageY - element.offset().top - circle.height()/2;

                circle.css({top: y+'px', left: x+'px'}).addClass("md-click-animate");

                setTimeout(function() {
                    circle.remove();
                }, 1000);
            });
        }

        // Floating labels
        var handleInput = function(el) {
            if (el.val() != "") {
                el.addClass('edited');
            } else {
                el.removeClass('edited');
            }
        }

        $('body').on('keydown', '.form-md-floating-label .form-control', function(e) {
            handleInput($(this));
        });
        $('body').on('blur', '.form-md-floating-label .form-control', function(e) {
            handleInput($(this));
        });

        $('.form-md-floating-label .form-control').each(function(){
            if ($(this).val().length > 0) {
                $(this).addClass('edited');
            }
        });
    }

    // Handles custom checkboxes & radios using jQuery iCheck plugin
    var handleiCheck = function() {
        if (!$().iCheck) {
            return;
        }

        $('.icheck').each(function() {
            var checkboxClass = $(this).attr('data-checkbox') ? $(this).attr('data-checkbox') : 'icheckbox_minimal-grey';
            var radioClass = $(this).attr('data-radio') ? $(this).attr('data-radio') : 'iradio_minimal-grey';

            if (checkboxClass.indexOf('_line') > -1 || radioClass.indexOf('_line') > -1) {
                $(this).iCheck({
                    checkboxClass: checkboxClass,
                    radioClass: radioClass,
                    insert: '<div class="icheck_line-icon"></div>' + $(this).attr("data-label")
                });
            } else {
                $(this).iCheck({
                    checkboxClass: checkboxClass,
                    radioClass: radioClass
                });
            }
        });
    };
    // Handles custom checkboxes & radios using jQuery iCheck plugin
    var handleUniform = function(parent) {
        if (!jQuery().uniform) {
            return;
        }
        if(typeof parent === typeof undefined)
            parent = $('body');
        parent.find('input:checkbox:not(.toggle, .make-switch, .clonedradio, .icheck), input:radio:not(.toggle, .star, .make-switch, .clonedradio)').uniform();
    };



    // Handles Bootstrap switches
    var handleBootstrapSwitch = function() {
        if (!$().bootstrapSwitch) {
            return;
        }
        $('.make-switch').bootstrapSwitch();
    };

    // Handles Bootstrap confirmations
    var handleBootstrapConfirmation = function() {
        if (!$().confirmation) {
            return;
        }
        $('[data-toggle=confirmation]').confirmation({ btnOkClass: 'btn btn-sm btn-success', btnCancelClass: 'btn btn-sm btn-danger'});
    }

    // Handles Bootstrap Accordions.
    var handleAccordions = function() {
        $('body').on('shown.bs.collapse', '.accordion.scrollable', function(e) {
            App.scrollTo($(e.target));
        });
    };

    // Handles Bootstrap Tabs.
    var handleTabs = function() {
        //activate tab if tab id provided in the URL
        if (encodeURI(location.hash)) {
            var tabid = encodeURI(location.hash.substr(1));
            $('a[href="#' + tabid + '"]').parents('.tab-pane:hidden').each(function() {
                var tabid = $(this).attr("id");
                $('a[href="#' + tabid + '"]').click();
            });
            $('a[href="#' + tabid + '"]').click();
        }

        if ($().tabdrop) {
            $('.tabbable-tabdrop .nav-pills, .tabbable-tabdrop .nav-tabs').tabdrop({
                text: '<i class="fa fa-ellipsis-v"></i>&nbsp;<i class="fa fa-angle-down"></i>'
            });
        }
    };

    // Handles Bootstrap Modals.
    var handleModals = function() {
        // fix stackable modal issue: when 2 or more modals opened, closing one of modal will remove .modal-open class.
        $('body').on('hide.bs.modal', function() {
            if ($('.modal:visible').length > 1 && $('html').hasClass('modal-open') === false) {
                $('html').addClass('modal-open');
            } else if ($('.modal:visible').length <= 1) {
                $('html').removeClass('modal-open');
            }
        });

        // fix page scrollbars issue
        $('body').on('show.bs.modal', '.modal', function() {
            if ($(this).hasClass("modal-scroll")) {
                $('body').addClass("modal-open-noscroll");
            }
        });

        // fix page scrollbars issue
        $('body').on('hidden.bs.modal', '.modal', function() {
            $('body').removeClass("modal-open-noscroll");
            $(this).find('*').removeClass('has-error');
            $(this).find('.alert.alert-danger, .help-block.help-block-error').hide();
        });

        // remove ajax content and remove cache on modal closed
        $('body').on('hidden.bs.modal', '.modal:not(.modal-cached)', function () {
            $(this).removeData('bs.modal');
        });
    };

    // Handles Bootstrap Tooltips.
    var handleTooltips = function() {
        // global tooltips
        $('.tooltips').tooltip();

        // portlet tooltips
        $('.portlet > .portlet-title .fullscreen').tooltip({
            trigger: 'hover',
            container: 'body',
            title: 'Fullscreen'
        });
        $('.portlet > .portlet-title > .tools > .reload').tooltip({
            trigger: 'hover',
            container: 'body',
            title: 'Reload'
        });
        $('.portlet > .portlet-title > .tools > .remove').tooltip({
            trigger: 'hover',
            container: 'body',
            title: 'Remove'
        });
        $('.portlet > .portlet-title > .tools > .config').tooltip({
            trigger: 'hover',
            container: 'body',
            title: 'Settings'
        });
        $('.portlet > .portlet-title > .tools > .collapse, .portlet > .portlet-title > .tools > .expand').tooltip({
            trigger: 'hover',
            container: 'body',
            title: 'Collapse/Expand'
        });
    };

    // Handles Bootstrap Dropdowns
    var handleDropdowns = function() {
        /*
         Hold dropdown on click
         */
        $('body').on('click', '.dropdown-menu.hold-on-click', function(e) {
            e.stopPropagation();
        });
    };

    var handleAlerts = function() {
        $('body').on('click', '[data-close="alert"]', function(e) {
            $(this).parent('.alert').hide();
            $(this).closest('.note').hide();
            e.preventDefault();
        });

        $('body').on('click', '[data-close="note"]', function(e) {
            $(this).closest('.note').hide();
            e.preventDefault();
        });

        $('body').on('click', '[data-remove="note"]', function(e) {
            $(this).closest('.note').remove();
            e.preventDefault();
        });
    };

    // Handle textarea autosize
    var handleTextareaAutosize = function() {
        if (typeof(autosize) == "function") {
            autosize(document.querySelectorAll('textarea.autosizeme'));
        }
    }

    // Handles Bootstrap Popovers



    // Handles scrollable contents using jQuery SlimScroll plugin.
    var handleScrollers = function() {
        App.initSlimScroll('.scroller');
    };

    // Handles Image Preview using jQuery Fancybox plugin
    var handleFancybox = function() {
        if (!jQuery.fancybox) {
            return;
        }

        if ($(".fancybox-button").length > 0) {
            $(".fancybox-button").fancybox({
                groupAttr: 'data-rel',
                prevEffect: 'none',
                nextEffect: 'none',
                closeBtn: true,
                helpers: {
                    title: {
                        type: 'inside'
                    }
                }
            });
        }
    };

    // Handles counterup plugin wrapper
    var handleCounterup = function() {
        if (!$().counterUp) {
            return;
        }

        $("[data-counter='counterup']").counterUp({
            delay: 10,
            time: 1000
        });
    };

    // Fix input placeholder issue for IE8 and IE9
    var handleFixInputPlaceholderForIE = function() {
        //fix html5 placeholder attribute for ie7 & ie8
        if (isIE8 || isIE9) { // ie8 & ie9
            // this is html5 placeholder fix for inputs, inputs with placeholder-no-fix class will be skipped(e.g: we need this for password fields)
            $('input[placeholder]:not(.placeholder-no-fix), textarea[placeholder]:not(.placeholder-no-fix)').each(function() {
                var input = $(this);

                if (input.val() === '' && input.attr("placeholder") !== '') {
                    input.addClass("placeholder").val(input.attr('placeholder'));
                }

                input.focus(function() {
                    if (input.val() == input.attr('placeholder')) {
                        input.val('');
                    }
                });

                input.blur(function() {
                    if (input.val() === '' || input.val() == input.attr('placeholder')) {
                        input.val(input.attr('placeholder'));
                    }
                });
            });
        }
    };

    // Handle Select2 Dropdowns
    var handleSelect2 = function() {
        if ($().select2) {
            $.fn.select2.defaults.set("theme", "bootstrap");
            $('.select2me').select2({
                placeholder: "Select",
                width: 'auto',
                allowClear: true
            });
        }
    };

    var handleUnapprovedReports = function() {
        $('body').on('click','.UnderApprovalMessage', function (e) {
            //bootbox.alert('This Item is under approval. Contact the coressponding author for more information');
            App.alert({
                type: 'danger', // alert's type
                message: 'This Item is under approval. Contact the coressponding author for more information', // alert's message
                closeInSeconds: 5, // auto close after defined seconds
            });
        });
        $('body').on('click','.UnderApprovalMessage2', function (e) {
            //bootbox.alert('This Item is under approval.');
            App.alert({
                type: 'danger', // alert's type
                message: 'This Item is under approval.', // alert's message
                closeInSeconds: 5, // auto close after defined seconds
            });
        });
    };

    // last popep popover
    var lastPopedPopover;

    var handlePopovers = function(){
        $('[data-toggle="popover"]').popover({html:true});
        $('.popovers').popover({html:true});

        // close last displayed popover

        $(document).on('click.bs.popover.data-api', function(e) {
            if (lastPopedPopover) {
                lastPopedPopover.popover('hide');
            }
        });
    };

    // handle group element heights
    var handleHeight = function() {
        $('[data-auto-height]').each(function() {
            var parent = $(this);
            var items = $('[data-height]', parent);
            var height = 0;
            var mode = parent.attr('data-mode');
            var offset = parseInt(parent.attr('data-offset') ? parent.attr('data-offset') : 0);

            items.each(function() {
                if ($(this).attr('data-height') == "height") {
                    $(this).css('height', '');
                } else {
                    $(this).css('min-height', '');
                }

                var height_ = (mode == 'base-height' ? $(this).outerHeight() : $(this).outerHeight(true));
                if (height_ > height) {
                    height = height_;
                }
            });

            height = height + offset;

            items.each(function() {
                if ($(this).attr('data-height') == "height") {
                    $(this).css('height', height);
                } else {
                    $(this).css('min-height', height);
                }
            });

            if(parent.attr('data-related')) {
                $(parent.attr('data-related')).css('height', parent.height());
            }
        });
    }

    //* END:CORE HANDLERS *//

    return {

        //main function to initiate the theme
        init: function() {
            //IMPORTANT!!!: Do not modify the core handlers call order.

            //Core handlers
            handleInit(); // initialize core variables
            handleOnResize(); // set and handle responsive
            //UI Component handlers
            handleUniform(); // handles custom radio & checkboxes
            handleMaterialDesign(); // handle material design
            handleiCheck(); // handles custom icheck radio and checkboxes
            handleBootstrapSwitch(); // handle bootstrap switch plugin
            handleScrollers(); // handles slim scrolling contents
            handleFancybox(); // handle fancy box
            handleSelect2(); // handle custom Select2 dropdowns
            handlePortletTools(); // handles portlet action bar functionality(refresh, configure, toggle, remove)
            handleAlerts(); //handle closabled alerts
            handleDropdowns(); // handle dropdowns
            handleTabs(); // handle tabs
            handleTooltips(); // handle bootstrap tooltips
            handlePopovers(); // handles bootstrap popovers
            handleAccordions(); //handles accordions
            handleModals(); // handle modals
            handleBootstrapConfirmation(); // handle bootstrap confirmations
            handleTextareaAutosize(); // handle autosize textareas
            handleCounterup(); // handle counterup instances
            handleUnapprovedReports();
            //Handle group element heights
            this.addResizeHandler(handleHeight); // handle auto calculating height on window resize

            // Hacks
            handleFixInputPlaceholderForIE(); //IE8 & IE9 input placeholder issue fix
        },

        //main function to initiate core javascript after ajax complete
        initAjax: function() {
            handleUniform(); // handles custom radio & checkboxes
            handleiCheck(); // handles custom icheck radio and checkboxes
            handleBootstrapSwitch(); // handle bootstrap switch plugin
            handleScrollers(); // handles slim scrolling contents
            handleSelect2(); // handle custom Select2 dropdowns
            handleFancybox(); // handle fancy box
            handleDropdowns(); // handle dropdowns
            handleTooltips(); // handle bootstrap tooltips
            handlePopovers(); // handles bootstrap popovers
            handleAccordions(); //handles accordions
            handleBootstrapConfirmation(); // handle bootstrap confirmations
        },

        //init main components
        initComponents: function() {
            this.initAjax();
        },

        //public function to remember last opened popover that needs to be closed on click
        setLastPopedPopover: function(el) {
            lastPopedPopover = el;
        },

        //public function to add callback a function which will be called on window resize
        addResizeHandler: function(func) {
            resizeHandlers.push(func);
        },

        //public functon to call _runresizeHandlers
        runResizeHandlers: function() {
            _runResizeHandlers();
        },

        // wrApper function to scroll(focus) to an element
        scrollTo: function (el, offeset) {
            var animate_element_y = $('html,body');
            var animate_element_x = $('html,body');

            function is_element_scrollable(element, x, y) {
                var scrollable_y = false;
                var scrollable_x = false;
                if (element.length > 0) {
                    scrollable_y = element.get(0).scrollHeight > element.innerHeight() && (element.css('overflow-y') === 'scroll' || element.css('overflow-y') === 'auto');
                    scrollable_x = element.get(0).scrollWidth > element.innerWidth() && (element.css('overflow-x') === 'scroll' || element.css('overflow-x') === 'auto');
                }
                if (x && y)
                    return scrollable_x || scrollable_y;
                else if (x)
                    return scrollable_x;
                else if (y)
                    return scrollable_y;
            }


            if (el && el.length > 0) {
                var pos = el.offset().top;
                var modal = el.closest('.modal');
                var form_body = el.closest('.form-body');

                if ($('body').hasClass('page-header-fixed')) {
                    pos = pos - $('.page-header').height();
                } else if ($('body').hasClass('page-header-top-fixed')) {
                    pos = pos - $('.page-header-top').height();
                } else if ($('body').hasClass('page-header-menu-fixed')) {
                    pos = pos - $('.page-header-menu').height();
                }
                if (modal && modal.length > 0) { //if the element inside a modal, consider the modal height
                    var modalPos = modal.offset().top;
                    pos = pos - modalPos + (offeset ? offeset : -1 * el.height());
                } else if (is_element_scrollable(form_body, true, true)) { //if the element inside a form-body, consider the form-body height
                    pos = el.position().top + (offeset ? offeset : -1 * el.height());
                } else {
                    pos = pos + (offeset ? offeset : -1 * el.height());
                }
                var scrollLeft = el.position().left + el.width() + 50;

                if (modal.length > 0) { //if the element inside a modal animate the modal
                    animate_element_y = modal.parent();
                    animate_element_x = modal.parent();
                    var modal_body = modal.find('.modal-body');

                    if (is_element_scrollable(modal_body, false, true)) //if the element inside a scrollable modal-body animate the modal-body Y
                        animate_element_y = modal_body;

                    if (is_element_scrollable(modal_body, true, false)) //if the element inside a scrollable modal-body animate the modal-body X
                        animate_element_x = modal_body;
                } else {
                    if (is_element_scrollable(form_body, false, true))
                        animate_element_y = form_body;
                    if (is_element_scrollable(form_body, true, false))
                        animate_element_x = form_body;
                }

                if (animate_element_y.length > 0) {
                    animate_element_y.animate({
                        scrollTop: pos,
                    }, 'slow');
                    animate_element_y.animate({
                        scrollLeft: scrollLeft
                    }, 'slow');
                }
            } else {
                if (animate_element_y.length > 0)
                    animate_element_y.animate({
                        scrollTop: 0,
                        scrollLeft: 0
                    }, 'slow');
            }
        },

        initSlimScroll: function(el) {
            if (!$().slimScroll) {
                return;
            }

            $(el).each(function() {
                if ($(this).attr("data-initialized")) {
                    return; // exit
                }

                var height;

                if ($(this).attr("data-height")) {
                    height = $(this).attr("data-height");
                } else {
                    height = $(this).css('height');
                }
                if(parseInt(height)>0){
                $(this).slimScroll({
                    allowPageScroll: true, // allow page scroll when the element scroll is ended
                    size: '7px',
                    color: ($(this).attr("data-handle-color") ? $(this).attr("data-handle-color") : '#bbb'),
                    wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                    railColor: ($(this).attr("data-rail-color") ? $(this).attr("data-rail-color") : '#eaeaea'),
                    position: isRTL ? 'left' : 'right',
                    height: height,
                    alwaysVisible: ($(this).attr("data-always-visible") == "1" ? true : false),
                    railVisible: ($(this).attr("data-rail-visible") == "1" ? true : false),
                    disableFadeOut: true
                });

                $(this).attr("data-initialized", "1");
                }

            });
        },

        destroySlimScroll: function(el) {
            if (!$().slimScroll) {
                return;
            }

            $(el).each(function() {
                if ($(this).attr("data-initialized") === "1") { // destroy existing instance before updating the height
                    $(this).removeAttr("data-initialized");
                    $(this).removeAttr("style");

                    var attrList = {};

                    // store the custom attribures so later we will reassign.
                    if ($(this).attr("data-handle-color")) {
                        attrList["data-handle-color"] = $(this).attr("data-handle-color");
                    }
                    if ($(this).attr("data-wrapper-class")) {
                        attrList["data-wrapper-class"] = $(this).attr("data-wrapper-class");
                    }
                    if ($(this).attr("data-rail-color")) {
                        attrList["data-rail-color"] = $(this).attr("data-rail-color");
                    }
                    if ($(this).attr("data-always-visible")) {
                        attrList["data-always-visible"] = $(this).attr("data-always-visible");
                    }
                    if ($(this).attr("data-rail-visible")) {
                        attrList["data-rail-visible"] = $(this).attr("data-rail-visible");
                    }

                    $(this).slimScroll({
                        wrapperClass: ($(this).attr("data-wrapper-class") ? $(this).attr("data-wrapper-class") : 'slimScrollDiv'),
                        destroy: true
                    });

                    var the = $(this);

                    // reassign custom attributes
                    $.each(attrList, function(key, value) {
                        the.attr(key, value);
                    });

                }
            });
        },

        // function to scroll to the top
        scrollTop: function() {
            App.scrollTo();
        },

        // wrApper function to  block element(indicate loading)
        blockUI: function(options) {
            options = $.extend(true, {}, options);
            var html = '';
            let icon = '/plugins/img/loading.gif';
            if (options.legend_icon)
                icon = this.getGlobalImgPath() + '/loading-spinner-grey.gif';
            if (options.iconOnly !== false) {
                options.iconOnly = true;
                options.boxed = false;
            }

            if (options.animate) {
                html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '">' + '<div class="block-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>' + '</div>';
            } else if (options.iconOnly) {
                html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '" '+(!options.boxed ? 'style="padding:0"' : '')+'><img src="' + icon + '" width="35"></div>';
            } else if (options.textOnly) {
                html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
            } else {
                html = '<div class="loading-message ' + (options.boxed ? 'loading-message-boxed' : '') + '"><img src="' + icon + '" width="35"><span>&nbsp;&nbsp;' + (options.message ? options.message : 'LOADING...') + '</span></div>';
            }

            if (options.target) { // element blocking
                var el = $(options.target);
                if (el.height() <= ($(window).height())) {
                    options.cenrerY = true;
                }
                el.block({
                    message: html,
                    baseZ: options.zIndex ? options.zIndex : 1000,
                    centerY: options.cenrerY !== undefined ? options.cenrerY : false,
                    css: {
                        top: '10%',
                        border: '0',
                        padding: '0',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                        opacity: options.boxed ? 0.05 : 0.1,
                        cursor: 'wait'
                    }
                });
            } else { // page blocking
                $.blockUI({
                    message: html,
                    baseZ: options.zIndex ? options.zIndex : 1000,
                    css: {
                        border: '0',
                        padding: '0',
                        backgroundColor: 'none'
                    },
                    overlayCSS: {
                        backgroundColor: options.overlayColor ? options.overlayColor : '#555',
                        opacity: options.boxed ? 0.05 : 0.1,
                        cursor: 'wait'
                    }
                });
            }
        },

        // wrApper function to  un-block element(finish loading)
        unblockUI: function(target) {
            if (target) {
                $(target).unblock({
                    onUnblock: function() {
                        $(target).css('position', '');
                        $(target).css('zoom', '');
                    }
                });
            } else {
                $.unblockUI();
            }
        },

        startPageLoading: function(options) {
            if (options && options.animate) {
                $('.page-spinner-bar').remove();
                $('body').append('<div class="page-spinner-bar"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
            } else {
                $('.page-loading').remove();
                $('body').append('<div class="page-loading"><img src="' + this.getGlobalImgPath() + 'loading-spinner-grey.gif"/>&nbsp;&nbsp;<span>' + (options && options.message ? options.message : 'Loading...') + '</span></div>');
            }
        },

        stopPageLoading: function() {
            $('.page-loading, .page-spinner-bar').remove();
        },

        alert: function(options) {

            options = $.extend(true, {
                container: "", // alerts parent container(by default placed after the page breadcrumbs)
                place: "append", // "append" or "prepend" in container
                type: 'Success', // alert's type
                message: "", // alert's message
                close: true, // make alert closable
                reset: true, // close all previouse alerts first
                focus: true, // auto scroll to the alert after shown
                closeInSeconds: 5, // auto close after defined seconds
                icon: "" // put icon before the message
            }, options);

            toastr.options = {
                "closeButton": true,
                "debug": false,
                "positionClass": "toast-center-center",
                "onclick": null,
                "showDuration": "1000",
                "hideDuration": "1000",
                "timeOut": options.closeInSeconds * 1000,
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };

            toastr[options.type === 'danger' ? 'error':options.type](options.message, options.type === 'danger' ? 'Failed':options.type);
            //
            // var id = App.getUniqueID("App_alert");
            //
            // var html = '<div id="' + id + '" class="custom-alerts alert alert-' + options.type + ' fade in">' + (options.close ? '<button type="button" class="close" data-dismiss="alert" aria-hidden="true"></button>' : '') + (options.icon !== "" ? '<i class="fa-lg fa fa-' + options.icon + '"></i>  ' : '') + options.message + '</div>';
            //
            // if (options.reset) {
            //     $('.custom-alerts').remove();
            // }
            //
            // if (!options.container) {
            //     if ($('.page-fixed-main-content').size() === 1) {
            //         $('.page-fixed-main-content').prepend(html);
            //     } else if (($('body').hasClass("page-container-bg-solid") || $('body').hasClass("page-content-white")) && $('.page-head').size() === 0) {
            //         $('.page-title').after(html);
            //     } else {
            //         if ($('.page-bar').size() > 0) {
            //             $('.page-bar').after(html);
            //         } else {
            //             $('.page-breadcrumb, .breadcrumbs').after(html);
            //         }
            //     }
            // } else {
            //     if (options.place == "append") {
            //         $(options.container).append(html);
            //     } else {
            //         $(options.container).prepend(html);
            //     }
            // }
            //
            // if (options.focus) {
            //     App.scrollTo($('#' + id));
            // }
            //
            // if (options.closeInSeconds > 0) {
            //     setTimeout(function() {
            //         $('#' + id).remove();
            //     }, options.closeInSeconds * 1000);
            // }


            return toastr;
        },

        //public function to initialize the fancybox plugin
        initFancybox: function() {
            handleFancybox();
        },

        //public helper function to get actual input value(used in IE9 and IE8 due to placeholder attribute not supported)
        getActualVal: function(el) {
            el = $(el);
            if (el.val() === el.attr("placeholder")) {
                return "";
            }
            return el.val();
        },

        //public function to get a paremeter by name from URL
        getURLParameter: function(paramName) {
            var searchString = window.location.search.substring(1),
                i, val, params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },

        // check for device touch support
        isTouchDevice: function() {
            try {
                document.createEvent("TouchEvent");
                return true;
            } catch (e) {
                return false;
            }
        },

        // To get the correct viewport width based on  http://andylangton.co.uk/articles/javascript/get-viewport-size-javascript/
        getViewPort: function() {
            var e = window,
                a = 'inner';
            if (!('innerWidth' in window)) {
                a = 'client';
                e = document.documentElement || document.body;
            }

            return {
                width: e[a + 'Width'],
                height: e[a + 'Height']
            };
        },

        getUniqueID: function(prefix) {
            return 'prefix_' + Math.floor(Math.random() * (new Date()).getTime());
        },

        // check IE8 mode
        isIE8: function() {
            return isIE8;
        },

        // check IE9 mode
        isIE9: function() {
            return isIE9;
        },

        //check RTL mode
        isRTL: function() {
            return isRTL;
        },

        // check IE8 mode
        isAngularJsApp: function() {
            return (typeof angular == 'undefined') ? false : true;
        },



        setGlobalImgPath: function(path) {
            globalImgPath = path;
        },

        setGlobalPluginsPath: function(path) {
            globalPluginsPath = path;
        },


        // get layout color code by color name
        getBrandColor: function(name) {
            if (brandColors[name]) {
                return brandColors[name];
            } else {
                return '';
            }
        },

        getResponsiveBreakpoint: function(size) {
            // bootstrap responsive breakpoints
            var sizes = {
                'xs' : 480,     // extra small
                'sm' : 768,     // small
                'md' : 992,     // medium
                'lg' : 1200     // large
            };

            return sizes[size] ? sizes[size] : 0;
        }
    };

}();

var discussionInit = function () {
    $.extend({
        checkDiscussionsUsage: function (table, className, entity, entityId, customRows, changeText) {
            var currentRows;
            if (typeof table !== 'undefined') {
                currentRows = table.rows({page: 'current'}).data();
            }
            else if (typeof customRows !== 'undefined') {
                currentRows = customRows;
            }
            else {
                console.log('no discussion rows provided');
                return;
            }
            var entities = [];
            $.each(currentRows, function (key, value) {
                if ($('#' + className + ' .StartDiscussion[data-id=' + value[entityId] + ']').attr('data-loaded') == 'false') {
                    try {
                        value.participant_id = JSON.parse(value.participant_id);
                    } catch (e) {
                    }
                    if (!Array.isArray(value.participant_id))
                        value.participant_id = [value.participant_id];

                    $.each(value.participant_id, function (index, participant) {
                        entities.push({
                            entity_id: value[entityId],
                            participant_id: participant,
                        });
                    });
                }
            });
            if (entities.length > 0) {
                checkDiscussions(entities, entity, function (discussions) {
                    if (discussions != null) {
                        $.each(discussions, function (key, value) {
                            var discussionBtn = $('#' + className + ' .StartDiscussion[data-id=' + value.entity_id + ']');
                            discussionBtn.attr('data-loaded', true);

                            if(value.no_participants === true){
                                discussionBtn.prop('disabled', true);
                                return;
                            }

                            discussionBtn.prop('disabled', false).removeAttr('disabled');
                            discussionBtn.attr('data-discussion', value.discussion_id);
                            if (typeof changeText !== 'undefined') {
                                if (value.discussion_usage)
                                    discussionBtn.text('View'+' '+changeText);
                                else
                                    discussionBtn.text('Start'+' '+changeText);
                            }
                            else{
                                if (value.discussion_usage)
                                    discussionBtn.text('View Discussion');
                                else
                                    discussionBtn.text('Start Discussion');
                            }
                        });
                    }
                });
            }
        }
    });

    function checkDiscussions(discussions, entity, callback) {
        $.ajax({
            url: checkDiscussionsUsage,
            type: 'post',
            data: {
                discussions: discussions,
                entity: entity
            },
            success: function (data, status) {
                callback(data.data);
            },
            error: function (xhr, desc, err) {
                callback(null)
            }
        });
    };

    $('body').on('click', '.StartDiscussion', function (e) {
        e.preventDefault();
        var parent = $(this).parents('.modal:first, .portlet:first, body');
        var id = $(this).attr('data-id');
        var discussionEntity = $(this).attr('data-entity');
        var discussion_id;
        var loaded;
        var button;
        if (discussionEntity == 'report_file_download') {
            button = $('.checkReportDiscussionUsage[data-id='+id+']');
            loaded = $('.checkReportDiscussionUsage[data-id='+id+']').attr('data-loaded');
            discussion_id = $('.checkReportDiscussionUsage[data-id='+id+']').attr('data-discussion');
        }
        else {
            button = $(this);
            loaded = $(this).attr('data-loaded');
            discussion_id = $(this).attr('data-discussion');
        }
        if (loaded == 'true') {
            App.blockUI({
                target: parent,
                boxed: true
            });
            $.getJSON(startDiscussionLink + "/entity_id/" + id + "/discussion_id/" + discussion_id + "/entity/" + discussionEntity, function (data) {
                if (data.result == true) {
                    button.attr('data-discussion', data.discussion_id);
                    if (data.unsubscribed_users != "" && typeof data.unsubscribed_users != 'undefined') {
                        var unsubscribed_users = data.unsubscribed_users + " didn't receive an email due to opting out of emails subscription in MEL ";
                        App.alert({
                            type: 'danger',  // alert's type
                            message: unsubscribed_users,  // alert's message
                            closeInSeconds: 10
                        });
                    }

                    if (discussionEntity == 'report_file_download') {
                        var content = 'The access to this file has been restricted by the author, if you want to contact the author please view current discussion <a href=\'javascript:void(0);\' data-id=\' ' + id + ' \'  data-entity=\'report_file_download\' class=\'StartDiscussion\'>here</a> or click view to see the metadata information on MELSPACE!';
                        button.attr('data-content', content);
                    }
                    else{
                        button.text('View Discussion');
                    }
                    $('#discussion_confirm_modal #go_to_discussion').attr('href', discussionsHomeLink + "/index/did/" + data.discussion_id);
                    $('#discussion_confirm_modal #go_to_discussion').attr('target', '_blank');
                    $('#discussion_confirm_modal').modal();
                } else {
                    App.alert({
                        type: 'danger',  // alert's type
                        message: data.result,  // alert's message
                        closeInSeconds: 5
                    });
                }
                App.unblockUI(parent);
            });
        }
    });

};
var searchAlternativenames = function (params, data) {
    if ($.trim(params.term) === '') {
        return data;
    }
    if ($(data.element).data('alternative_name').toLowerCase().toString().indexOf(params.term.toLowerCase()) > -1 || $(data.element).data('name').toLowerCase().toString().indexOf(params.term.toLowerCase()) > -1) {
        return data;
    }
    return null;
};
<!-- END THEME LAYOUT SCRIPTS -->

$(document).ready(function() {
    App.init(); // init metronic core componets
    discussionInit();
    $.fn.extend({
        partnerSelect2: function(silent_select) {
            var element = $(this);

            function formatRepo (partners) {
                if (partners.loading) return 'Searching...';
                var markup = '';

                if(partners.id == null)
                    markup = '<div class="select2-result-repository clearfix" style="background-color: #e1e5ec;">';
                else
                    markup = '<div class="select2-result-repository clearfix">';
                markup += '<div class="select2-result-repository__avatar"><img height="50px" src="'+partners.logo+'" /></div>';
                markup += '<div class="select2-result-repository__meta">' +
                    '<div class="select2-result-repository__title">' + partners.full_name + '</div>';

                markup += '<div class="select2-result-repository__statistics">';
                if (partners.partner_type)
                    markup += '<div class="select2-result-repository__forks"><i class="fa fa-flash"></i> ' + partners.partner_type + '</div>';
                if (partners.country)
                    markup += '<div class="select2-result-repository__stargazers"><i class="fa fa-star"></i> ' + partners.country + '</div>';
                markup += '</div>';
                if (partners.website)
                    markup += '<a class="select2-result-repository__description" target="_blank" href="' + partners.website + '"><i class="fa fa-globe" aria-hidden="true"></i>' + partners.website + '</a>';

                markup += '</div></div>';
                return markup;
            }
            function formatRepoSelection (partners) {
                if (typeof partners.id !== typeof undefined && partners.id !== '')
                    return '<img style="margin-right: 5px; margin-top: -3px;" height="20px" src="'+partners.logo_small+'" />' + partners.full_name + ' - <small><i>' + partners.country + '</i></small>';
                else
                    return partners.text;

            }

            $(this).each(function(index, element){
                element = $(element);
                var is_multiple = typeof element.attr('multiple') !== typeof undefined && element.attr('multiple') !== false;
                var partner_type = '';
                if (typeof element.attr('partner_type') !== typeof undefined && element.attr('partner_type') !== false)
                    partner_type = element.attr('partner_type');
                var placeholder = 'Select...';
                if (typeof element.attr('data-placeholder') !== typeof undefined && element.attr('data-placeholder') !== false)
                    placeholder = element.attr('data-placeholder');

                element.data('target_element', element);

                if (typeof element.attr('silent_select') !== typeof undefined && element.attr('silent_select') !== false || silent_select === true)
                    element.html('');
                else
                    element.html('').change();
                        var allowAdd = typeof element.attr('allowAdd') !== typeof undefined && element.attr('allowAdd') !== false;

                        var maximumSelectionLength = typeof element.attr('maximumSelectionLength') !== typeof undefined && element.attr('maximumSelectionLength') > 0 ? element.attr('maximumSelectionLength') : null;

                element.select2({
                    ajax: {
                        url: organizationNewDataLink,
                        dataType: 'json',
                        delay: 500,
                        multiple: is_multiple,
                        type: 'POST',
                        data: function (params) {
                            var page = (params.page || 1) - 1;
                            var post_data = {
                                terms: params.term,
                                search: params.term,
                                page: page,//same as start (this is used for select2)
                                start: page * 10,//same as page (this is used to get data)
                                length: 10,
                                partner_type: partner_type,
                                type: 'select'
                            };

                            if (typeof element.attr('custom_ids') !== typeof undefined && element.attr('custom_ids') !== false){
                                if(typeof window[element.attr('custom_ids')] !== typeof undefined){
                                    if($.isArray(window[element.attr('custom_ids')]))
                                        post_data.custom_ids = window[element.attr('custom_ids')].join(',');
                                    else
                                        post_data.custom_ids = window[element.attr('custom_ids')];
                                }else{
                                    post_data.custom_ids = '';
                                }
                            }

                            if (typeof element.attr('disabled_ids') !== typeof undefined && element.attr('disabled_ids') !== false){
                                if(typeof window[element.attr('disabled_ids')] !== typeof undefined){
                                    if($.isArray(window[element.attr('disabled_ids')]))
                                        post_data.disabled_ids = window[element.attr('disabled_ids')].join(',');
                                    else
                                        post_data.disabled_ids = window[element.attr('disabled_ids')];
                                }else{
                                    post_data.disabled_ids = '';
                                }
                            }
                            return post_data;
                        },
                        processResults: function (data, params) {
                            selectCustomSelect2OptionsFunctions.save_select_search(element, params);

                            params.page = params.page || 1;
                            return {
                                results: data.data.items,
                                pagination: {
                                    more: (params.page * 10) < data.data.recordsFiltered
                                }
                            };
                        }
                    },
                    escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
                    templateResult: formatRepo, // omitted for brevity, see the source of this page
                    templateSelection: formatRepoSelection, // omitted for brevity, see the source of this page
                    allowClear: true,
                    placeholder: placeholder,
                    tags: allowAdd,
                    createTag: function (params) {
                        var term = $.trim(params.term);
                        if (term === '')
                            return null;

                        return {
                            abbreviation: '',
                            country: 'New partner',
                            country_id: '',
                            full_name: params.term,
                            id: params.term,
                            is_approved: '',
                            logo: '/graph/getimage/width/50/height/50/image/-partners-',
                            logo_small: '/graph/getimage/width/20/height/20/image/-partners-',
                            name: '',
                            partner_id: '',
                            partner_type: '',
                            partner_type_id: '',
                            website: '',
                            city: '',
                            city_id: '',
                            newOption: true
                        }
                    },
                    insertTag: function (data, tag) {
                        data.push(tag);
                    },
                    maximumSelectionLength: element.attr('maximumSelectionLength')
                });
                element
                    .off('select2:selecting')
                    .off('select2:close')
                    .on('select2:selecting', function (e) {
                        selectCustomSelect2OptionsFunctions.log_select_search($(this).data('search_history'), e.params.args.data, 'partner')
                        $(this).data('search_history', null);
                    })
                    .on('select2:close', function () {
                        $(this).data('search_history', null);
                    });
            });
        },
        partnerSelect2Val: function(ids, on_finish_function, object_of_objects, silent_select) {
            var $this = $(this);
            if($this.length === 0){
                if(typeof on_finish_function !== typeof undefined && $.isFunction(on_finish_function))
                    on_finish_function();
                return $this;
            }
            $this.each(function(index, element){
                element = $(element);
                var select2Container =element.parent().find('.select2.select2-container.select2-container--bootstrap');
                App.blockUI({
                    target: select2Container,
                    boxed: true
                });

                var partner_type = '';
                if (typeof element.attr('partner_type') !== typeof undefined && element.attr('partner_type') !== false)
                    partner_type = element.attr('partner_type');

                var ids_object = false;

                if (typeof ids !== typeof undefined && !$.isArray(ids) && typeof ids === 'object') {
                    ids_object = ids;
                    ids = [];
                    if (!(typeof object_of_objects !== typeof undefined && object_of_objects === true))
                        ids_object = {ids_object: ids_object};

                    $.each(ids_object, function (key, value) {
                        $.each(value, function (key2, value2) {
                            if (key2 !== '' && key2 != null)
                                ids.push(key2);
                        });
                    });
                }

                if($.isArray(ids))
                    ids = ids.join(',');
                if(ids === '' || ids == null || parseInt(ids) === -15){
                    element.val('').change();
                    App.unblockUI(select2Container);
                    if(typeof on_finish_function !== typeof undefined && $.isFunction(on_finish_function))
                        on_finish_function();
                }else{
                    var post_data = {
                        type: 'select',
                        ids: ids,
                        partner_type: partner_type
                    };

                    if (typeof element.attr('custom_ids') !== typeof undefined && element.attr('custom_ids') !== false){
                        if(typeof window[element.attr('custom_ids')] !== typeof undefined){
                            if($.isArray(window[element.attr('custom_ids')]))
                                post_data.custom_ids = window[element.attr('custom_ids')].join(',');
                            else
                                post_data.custom_ids = window[element.attr('custom_ids')];
                        }else{
                            post_data.custom_ids = '';
                        }
                    }

                    $.ajax({
                        url: organizationNewDataLink ,
                        dataType: 'json',
                        type: 'POST',
                        data: post_data,
                        success: function(data){
                            data = data.data;
                            selectCustomSelect2OptionsFunctions.init(element, ids, ids_object, object_of_objects, data, on_finish_function, select2Container, silent_select);
                        }
                    });
                }
            });
            return $this;
        },

        userSelect2: function(filters, silent_select) {
            function formatRepo (users) {
                if (users.loading) return 'Searching ...';

                var markup = '';

                if(users.users_only === true){
                    if(users.id == null)
                        markup += '<div class="select2-result-repository clearfix" style="background-color: #e1e5ec;">';
                    else
                        markup += '<div class="select2-result-repository clearfix">';
                    markup += '<div class="select2-result-repository__avatar"><img src="'+users.photo+'" /></div>';
                    markup += '<div class="select2-result-repository__meta">' ;
                    markup += '<div class="select2-result-repository__title">';
                    markup += users.name;
                    markup += '</div>';
                    if (users.email) {
                        markup += '<div class="select2-result-repository__statistics">' +
                            '<div class="select2-result-repository__forks"><i class="fa fa-envelope"></i> ' + users.email + '</div>' +
                            '</div>';
                    }
                }else{
                    if(users.type === 'user'){
                        markup += '<div class="select2-result-repository clearfix user_select2_profiles_parent_user">';
                        markup += '<div class="select2-result-repository__avatar"><img height="50px" src="'+users.photo+'" /></div>';
                        markup += '<div class="select2-result-repository__meta">' ;
                        markup += '<div class="select2-result-repository__title">';
                        markup += users.name;
                        // markup += '<a href="/user/profile/user_name/'+ users.user_name +'" target="_blank">' + users.name + '</a>';
                        markup += '</div>';
                        if (users.email) {
                            markup += '<div class="select2-result-repository__statistics">' +
                                '<div class="select2-result-repository__forks"><i class="fa fa-envelope"></i> ' + users.email + '</div>' +
                                '</div>';
                        }
                        if(!users.no_add){
                            if(user_id)
                                markup += '<a class="select2-result-repository__description modals_btn_add_new_profile addSelect" target="_blank" data-id="'+ users.user_id +'">' +
                                    '<i class="fa fa-plus" aria-hidden="true"></i> Add profile</a>';
                        }
                    }else {
                        if(users.id == null)
                            markup += '<div class="select2-result-repository clearfix" style="background-color: #e1e5ec;">';
                        else
                            markup += '<div class="select2-result-repository clearfix">';
                        markup += '<div class="select2-result-repository__description">' +
                            '<i class="fa fa-tasks"></i> '+ users.partner +' <i class="fa fa-location-arrow"></i> '+ users.location +'</div>';

                        if (users.title || users.discipline) {
                            markup += '<div class="select2-result-repository__statistics">' ;
                            if (users.title) {
                                markup += '<div class="select2-result-repository__forks"><i class="fa fa-tasks"></i> ' + users.title + '</div>';
                            }
                            if (users.discipline) {
                                markup += '<div class="select2-result-repository__stargazers"><i class="fa fa-location-arrow"></i> ' + users.discipline + '</div>';
                            }
                            markup += '</div>';
                        }
                    }
                }

                markup += '</div></div>';
                return markup;
            }
            function formatRepoSelection (users) {
                if (typeof users.id !== typeof undefined && users.id !== ''){
                    if (typeof users.partner !== typeof undefined && users.partner !== '')
                        return '<img style="margin-right: 5px; margin-top: -3px;" height="20px" src="'+users.photo_small+'" />' + users.name + ' - <small><i>' + users.partner + '</i></small>';
                    else
                        return '<img style="margin-right: 5px; margin-top: -3px;" height="20px" src="'+users.photo_small+'" />' + users.name;
                } else{
                    return users.text;
                }
            }

            var additionFilters = '';
            $.each(filters, function(key, value){
                additionFilters += '/' + key + '/' + value;
            });

            $(this).each(function(index, element){
                element = $(element);

                var partner_id = '';
                if (typeof element.attr('partner_id') !== typeof undefined && element.attr('partner_id') !== false)
                    partner_id = element.attr('partner_id');

                var placeholder = 'Select...';
                if (typeof element.attr('data-placeholder') !== typeof undefined && element.attr('data-placeholder') !== false)
                    placeholder = element.attr('data-placeholder');

                var is_multiple = typeof element.attr('multiple') !== typeof undefined && element.attr('multiple') !== false;
                var no_add = typeof element.attr('no_add') !== typeof undefined && element.attr('no_add') !== false;
                var allowClear = !(typeof element.attr('noAllowClear') !== typeof undefined && element.attr('noAllowClear') !== false);
                var users_only = typeof element.attr('users_only') !== typeof undefined && element.attr('users_only') !== false;
                var active_only = typeof element.attr('active_only') !== typeof undefined && element.attr('active_only') !== false;

                if(typeof element.attr('silent_select') !== typeof undefined && element.attr('silent_select') !== false || silent_select === true)
                    element.html('');
                else
                    element.html('').change();

                element.select2({
                    ajax: {
                        url: (userNewDataLink + additionFilters),
                        dataType: 'json',
                        delay: 500,
                        multiple: is_multiple,
                        type: 'POST',
                        data: function (params) {
                            var page = (params.page || 1) - 1;
                            var post_data = {
                                terms: params.term,
                                search: params.term,
                                page: page,//same as start (this is used for select2)
                                start: page * 20,//same as page (this is used to get data)
                                length: 20,
                                type: 'select',
                                partner_id: partner_id,
                                users_only: users_only,
                                active_only: active_only,
                            };

                            if (typeof element.attr('custom_ids') !== typeof undefined && element.attr('custom_ids') !== false){
                                if(typeof window[element.attr('custom_ids')] !== typeof undefined){
                                    if($.isArray(window[element.attr('custom_ids')]))
                                        post_data.custom_ids = window[element.attr('custom_ids')].join(',');
                                    else
                                        post_data.custom_ids = window[element.attr('custom_ids')];
                                }else{
                                    post_data.custom_ids = '';
                                }
                            }

                            if (typeof element.attr('disabled_ids') !== typeof undefined && element.attr('disabled_ids') !== false){
                                if(typeof window[element.attr('disabled_ids')] !== typeof undefined){
                                    if($.isArray(window[element.attr('disabled_ids')]))
                                        post_data.disabled_ids = window[element.attr('disabled_ids')].join(',');
                                    else
                                        post_data.disabled_ids = window[element.attr('disabled_ids')];
                                }else{
                                    post_data.disabled_ids = '';
                                }
                            }

                            if (typeof element.attr('disabled_users') !== typeof undefined && element.attr('disabled_users') !== false){

                                if(typeof window[element.attr('disabled_users')] !== typeof undefined){
                                    if($.isArray(window[element.attr('disabled_users')]))
                                        post_data.disabled_users = window[element.attr('disabled_users')].join(',');
                                    else
                                        post_data.disabled_users = window[element.attr('disabled_users')];
                                }else{
                                    post_data.disabled_users = '';
                                }
                            }
                            return post_data;
                        },
                        processResults: function (data, params) {
                            selectCustomSelect2OptionsFunctions.save_select_search(element, params);
                            params.page = params.page || 1;
                            if(data.users_only === true){
                                return {
                                    results: $.map(data.items, function (item) {
                                        return dataObj = [{
                                            users_only: item.users_only,
                                            id: item.id,
                                            user_id: item.user_id,
                                            name: item.name,
                                            user_name: item.user_name,
                                            photo: item.photo,
                                            photo_small: item.photo_small,
                                            email: item.email,
                                            target: '',
                                            no_add: true,
                                            nationality: item.nationality,
                                            nationality_id: item.nationality_id,
                                            gender: item.gender,
                                            user_data_exists: item.user_data_exists,
                                            type: 'user'
                                        }];
                                    }),
                                    pagination: {
                                        more: (params.page * 20) < data.total_count
                                    }};
                            }else{
                                return {
                                    results: $.map(data.items, function (item) {
                                        var profiles = [];
                                        $.each(item.partner, function(key, value){
                                            profiles.push({
                                                id: item.id[key],
                                                user_id: item.user_id,
                                                name: item.name,
                                                first_name: item.first_name,
                                                middle_name: item.middle_name,
                                                last_name: item.last_name,
                                                email: item.email,
                                                title: item.title[key],
                                                department: item.department[key],
                                                discipline: item.discipline[key],
                                                partner: item.partner[key],
                                                partner_id: item.partner_id[key],
                                                partner_full_name: item.partner_full_name[key],
                                                location: item.location[key],
                                                nationality: item.nationality,
                                                nationality_id: item.nationality_id,
                                                gender: item.gender,
                                                other_phone: item.other_phone[key],
                                                other_email: item.other_email[key],
                                                country_id: item.country_id[key],
                                                photo_small: item.photo_small,
                                                user_data_exists: item.user_data_exists[key],
                                                type: 'profile'
                                            });
                                        });
                                        return dataObj = [{
                                            users_only: item.users_only,
                                            user_id: item.user_id,
                                            name: item.name,
                                            user_name: item.user_name,
                                            photo: item.photo,
                                            email: item.email,
                                            children: profiles,
                                            target: element,
                                            no_add: no_add,
                                            type: 'user'
                                        }];
                                    }),
                                    pagination: {
                                        more: (params.page * 20) < data.total_count
                                    }};
                            }

                        }
                    },
                    escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
                    templateResult: formatRepo, // omitted for brevity, see the source of this page
                    templateSelection: formatRepoSelection, // omitted for brevity, see the source of this page
                    allowClear: allowClear,
                    placeholder: placeholder
                });
                element
                    .off('select2:selecting')
                    .off('select2:close')
                    .on('select2:selecting', function (e) {
                        selectCustomSelect2OptionsFunctions.log_select_search($(this).data('search_history'), e.params.args.data, 'user')
                        $(this).data('search_history', null);
                    })
                    .on('select2:close', function () {
                        $(this).data('search_history', null);
                    });
            });
        },
        userSelect2Val: function(ids, on_finish_function, object_of_objects, silent_select) {
            var $this = $(this);
            if($this.length === 0){
                if(typeof on_finish_function !== typeof undefined && $.isFunction(on_finish_function))
                    on_finish_function();
                return $this;
            }
            $this.each(function(index, element){
                element = $(element);
                var select2Container =element.parent().find('.select2.select2-container.select2-container--bootstrap');
                App.blockUI({
                    target: select2Container,
                    boxed: true
                });

                var partner_id = '';
                if (typeof element.attr('partner_id') !== typeof undefined && element.attr('partner_id') !== false)
                    partner_id = element.attr('partner_id');

                var users_only = typeof element.attr('users_only') !== typeof undefined && element.attr('users_only') !== false;

                var ids_object = false;

                if (typeof ids !== typeof undefined && !$.isArray(ids) && typeof ids === 'object') {
                    ids_object = ids;
                    ids = [];
                    if (!(typeof object_of_objects !== typeof undefined && object_of_objects === true))
                        ids_object = {ids_object: ids_object};

                    $.each(ids_object, function (key, value) {
                        $.each(value, function (key2, value2) {
                            if (key2 !== '' && key2 != null)
                                ids.push(key2);
                        });
                    });
                }

                if($.isArray(ids))
                    ids = ids.join(',');

                if(ids === '' || ids == null || parseInt(ids) === -15){
                    element.val('').change();
                    App.unblockUI(select2Container);
                    if(typeof on_finish_function !== typeof undefined && $.isFunction(on_finish_function))
                        on_finish_function();
                }else{
                    var post_data = {
                        ids: ids,
                        partner_id: partner_id,
                        users_only: users_only
                    };

                    if (typeof element.attr('custom_ids') !== typeof undefined && element.attr('custom_ids') !== false){
                        if(typeof window[element.attr('custom_ids')] !== typeof undefined){
                            if($.isArray(window[element.attr('custom_ids')]))
                                post_data.custom_ids = window[element.attr('custom_ids')].join(',');
                            else
                                post_data.custom_ids = window[element.attr('custom_ids')];
                        }else{
                            post_data.custom_ids = '';
                        }
                    }
                    var additionFilters = '';
                    if(typeof on_finish_function !== typeof undefined && typeof on_finish_function === 'object') //in this case addition options is send not a function
                        $.each(on_finish_function, function(key, value){
                            additionFilters += '/' + key + '/' + value;
                        });

                    $.ajax({
                        url: (userNewSelectDataLink + additionFilters),
                        dataType: 'json',
                        type: 'POST',
                        data: post_data,
                        async: false,
                        success: function(data){
                            selectCustomSelect2OptionsFunctions.init(element, ids, ids_object, object_of_objects, data, on_finish_function, select2Container, silent_select);
                        }
                    });
                }
            });
            return $this;
        },

        DatePicker: function (options, options2) {
            function makeHtml(element, format){
                var inited = false;
                if(element.parent('.input-group.date.date-picker-container').length > 0)
                    inited = true;

                var old_html = element[0].outerHTML;
                var new_html = $('<div class="input-group date date-picker-container" data-date-format="'+format+'">' +
                    old_html + '<span class="input-group-btn">' +
                    '<button class="btn default" type="button">' +
                    '<i class="fa fa-calendar"></i>' +
                    '</button></span></div>');
                if(inited)
                    new_html = element.parent('.input-group.date.date-picker-container');
                else
                    element.replaceWith(new_html);

                return new_html;
            }

            function initDatePicker(DatePickerElement, object) {
                if (typeof object === "undefined")
                    object = {};
                object.autoclose = true;
                if (object.format !== 'yyyy' && object.format !== 'yyyy-mm')
                    object.format = 'yyyy-mm-dd';
                var new_html = makeHtml(DatePickerElement, object.format);
                new_html.datepicker(object);
                return new_html;
            }

            function OptionsDatePicker(DatePickerElement, DatePickerOptions, DatePickerOptions2){
                if(typeof DatePickerOptions2 === "undefined")
                    return DatePickerElement.datepicker(DatePickerOptions);
                else
                    return DatePickerElement.datepicker(DatePickerOptions, DatePickerOptions2);
            }

            var datePickerElement;
            $(this).each(function (index, element) {
                element = $(element);
                if(element.is('input')){
                    if (typeof options !== 'string') {
                        if(typeof options === "undefined")
                            options = {};
                        if(!options.hasOwnProperty('clearBtn'))
                            options.clearBtn = true;
                        if(!options.hasOwnProperty('autoclose'))
                            options.autoclose = true;
                        options.autoclose = true;
                        if (options.format !== 'yyyy' && options.format !== 'yyyy-mm')
                            options.format = 'yyyy-mm-dd';
                        datePickerElement = initDatePicker(element, options);
                    }else{
                        if(element.parent('.input-group.date.date-picker-container').length > 0){
                            if(typeof options2 === "undefined")
                                datePickerElement = OptionsDatePicker(element.parent('.input-group.date.date-picker-container'), options);
                            else
                                datePickerElement = OptionsDatePicker(element.parent('.input-group.date.date-picker-container'), options, options2);
                        }else{
                            var new_html = initDatePicker(element);
                            datePickerElement = new_html;
                            if(typeof options2 === "undefined")
                                datePickerElement = OptionsDatePicker(new_html, options);
                            else
                                datePickerElement = OptionsDatePicker(new_html, options, options2);
                        }
                    }



                }
            });
            return datePickerElement;
        },

        MoneyBox: function (options) {
            function makeHtml(element, options) {
                let inited = false;
                if (element.parents('div.moneyBoxParentDiv:first').length > 0)
                    inited = true;

                element.addClass('moneyBoxInitial');
                element.addClass('moneyBox-hidden-accessible');
                element.attr('tabindex', -1);

                let addonHtml = '<span class="input-group-addon"><i class="fa fa-dollar"></i></span>';
                if (typeof options === 'object') {
                    if (options.addonHTML !== undefined)
                        if (options.addonHTML == null)
                            addonHtml = '';
                        else
                            addonHtml = '<span class="input-group-addon">' + options.addonHTML + '</span>';
                    if (options.hasOwnProperty('currency') && options.currency.length > 0) {
                        let currency_options = '<option value=""></option>';
                        $.each(options.currency, function (index, value) {
                            currency_options += '<option value="' + value.value + '" ' + (value.default ? ' selected' : '') + '>' + value.label + '</option>';
                        });
                        addonHtml += '<div style="width: 70px;"><select class="moneyBoxCurrencySelect" data-placeholder="Currency">' + currency_options + '</select></div><span class="input-group-btn"></span>';
                    }
                }

                let old_html = element[0].outerHTML;

                let first_box_popover = '';
                let second_box_popover = '';
                if (typeof options === 'object' && options.addonHTML !== undefined && options.addonHTML != null) {
                    first_box_popover = ' data-trigger="hover" data-placement="top" data-container="body" data-content="' + options.addonHTML + '"';
                    second_box_popover = ' data-trigger="hover" data-placement="top" data-container="body" data-content="Cents"';
                }

                let new_html = $('<div class="moneyBoxParentDiv">'
                    + old_html
                    + '<div class="input-group moneyBoxInputGroup">'
                    + addonHtml
                    + '<input type="text" class="form-control numeric-control moneyBoxFirst ' + (first_box_popover !== '' ? 'popovers' : '') + '" placeholder="0"' + first_box_popover + '/>'
                    + '<span class="input-group-btn"></span>'
                    + '<input type="text" maxlength="2" class="form-control numeric-control moneyBoxSecond ' + (first_box_popover !== '' ? 'popovers' : '') + '" placeholder="00" style="width: 50px" ' + second_box_popover + '/>'
                    + '</div></div>');

                // if(element.hasClass('required'))
                //     new_html.find('.moneyBoxFirst, .moneyBoxSecond').addClass('required');

                if (typeof element.attr('data-error-container') !== typeof undefined && element.attr('data-error-container') !== false)
                    new_html.find('.moneyBoxFirst, .moneyBoxSecond').attr('data-error-container', element.attr('data-error-container'));

                if (typeof element.attr('disabled') !== typeof undefined && element.attr('disabled') !== false)
                    new_html.find('.moneyBoxFirst, .moneyBoxSecond').attr('disabled', element.attr('disabled'));

                if (typeof element.attr('readonly') !== typeof undefined && element.attr('readonly') !== false)
                    new_html.find('.moneyBoxFirst, .moneyBoxSecond').attr('readonly', element.attr('readonly'));

                if (typeof element.attr('title') !== typeof undefined && element.attr('title') !== false)
                    new_html.find('.moneyBoxFirst, .moneyBoxSecond').attr('title', element.attr('title'));

                if (inited)
                    element.parents('div.moneyBoxParentDiv:first').replaceWith(new_html);
                else
                    element.replaceWith(new_html);

                new_html.find('select').select2();
                if (typeof options === 'object' && options.hasOwnProperty('currency_on_change') && $.isFunction(options.currency_on_change)) {
                    new_html.find('select').on('change', function () {
                        options.currency_on_change($(this));
                    });
                }

                element.change();
                return new_html;
            }

            function destroyHtml(element){
                element.removeClass('moneyBoxInitial');
                element.removeClass('moneyBox-hidden-accessible');
                element.attr('tabindex', '');

                var inited = false;
                if(element.parents('div.moneyBoxParentDiv:first').length > 0)
                    inited = true;
                if(inited)
                    element.parents('div.moneyBoxParentDiv:first').replaceWith(element);
                else
                    element.replaceWith(element);

                return element;
            }

            var moneyBoxElement = '';
            $(this).each(function(index, element){
                element = $(element);
                if(element.is('input')){
                    if(typeof options === 'string' && options === 'destroy')
                        moneyBoxElement = destroyHtml(element);
                    else
                        moneyBoxElement = makeHtml(element, options);
                }
            });

            let input_mask_options = {
                "alias": "numeric",
                "groupSeparator": ",",
                "autoGroup": true,
                "digits": 0,
                "digitsOptional": false,
                "removeMaskOnSubmit": true,
                "autoUnmask": true,
                "unmaskAsNumber": true,
                "greedy": false
            };
            if (typeof options === 'object' && options.hasOwnProperty('groupSeparator') && options.groupSeparator === false) {
                delete input_mask_options.groupSeparator;
                delete input_mask_options.autoGroup;
            }

            $('.moneyBoxParentDiv .moneyBoxFirst').inputmask(input_mask_options);
            $('.moneyBoxParentDiv .moneyBoxSecond').inputmask('Regex', {regex: '^[0-9]{0,2}}$'});
            $('.moneyBoxParent .moneyBox1').inputmask(input_mask_options);
            $('.moneyBoxParent .moneyBox2').inputmask('Regex', {regex: '^[0-9]{0,2}}$'});

            $('.moneyBoxParentDiv, .moneyBoxParent').find('.popovers').popover({html: true})

            return moneyBoxElement;
        },

        cropsSelect2: function (filters, silent_select) {
            function formatRepo(crop) {
                if (crop.loading) return 'Searching ...';

                let markup = '';

                if (crop.id == null)
                    markup += '<div class="select2-result-repository clearfix" style="background-color: #e1e5ec;">';
                else
                    markup += '<div class="select2-result-repository clearfix">';
                if (crop.image !== '' && crop.image != null) {
                    markup += '<div class="select2-result-repository__avatar"><img src="' + crop.image + '" /></div>';
                    markup += '<div class="select2-result-repository__meta">';
                } else {
                    markup += '<div class="select2-result-repository__meta" style="margin-left: 10px;">';
                }
                markup += '<div class="select2-result-repository__title">';
                markup += crop.crop_name;
                markup += '</div>';

                markup += '<div class="select2-result-repository__statistics">';
                if (Array.isArray(crop.name_variations) && crop.name_variations.length > 0)
                    markup += '<div class="select2-result-repository__forks"><i class="fa fa-exchange"></i> ' + crop.name_variations.join(' || ') + '</div>';
                markup += '</div>';
                if (crop.agrovoc_uri !== '' && crop.agrovoc_uri != null)
                    markup += '<a class="select2-result-repository__description" target="_blank" href="' + crop.agrovoc_uri + '"><img src="/assets_v2/pages/img/AGROVOC-logo.gif" style="width: 14px; margin-top: -3px;"/> ' + crop.agrovoc_uri + '</a>';

                markup += '</div></div>';
                return markup;
            }

            function formatRepoSelection(crop) {
                if (typeof crop.id !== typeof undefined && crop.id !== '') {
                    let name_variations = '';
                    if (Array.isArray(crop.name_variations) && crop.name_variations.length > 0) {
                        name_variations = crop.name_variations.join(' || ');
                        name_variations = name_variations.length > 23 ? (name_variations.substring(0, 23) + '...') : name_variations;
                        name_variations = ' - <small><i>' + name_variations + '</i></small>'
                    }
                    if (crop.image_small !== '' && crop.image_small != null)
                        return '<img style="margin-right: 5px; margin-top: -3px;" height="20px" src="' + crop.image_small + '" />' + crop.crop_name + name_variations;
                    else
                        return crop.crop_name + name_variations;
                } else {
                    return crop.text;
                }
            }

            let additionFilters = '';
            $.each(filters, function (key, value) {
                additionFilters += '/' + key + '/' + value;
            });

            $(this).each(function (index, element) {
                element = $(element);

                let placeholder = 'Select...';
                if (typeof element.attr('data-placeholder') !== typeof undefined && element.attr('data-placeholder') !== false)
                    placeholder = element.attr('data-placeholder');

                const is_multiple = typeof element.attr('multiple') !== typeof undefined && element.attr('multiple') !== false;
                const allowClear = !(typeof element.attr('noAllowClear') !== typeof undefined && element.attr('noAllowClear') !== false);

                if (typeof element.attr('silent_select') !== typeof undefined && element.attr('silent_select') !== false || silent_select === true)
                    element.html('');
                else
                    element.html('').change();

                element.select2({
                    ajax: {
                        url: (CropsDataLink + additionFilters),
                        dataType: 'json',
                        delay: 500,
                        multiple: is_multiple,
                        type: 'POST',
                        data: function (params) {
                            let page = (params.page || 1) - 1;
                            let post_data = {
                                terms: params.term,
                                search: params.term,
                                page: page,//same as start (this is used for select2)
                                start: page * 20,//same as page (this is used to get data)
                                length: 20,
                                type: 'select'
                            };

                            if (typeof element.attr('custom_ids') !== typeof undefined && element.attr('custom_ids') !== false) {
                                if (typeof window[element.attr('custom_ids')] !== typeof undefined) {
                                    if ($.isArray(window[element.attr('custom_ids')]))
                                        post_data.custom_ids = window[element.attr('custom_ids')].join(',');
                                    else
                                        post_data.custom_ids = window[element.attr('custom_ids')];
                                } else {
                                    post_data.custom_ids = '';
                                }
                            }

                            if (typeof element.attr('disabled_ids') !== typeof undefined && element.attr('disabled_ids') !== false) {
                                if (typeof window[element.attr('disabled_ids')] !== typeof undefined) {
                                    if ($.isArray(window[element.attr('disabled_ids')]))
                                        post_data.disabled_ids = window[element.attr('disabled_ids')].join(',');
                                    else
                                        post_data.disabled_ids = window[element.attr('disabled_ids')];
                                } else {
                                    post_data.disabled_ids = '';
                                }
                            }
                            return post_data;
                        },
                        processResults: function (data, params) {
                            selectCustomSelect2OptionsFunctions.save_select_search(element, params);
                            params.page = params.page || 1;
                            return {
                                results: $.map(data.items, function (item) {
                                    return [{
                                        id: item.id,
                                        crop_id: item.crop_id,
                                        crop_name: item.crop_name,
                                        name_variations: item.name_variations,
                                        agrovoc_uri: item.agrovoc_uri,
                                        image: item.image,
                                        image_small: item.image_small
                                    }];
                                }),
                                pagination: {
                                    more: (params.page * 20) < data.total_count
                                }
                            };

                        }
                    },
                    escapeMarkup: function (markup) {
                        return markup;
                    }, // let our custom formatter work
                    templateResult: formatRepo, // omitted for brevity, see the source of this page
                    templateSelection: formatRepoSelection, // omitted for brevity, see the source of this page
                    allowClear: allowClear,
                    placeholder: placeholder
                });
                element
                    .off('select2:selecting')
                    .off('select2:close')
                    .on('select2:selecting', function (e) {
                        selectCustomSelect2OptionsFunctions.log_select_search($(this).data('search_history'), e.params.args.data, 'user')
                        $(this).data('search_history', null);
                    })
                    .on('select2:close', function () {
                        $(this).data('search_history', null);
                    });
            });
        },
        cropsSelect2Val: function (ids, on_finish_function, object_of_objects, silent_select) {
            let $this = $(this);
            if ($this.length === 0) {
                if (typeof on_finish_function !== typeof undefined && $.isFunction(on_finish_function))
                    on_finish_function();
                return $this;
            }
            $this.each(function (index, element) {
                element = $(element);
                let select2Container = element.parent().find('.select2.select2-container.select2-container--bootstrap');
                App.blockUI({
                    target: select2Container,
                    boxed: true
                });

                let ids_object = false;

                if (typeof ids !== typeof undefined && !$.isArray(ids) && typeof ids === 'object') {
                    ids_object = ids;
                    ids = [];
                    if (!(typeof object_of_objects !== typeof undefined && object_of_objects === true))
                        ids_object = {ids_object: ids_object};

                    $.each(ids_object, function (key, value) {
                        $.each(value, function (key2, value2) {
                            if (key2 !== '' && key2 != null)
                                ids.push(key2);
                        });
                    });
                }

                if ($.isArray(ids))
                    ids = ids.join(',');

                if (ids === '' || ids == null || parseInt(ids) === -15) {
                    element.val('').change();
                    App.unblockUI(select2Container);
                    if (typeof on_finish_function !== typeof undefined && $.isFunction(on_finish_function))
                        on_finish_function();
                } else {
                    let post_data = {
                        ids: ids
                    };

                    if (typeof element.attr('custom_ids') !== typeof undefined && element.attr('custom_ids') !== false) {
                        if (typeof window[element.attr('custom_ids')] !== typeof undefined) {
                            if ($.isArray(window[element.attr('custom_ids')]))
                                post_data.custom_ids = window[element.attr('custom_ids')].join(',');
                            else
                                post_data.custom_ids = window[element.attr('custom_ids')];
                        } else {
                            post_data.custom_ids = '';
                        }
                    }
                    let additionFilters = '';
                    if (typeof on_finish_function !== typeof undefined && typeof on_finish_function === 'object') //in this case addition options is send not a function
                        $.each(on_finish_function, function (key, value) {
                            additionFilters += '/' + key + '/' + value;
                        });

                    $.ajax({
                        url: (CropsSelectDataLink + additionFilters),
                        dataType: 'json',
                        type: 'POST',
                        data: post_data,
                        async: false,
                        success: function (data) {
                            selectCustomSelect2OptionsFunctions.init(element, ids, ids_object, object_of_objects, data, on_finish_function, select2Container, silent_select);
                        }
                    });
                }
            });
            return $this;
        },
    });

    const selectCustomSelect2OptionsFunctions = {
        init: (element, ids, ids_object, object_of_objects, data, on_finish_function, select2Container, silent_select) => {
            if (!ids_object) {
                ids_object = {ids_object: {}};
                data.items.map((item) => {
                    ids_object.ids_object[item.id] = element;
                });
            }

            selectCustomSelect2OptionsFunctions.fill_options(ids_object, data, silent_select, function () {
                if (typeof on_finish_function !== typeof undefined && $.isFunction(on_finish_function))
                    on_finish_function(ids);
                App.unblockUI(select2Container);
            });
        },
        fill_options: (ids_object, data, silent_select, callBack) => {
            selectCustomSelect2OptionsFunctions.object_of_objects_map(ids_object, data, function (targets) {
                $.each(targets, function (type, targets_array) {
                    $.each(targets_array, function (key, target) {
                        if (typeof target.element !== typeof undefined && typeof target.element.data('select2') !== typeof undefined) {
                            target.element.data('select2').dataAdapter.addOptions(target.element.data('select2').dataAdapter.convertToOptions(target.options));
                            if (silent_select)
                                target.element.val(target.ids);
                            else
                                target.element.val(target.ids).change();
                        }
                    });
                });
                callBack();
            });
        },
        object_of_objects_map: (ids_object, data, callBack) => {
            let targets = {};
            $.each(ids_object, function (type, object) {
                targets[type] = selectCustomSelect2OptionsFunctions.ids_object_map(object, data);
            });
            callBack(targets);
        },
        ids_object_map: (ids_object, data) => {
            let targets = [];
            $.each(ids_object, function (id, element) {
                let target_mapped = false;
                $.each(targets, function (key, target) {
                    if (target.element.is(element)) {
                        targets[key].ids.push(id);
                        target_mapped = key;
                        return false;
                    }
                });
                let option = null;
                $.each(data.items, function (key, value) {
                    if (parseInt(id) === parseInt(value.id) || (id === 'mel_team' && value.id === id)) {
                        option = value;
                        return false;
                    }
                });

                if (target_mapped === false)
                    targets.push({
                        element: element,
                        ids: [id],
                        options: option != null ? [option] : []
                    });
                else if (option != null)
                    targets[target_mapped].options.push(option);
            });

            return targets;
        },
        save_select_search: (element, params) => {
            let search_history = element.data('search_history');
            if (!Array.isArray(search_history))
                search_history = [];
            if (params.hasOwnProperty('term') && params.term != null && params.term !== '') {
                params = JSON.parse(JSON.stringify(params));
                delete params._type;
                delete params.page;
                search_history.push(params);
                element.data('search_history', search_history);
            }
        },
        log_select_search: (search_history, selected, type) => {
            let selected_data = {id: selected.id};
            if(selected.hasOwnProperty('partner_id'))
                selected_data.partner_id = selected.partner_id;
            $.ajax({
                url: selectsSearchLogHistoryLink,
                type: 'post',
                data: {
                    data: {
                        search_history: search_history,
                        selected: selected_data,
                        type: type
                    }
                }
            });
        }
    };

    $('body').on('keyup', '.moneyBoxParentDiv .moneyBoxInputGroup .moneyBoxFirst, .moneyBoxParentDiv .moneyBoxInputGroup .moneyBoxSecond', function () {
        var target = $(this).parent('.moneyBoxInputGroup').parent('.moneyBoxParentDiv').find('.moneyBoxInitial');
        var element1 = $(this).parent('.moneyBoxInputGroup').find('.moneyBoxFirst');
        var element2 = $(this).parent('.moneyBoxInputGroup').find('.moneyBoxSecond');

        var value1 = element1.val();
        var value2 = element2.val();

        var finalVal = '';
        if((value1 === '' || value1 == null) && (value2 === '' || value2 == null))
            finalVal = '';
        else if(value1 === '' || value1 == null)
            finalVal =  '0.' + value2;
        else if(value2 === '' || value2 == null)
            finalVal = value1 + '.00';
        else
            finalVal = value1 + '.' + value2;

        target.val(finalVal).keyup();
    });
    $('body').on('change', '.moneyBoxParentDiv .moneyBoxInitial', function () {
        var finalVal = $(this).val();
        var target1 = $(this).parent('.moneyBoxParentDiv').find('.moneyBoxInputGroup .moneyBoxFirst');
        var target2 = $(this).parent('.moneyBoxParentDiv').find('.moneyBoxInputGroup .moneyBoxSecond');
        if (finalVal) {
            var finalValArray = finalVal.split('.');
            if (finalValArray[0])
                $(target1).val(finalValArray[0]);
            else
                $(target1).val(0);
            if (finalValArray[1])
                $(target2).val(finalValArray[1].substring(0,2));
            else
                $(target2).val(0);
        } else {
            $(target1).val('');
            $(target2).val('');
        }
    });

    $('body').on('click', '.userMissingFieldsCheckSubmit', function(e){
        e.preventDefault();
        var target_form = $(this).attr('data-form');
        $(target_form).find('input[type=tel]').each(function () {
            $(this).parents('.phone_tag_parent').find('.phone_input').val($(this).intlTelInput('getNumber'));
        });
        $(target_form).submit();
    });

    function userMissingFieldsCheckHandel(){
        if (typeof handle_user_missing_data === typeof undefined)
            return;

        var userMissingFieldsCheckForm = handle_user_missing_data.missing_data_modal.find('#userMissingFieldsCheckForm');
        var userMissingFieldsCheckForm_error1 = $('.alert-danger', userMissingFieldsCheckForm);
        var userMissingFieldsCheckForm_success1 = $('.alert-success', userMissingFieldsCheckForm);

        $.validator.addMethod(
            "user_email_valid",
            function validateEmail(value) {
                var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
                if(value == '')
                    return true;
                return(pattern.test(value))
            },
            "Invalid email."
        );
        $.validator.addMethod(
            "user_email_not_use",
            function validateEmail(value) {
                var email_is_valid = false;
                var user_id = userMissingFieldsCheckForm.find('input[name=user_user_id]').val();
                if(value == '')
                    return true;
                $.ajax({
                    url: checkIfUserAvailable,
                    type: 'POST',
                    async: false,
                    data: {
                        email: value,
                        user_id: user_id
                    },
                    success: function(data) {
                        email_is_valid = data.result;
                    }
                });
                return email_is_valid;
            },
            "Email is already in use."
        );

        $.validator.addMethod(
            "user_valid_phone_tag",
            function validateMainPhone(value, element) {
                //if ($(element).val() !== '' && $(element).val() !== null)
                //    return $(element).intlTelInput('getNumberType') === intlTelInputUtils.numberType.MOBILE;
                //else
                //    return true
             return true;
            }
            ,
            "Invalid Phone number"
        );

        $.validator.addMethod(
            "user_valid_land_line_tag",
            function validateMainPhone(value, element) {
                //if ($(element).val() !== '' && $(element).val() !== null)
                //    return $(element).intlTelInput('getNumberType') === intlTelInputUtils.numberType.FIXED_LINE;
                //else
                //    return true
             return true;
            }
            ,
            "Invalid Land Line"
        );

        $.validator.addMethod(
            "user_other_valid_phone_tag",
            function validateMainPhone(value, element) {
//                 var valid = true;
//                 userMissingFieldsCheckForm.find('input[name="other_phone_tel[]"]').each(function () {
//                     var parent = $(this).parents('.form-group:first');
//                     var currentVal = $(this).val();

//                     parent.removeClass('has-error');
//                     parent.find('.otherPhoneTagError .help-block.help-block-error').remove();
//                     if (is_set(currentVal) && $(this).intlTelInput('getNumberType') !== intlTelInputUtils.numberType.MOBILE) {
//                         var errorElement = $('<span class="help-block help-block-error">Invalid Phone</span>');
//                         parent.addClass('has-error');
//                         parent.find('.otherPhoneTagError').html(errorElement);
//                         valid = false;
//                     }
//                 });
//                 return valid;
             return true;
            }
            ,
            ""
        );

        userMissingFieldsCheckForm.validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block help-block-error', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "", // validate all fields including form hidden input
            rules: {
                user_email: {
                    user_email_valid: true,
                    user_email_not_use: true
                },
                "user_other_phone_tel[]": {
                    user_other_valid_phone_tag: true
                },
                "user_phone_tag": {
                    user_valid_phone_tag: true
                },
                "user_land_line_tag": {
                    user_valid_land_line_tag: true
                }
            },
            errorPlacement: function (error, element) { // render error placement for each input type
                if (element.hasClass('otherPhoneTag')) {
                    //do nothing
                } else if (element.parent(".input-group").length > 0) {
                    error.insertAfter(element.parent(".input-group"));
                }  else if (element.attr("data-error-container")) {
                    error.appendTo(element.attr("data-error-container"));
                } else if (element.parents('.radio-list').length > 0) {
                    error.appendTo(element.parents('.radio-list').attr("data-error-container"));
                } else if (element.parents('.radio-inline').length > 0) {
                    error.appendTo(element.parents('.radio-inline').attr("data-error-container"));
                } else if (element.parents('.checkbox-list').length > 0) {
                    error.appendTo(element.parents('.checkbox-list').attr("data-error-container"));
                } else if (element.parents('.checkbox-inline').length > 0) {
                    error.appendTo(element.parents('.checkbox-inline').attr("data-error-container"));
                } else if (element.is('select')) {
                    element.parent().append(error);
                } else {
                    error.insertAfter(element);
                }
            },
            invalidHandler: function (event, validator) { //display error alert on form submit
                userMissingFieldsCheckForm_success1.hide();
                userMissingFieldsCheckForm_error1.show();
                setTimeout(function () {
                    App.scrollTo(userMissingFieldsCheckForm.find('.has-error:first'), -200);
                }, 5);
            },
            highlight: function (element) { // hightlight error inputs
                if ($(element).hasClass('otherPhoneTag')) {
                    //do nothing
                } else {
                    $(element)
                        .parents('.form-group:first').addClass('has-error'); // set error class to the control group
                }
            },
            unhighlight: function (element) { // revert the change done by hightlight
                if ($(element).hasClass('otherPhoneTag')) {
                    //do nothing
                } else {
                    $(element)
                        .parents('.form-group:first').removeClass('has-error'); // set error class to the control group
                }
            },
            success: function (label) {
                label.parents('.form-group:first').removeClass('has-error'); // set success class to the control group

            },
            submitHandler: function (form) {

                $(form).ajaxSubmit({
                    success: function (data) {
                        handle_user_missing_data.missing_data_after_submit(data);
                    },
                    beforeSubmit: function () {
                        App.blockUI({
                            target: '#userMissingFieldsCheckModal',
                            boxed: true
                        });
                    }
                });
            }
        });
    }
    userMissingFieldsCheckHandel();
    try {
        $.fn.datepicker.defaults.clearBtn = true;
        $.fn.datepicker.defaults.autoclose = true;
    } catch (e) {
    }
    try {
        $.fn.modal.defaults.keyboard = true;
        $.fn.modal.defaults.backdrop = 'static';
    } catch (e) {
    }
});

$('body').on('hidden.bs.modal', '#userMissingFieldsCheckModal', function() {
    if (typeof handle_user_missing_data === typeof undefined)
        return;
    handle_user_missing_data.missing_data_modal_on_hide();
});

$('body').on('click', '#discussion_confirm_modal #go_to_discussion', function () {
    $('#discussion_confirm_modal').modal('hide');
});

$('body').on('click', '.show-report_links', function(e){
    e.preventDefault();
    var element = $(this);
    function is_set(value) {
        return (typeof value !== typeof undefined && value != '' && value != null && value != 0);
    }
    var report_file_id = element.data('id');
    var data_content = element.attr('data-content');
    if(is_set(report_file_id)){
        if(!is_set(data_content)){
            element.popover('destroy');
            element.find('.glyphicon.glyphicon-eye-open').fadeOut('normal', function(){
                element.find('.fa.fa-spinner').show();
                $.ajax({
                    url: '/dspace/getreportfilerepositorylinks/report_file_id/' + report_file_id,
                    dataType: 'json',
                    async: false,
                    success: function(data) {
                        if(data){
                            var links = '';
                            $.each(data.data, function(key, value){
                                links += '<a href="'+ value.link +'" target="_blank" class="btn btn-default btn-xs popovers repositories-popover" data-trigger="hover" data-placement="top" data-content="' + value.name + '" style="' +
                                    '    height: 22px; width: 28px;">' +
                                    '<img src="/graph/getimage/width/16/height/16/image/-repositories-' + value.logo + '" style="max-height: 16px; max-width: 16px;">' +
                                    '</a>';
                            });
                            element.attr('data-content', links);

                            element.popover({html: true});
                            element.find('.fa.fa-spinner').fadeOut('normal', function(){
                                element.find('.glyphicon.glyphicon-eye-open').show();
                                element.popover('show');
                                $('.repositories-popover').popover();
                            });
                        }
                    }
                });
            });
        } else {
            setTimeout(function () {
                $('.repositories-popover').popover();
            }, 100);
        }
    }
});

$('body').on('click', '.checkReportDiscussionUsage', function(e){
    e.preventDefault();
    var element = $(this);
    var report_file_id = element.data('id');
    var loaded = element.attr('data-loaded');
    if(loaded == 'false'){
            element.popover('destroy');
            element.find('.glyphicon-info-sign').fadeOut('normal', function(){
                element.find('.fa.fa-spinner').show();
                $.ajax({
                    url: checkDiscussionsUsage,
                    type: 'post',
                    data: {
                        discussions: report_file_id,
                        entity: 'report_file_download'
                    },
                    success: function (data, status) {
                        var content = '';
                        if (data.data) {
                            if (data.data.discussion_usage) {
                                content = 'The access to this file has been restricted by the author, if you want to contact the author please view current discussion <a href=\'javascript:void(0);\' data-id=\' ' + report_file_id + ' \'  data-entity=\'report_file_download\' class=\'StartDiscussion\'>here</a> or click view to see the metadata information on MELSPACE!';
                                element.attr('data-loaded', true);
                                element.removeAttr("disabled");
                                element.attr('data-discussion', data.discussion_id);
                            } else {
                                content = 'The access to this file has been restricted by the author, if you want to contact the author please start a discussion <a href=\'javascript:void(0);\'   data-id=\'' + report_file_id + '\' data-entity=\'report_file_download\' class=\'StartDiscussion\'>here</a> or click view to see the metadata information on MELSPACE!';
                            }

                            element.attr('data-content', content);
                            element.attr('data-loaded', true);
                            element.attr('data-discussion', data.data.discussion_id);
                            element.popover({html: true});
                            element.find('.fa.fa-spinner').fadeOut('normal', function () {
                                element.find('.glyphicon-info-sign').show();
                                element.popover('show');
                            });
                        } else {
                            element.popover('destroy');
                            element.find('.fa.fa-spinner').fadeOut('normal', function () {
                                element.find('.glyphicon-info-sign').show();
                                element.popover('show');
                            });
                        }
                    },
                    error: function (xhr, desc, err) {
                        element.popover('destroy');
                        element.find('.fa.fa-spinner').fadeOut('normal', function () {
                            element.find('.glyphicon-info-sign').show();
                            element.popover('show');
                        });
                    }
                });
            });
    }
});

$('body').on('click', '.user_select2_profiles_parent_user', function (e) {
    //If clicking on user_select2_profiles_parent_user or its children except links
    if ($(e.target).hasClass('user_select2_profiles_parent_user') || ($(e.target).parents('.user_select2_profiles_parent_user').length > 0 && !$(e.target).is('a'))) {
        $(this).parents('li[role=group]:first').find('ul:first li').mouseup();
    }
});

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function cleanStringValue(str) {
    if(typeof str =='string')
        return  str.replace(/[|&;$%@"<>()+,]/g, "");
    else
        return str;
}

function createDateUTC(date) {
    if (Array.isArray(date))
        date = date.join('-');

    if (date && date.length === 4 && !isNaN(parseInt(date))) //If the sent date is year only
        date = date + '-01-01';

    if (!date || date === '' || date == null)
        return null;
    if (date === 'today') {
        date = new Date();
        date = new Date(date - (-date.getTimezoneOffset()) * 60 * 1000);
    }
    if (typeof date === 'number')
        date = new Date(date)
    if (typeof date !== 'string')
        date = DateFormatter.formatDate(date, 'YYYY-MM-DD');
    let dateArray = date.split('-');
    return new Date(parseInt(dateArray[0]), parseInt(dateArray[1]) - 1, parseInt(dateArray[2]), 0, 0, 0);
}

var DateFormatter = {
    monthNames: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ],
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    formatDate: function (date, format) {
        var self = this;
        format = self.getProperDigits(format, /d+/gi, date.getDate());
        format = self.getProperDigits(format, /M+/g, date.getMonth() + 1);
        format = format.replace(/y+/gi, function (y) {
            var len = y.length;
            var year = date.getFullYear();
            if (len === 2)
                return (year + "").slice(-2);
            else if (len === 4)
                return year;
            return y;
        });
        format = self.getProperDigits(format, /H+/g, date.getHours());
        format = self.getProperDigits(format, /h+/g, self.getHours12(date.getHours()));
        format = self.getProperDigits(format, /m+/g, date.getMinutes());
        format = self.getProperDigits(format, /s+/gi, date.getSeconds());
        format = format.replace(/a/ig, function (a) {
            var amPm = self.getAmPm(date.getHours())
            if (a === 'A')
                return amPm.toUpperCase();
            return amPm;
        });
        format = self.getFullOr3Letters(format, /d+/gi, self.dayNames, date.getDay())
        format = self.getFullOr3Letters(format, /M+/g, self.monthNames, date.getMonth())
        return format;
    },
    getProperDigits: function (format, regex, value) {
        return format.replace(regex, function (m) {
            var length = m.length;
            if (length === 1)
                return value;
            else if (length === 2)
                return ('0' + value).slice(-2);
            return m;
        });
    },
    getHours12: function (hours) {
        return (hours + 24) % 12 || 12;
    },
    getAmPm: function (hours) {
        return hours >= 12 ? 'pm' : 'am';
    },
    getFullOr3Letters: function (format, regex, nameArray, value) {
        return format.replace(regex, function (s) {
            var len = s.length;
            if (len === 3)
                return nameArray[value].substr(0, 3);
            else if (len === 4)
                return nameArray[value];
            return s;
        });
    }
};

function generateReportFileDownloadAlert(button, report_file_id, show_alert, alertOpenClose) {
    if (!show_alert || report_file_id == null || report_file_id === '') {
        alertOpenClose('open');
        return;
    }
    let parent = button.parents('.portlet:first, .modal:first');
    if (parent.length === 0)
        parent = $('.page-content');
    if (parent.length === 0)
        parent = $('body');
    App.blockUI({
        target: parent,
        boxed: true
    });

    var generatedLink = validateRestictedFilesDownloadLinks + '/report_file_id/' + report_file_id;
    $.getJSON(generatedLink, function (data) {
        App.unblockUI(parent);
        if (data.result === 'denied') {
            App.alert({
                type: 'danger', // alert's type
                message: data.message, // alert's message
                closeInSeconds: 5, // auto close after defined seconds
            });
            return;
        }

        ReportFileDownloadAlert(data.result === 'alert', alertOpenClose);
    });
}

function ReportFileDownloadAlert(alert, callback){
    if(alert){
        bootbox.confirm({
            message: 'The access to the information you will access has been marked as RESTRICTED by the author.<br/>' +
            'Before you open the file you need to accept to hold all restricted information in trust and strict confidence.<br/>' +
            'You also accept that you will only use the information for the purposes required to fulfill reporting requirements, and will not use this information for any other purpose, or disclose it to any third party.<br/>' +
            'Do you accept?',
            buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },
            callback: function(result){
                if(result){
                    callback('open');
                } else {
                    callback('close');
                }
            }
        });
    } else {
        callback('open');
    }
}

