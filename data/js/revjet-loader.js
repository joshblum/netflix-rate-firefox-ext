(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                throw new Error("Cannot find module '" + o + "'")
            }
            var f = n[o] = {
                exports: {}
            };
            t[o][0].call(f.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, f, f.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [
        function(require, module, exports) {
            require('./coupons/themes/inter');
            //require('./coupons/themes/redbar');
            require('./coupons/themes/searsbox');

            function runCoupons(config) {
                window.panoram_partner_description = config.partner.description;
                window.panoram_partner_id = config.client;

                var currentDomain = location.hostname;
                var referrer = document.referrer;

                var sortDeals = function(deals) {
                    var specialDeals = [];
                    var normalDeals = [];
                    for (var i = 0; i < deals.length; i++) {
                        if (deals[i].merchantPageStaffPick) {
                            specialDeals.push(deals[i]);
                        } else {
                            normalDeals.push(deals[i]);
                        }
                    }
                    return specialDeals.concat(normalDeals);
                };

                var addCouponBar = function(deals) {
                    var theme = config.partner.theme;
                    if (theme == '') {
                        theme = 'inter';
                    }
                    // hardcode to inter theme for now
                    theme = 'inter';
                    var theme = require('./coupons/themes/' + theme);
                    var sortedDeals = sortDeals(deals);

                    var cachedDomain = getCookie('p_cachedDomain');
                    if (cachedDomain != window.location.hostname) {
                        // cache deal
                        setCookie('p_cachedDomain', window.location.hostname);
                        if (deals.length == 0) {
                            setCookie('p_cachedDeals', JSON.stringify(deals));
                        } else {
                            var single = sortedDeals.slice(0, 1);
                            single[0].categories = null;
                            setCookie('p_cachedDeals', JSON.stringify(single));
                        }
                    }

                    theme(sortedDeals);
                };

                var setCookie = function(c_name, value) {
                    var exdate = new Date();
                    exdate.setHours(exdate.getHours() + 1);
                    var c_value = escape(value) + "; expires=" + exdate.toUTCString();
                    document.cookie = c_name + "=" + c_value + "; path=/";
                };

                var getCookie = function(c_name) {
                    var c_value = document.cookie;
                    var c_start = c_value.indexOf(" " + c_name + "=");
                    if (c_start == -1) {
                        c_start = c_value.indexOf(c_name + "=");
                    }
                    if (c_start == -1) {
                        c_value = null;
                    } else {
                        c_start = c_value.indexOf("=", c_start) + 1;
                        var c_end = c_value.indexOf(";", c_start);
                        if (c_end == -1) {
                            c_end = c_value.length;
                        }
                        c_value = unescape(c_value.substring(c_start, c_end));
                    }
                    return c_value;
                }

                var cachedDomain = getCookie('p_cachedDomain');
                var cachedDeals = JSON.parse(getCookie('p_cachedDeals'));
                if (cachedDomain && cachedDomain == window.location.hostname && cachedDeals) {
                    if (cachedDeals && cachedDeals.length > 0) {
                        $(document).ready(function($) {
                            addCouponBar(cachedDeals);
                        });
                        var img = new Image();
                        img.src = config.baseURL + 'coupons/cookie?merchant=' + currentDomain + '&client=' + window.panoram_partner_id;
                    }
                } else if (!referrer || (referrer && referrer.indexOf('afsrc=1') == -1)) {
                    $.getJSON(config.baseURL + 'coupons/deals', {
                        merchant: currentDomain,
                        referrer: referrer,
                        partner: window.panoram_partner_id
                    }, function(deals) {
                        if (deals && deals.length > 0) {
                            $(document).ready(function($) {
                                addCouponBar(deals);
                            });
                            var img = new Image();
                            img.src = config.baseURL + '<coupons/cookie?merchant=' + currentDomain + '&client=' + window.panoram_partner_id;
                        } else if (deals) {
                            setCookie('p_cachedDomain', window.location.hostname);
                            setCookie('p_cachedDeals', JSON.stringify(deals));
                        }
                    });
                }
            }

            module.exports = runCoupons;

        }, {
            "./coupons/themes/inter": 2,
            "./coupons/themes/searsbox": 3
        }
    ],
    2: [
        function(require, module, exports) {
            var position;
            var themeName = 'inter';

            var show = function(deals) {
                $('head').append('<link rel="stylesheet" href="' + window.p_config.baseURL + '/rev2/src/coupons/themes/' + themeName + '/theme.css?20140413.3" type="text/css" />');
                $('body').append('<div id="panoram-shade"></div><div id="panoram-coupon-bar"><div class="panoram-title"></div><a class="panoram-close">&#x2715</a><div class="panoram-copy"></div><div class="panoram-attribution"></div></div>');
                $('body').append('<div id="panoram-coupon-bar-little">1</div>');

                $('#panoram-coupon-bar').find('.panoram-close').click(function() {
                    var img = new Image();
                    $(img).attr('src', deals[0].dealUrl);

                    minimize();
                });
                //$('#panoram-shade').click(minimize);

                $('#panoram-coupon-bar-little').click(function() {
                    refreshPosition();
                    $('#panoram-shade').show();
                    $('#panoram-coupon-bar').animate({
                        right: position,
                        opacity: 1
                    });
                    $('#panoram-coupon-bar-little').animate({
                        right: -100,
                        opacity: 0
                    });
                    setCookie('sb_close', '');
                });

                var attribution = '';
                if (window.panoram_partner_description) {
                    attribution = 'Deal from ' + window.panoram_partner_description;
                } else {
                    attribution = 'Deal not from site.';
                }
                $('#panoram-coupon-bar').find('.panoram-attribution').html(attribution);

                if (deals[0].dealImageUrl) {
                    $('#panoram-coupon-bar').find('.panoram-copy').html('<img src="' + deals[0].dealImageUrl + '" />' + deals[0].description + '<br />');
                } else {
                    $('#panoram-coupon-bar').find('.panoram-copy').html(deals[0].description + '<br />');
                }

                $('#panoram-coupon-bar').find('.panoram-logo').css('background-image', 'url(' + deals[0].merchantImageUrl + ')');
                $('#panoram-coupon-bar').find('.panoram-title').text(deals[0].title);

                if (deals[0].couponCode.length > 0) {
                    var code = $('<div class="panoram-get-code">GET CODE</div>');
                    $('#panoram-coupon-bar').find('.panoram-copy').append(code);
                    code.click(function() {
                        var img = new Image();
                        $(img).attr('src', deals[0].dealUrl);

                        $('#panoram-coupon-bar').find('.panoram-get-code').remove();

                        var code = $('<div class="panoram-show-code">' + deals[0].couponCode + '</div>');
                        $('#panoram-coupon-bar').find('.panoram-copy').append(code);

                    });
                } else {
                    var code = $('<div class="panoram-get-code">CHECK OUT DEAL</div>');
                    $('#panoram-coupon-bar').find('.panoram-copy').append(code);
                    code.click(function() {
                        window.location = deals[0].dealUrl;
                    });
                }

                var closed = getCookie('sb_close');
                if (closed) {
                    $('#panoram-coupon-bar-little').animate({
                        right: 0,
                        opacity: 1
                    });
                    $('#panoram-shade').hide();
                } else {
                    setTimeout(function() {
                        refreshPosition();
                        $('#panoram-shade').show();
                        $('#panoram-coupon-bar').animate({
                            right: position,
                            opacity: 1
                        });
                    }, 0);
                }
            };

            var getCookie = function(c_name) {
                var i, x, y, ARRcookies = document.cookie.split(';');
                for (i = 0; i < ARRcookies.length; i++) {
                    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
                    y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
                    x = x.replace(/^\s+|\s+$/g, '');
                    if (x == c_name) {
                        return unescape(y);
                    }
                }
            };

            var setCookie = function(c_name, value, exdays) {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + exdays);
                var c_value = escape(value) + ((exdays == null) ? '' : '; expires=' + exdate.toUTCString());
                document.cookie = c_name + '=' + c_value + '; path=/';
            };

            var refreshPosition = function() {
                position = ($('body').width() - $('#panoram-coupon-bar').width()) / 2;
                if (position == 0) {
                    position = 150;
                }
            };

            var minimize = function() {
                $('#panoram-shade').hide();
                $('#panoram-coupon-bar').animate({
                    right: -300,
                    opacity: 0
                });
                $('#panoram-coupon-bar-little').animate({
                    right: 0,
                    opacity: 1
                });
                setCookie('sb_close', 'true', 30);
            };

            module.exports = show;

        }, {}
    ],
    3: [
        function(require, module, exports) {
            var themeName = 'searsbox';

            var show = function(deals) {
                // remove the actual searsbox

                $('#loc_shcModal').fadeOut();

                $('head').append('<link rel="stylesheet" href="' + window.p_config.baseURL + '/rev2/src/coupons/themes' + themeName + '/theme.css?20140107.0" type="text/css" />');
                $('body').append('<div id="panoram-coupon-bar"><div class="panoram-title"></div><a class="panoram-close">&#x2715</a><div class="panoram-copy"></div><div class="panoram-attribution"></div></div>');
                $('body').append('<div id="panoram-coupon-bar-little">1</div>');
                $('#panoram-coupon-bar').find('.panoram-close').click(function() {
                    $('#panoram-coupon-bar').animate({
                        right: -300,
                        opacity: 0
                    });
                    $('#panoram-coupon-bar-little').animate({
                        right: 0,
                        opacity: 1
                    });
                    setCookie('sb_close', 'true', 365);
                });

                $('#panoram-coupon-bar-little').click(function() {
                    $('#panoram-coupon-bar').animate({
                        right: 50,
                        opacity: 1
                    });
                    $('#panoram-coupon-bar-little').animate({
                        right: -100,
                        opacity: 0
                    });
                    setCookie('sb_close', '');
                });

                var attribution = '';
                if (window.panoram_partner_description) {
                    attribution = 'Deal from ' + window.panoram_partner_description;
                } else {
                    attribution = 'Deal not from site.';
                }
                $('#panoram-coupon-bar').find('.panoram-attribution').html(attribution);

                $('#panoram-coupon-bar').find('.panoram-copy').html(deals[0].description + '<br />');

                $('#panoram-coupon-bar').find('.panoram-logo').css('background-image', 'url(' + deals[0].merchantImageUrl + ')');

                if (deals[0].couponCode.length > 0) {
                    $('#panoram-coupon-bar').find('.panoram-title').html('COUPON AVAILABLE');
                    var code = $('<div class="panoram-get-code">GET CODE</div>');
                    $('#panoram-coupon-bar').find('.panoram-copy').append(code);
                    code.click(function() {
                        var img = new Image();
                        $(img).attr('src', deals[0].dealUrl);

                        $('#panoram-coupon-bar').find('.panoram-get-code').remove();

                        var code = $('<div class="panoram-show-code">' + deals[0].couponCode + '</div>');
                        $('#panoram-coupon-bar').find('.panoram-copy').append(code);
                    });
                } else {
                    $('#panoram-coupon-bar').find('.panoram-title').html('DEAL AVAILABLE');
                    var code = $('<div class="panoram-get-code">CHECK OUT DEAL</div>');
                    $('#panoram-coupon-bar').find('.panoram-copy').append(code);
                    code.click(function() {
                        window.location = deals[0].dealUrl;
                    });
                }

                var closed = getCookie('sb_close');
                if (closed) {
                    $('#panoram-coupon-bar-little').animate({
                        right: 0,
                        opacity: 1
                    });
                } else {
                    $('#panoram-coupon-bar').animate({
                        right: 50,
                        opacity: 1
                    });
                }
            };

            var getCookie = function(c_name) {
                var i, x, y, ARRcookies = document.cookie.split(';');
                for (i = 0; i < ARRcookies.length; i++) {
                    x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
                    y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
                    x = x.replace(/^\s+|\s+$/g, '');
                    if (x == c_name) {
                        return unescape(y);
                    }
                }
            };

            var setCookie = function(c_name, value, exdays) {
                var exdate = new Date();
                exdate.setDate(exdate.getDate() + exdays);
                var c_value = escape(value) + ((exdays == null) ? '' : '; expires=' + exdate.toUTCString());
                document.cookie = c_name + '=' + c_value + '; path=/';
            };

            module.exports = show;

        }, {}
    ],
    4: [
        function(require, module, exports) {
            // Require dependencies
            // load configuration
            // load pertinent modules

            require('./coupons.js');
            //require('./coupons_support3.js');
            //require('./search_support.js');
            //require('./text_support.js');
            //require('./rvo_support.js');

            if (!window.p_config) {
                window.p_config = {
                    baseURL: 'https://ads.panoramtech.net/',
                    client: 'jbne0721'
                };
            }

            function loadModules() {
                var aliases = {
                    'coupons_support.js': 'coupons_support3.js',
                    'coupons_support2.js': 'coupons_support3.js'
                };

                for (var i = 0; i < window.p_config.partner.modules.length; i++) {
                    var mname = window.p_config.partner.modules[i];
                    if (aliases[mname]) {
                        mname = aliases[mname];
                    }
                    try {
                        require('./' + mname)(window.p_config);
                    } catch (e) {}
                }
            }

            function main() {
                if (window.p_config.partner && window.p_config.partner.modules) {
                    loadModules();
                } else {
                    $.getJSON(window.p_config.baseURL + 'rev2/api/config', {
                        client: window.p_config.client
                    }, function(config) {
                        window.p_config.partner = config;
                        loadModules();
                    });
                }
            }

            main();

        }, {
            "./coupons.js": 1
        }
    ]
}, {}, [4])
