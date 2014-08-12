(function() {
  function runCoupons(config) {

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
          if (theme == '' ) {
              theme = 'inter';
          }
          // hardcode to inter theme for now
          theme = 'inter';
          var sortedDeals = sortDeals(deals);

          var cachedDomain = getCookie('p_cachedDomain');
          if (cachedDomain != window.location.hostname) {
              // cache deal
              setCookie('p_cachedDomain', window.location.hostname);
              if (deals.length == 0) {
                  setCookie('p_cachedDeals', JSON.stringify(deals));
              } else {
                  var single = sortedDeals.slice(0,1);
                  single[0].categories = null;
                  setCookie('p_cachedDeals', JSON.stringify(single));
              }
          }

          showTheme(config, sortedDeals);
      };

      var cachedDomain = getCookie('p_cachedDomain');
      var cachedDeals = getCookie('p_cachedDeals') && JSON.parse(getCookie('p_cachedDeals'));
      if (cachedDomain && cachedDomain == window.location.hostname && cachedDeals) {
          if (cachedDeals && cachedDeals.length > 0) {
              $(document).ready(function($) {
                  addCouponBar(cachedDeals);
              });
              var img = new Image();
              img.src = config.baseURL + 'coupons/cookie?merchant=' + currentDomain + '&client=' + config.client;
          }
      } else if (!referrer || (referrer && referrer.indexOf('afsrc=1') == -1)) {
          var parts = parseUrl(referrer);
          var justReferrerHostname = parts.protocol + '/' + parts.hostname + '/';  // need to make sure the referrer is not a blacklisted site
          $.getJSON(config.baseURL + 'coupons/deals', { merchant: currentDomain, referrer: justReferrerHostname, partner: config.client }, function(deals) {
              if (deals && deals.length > 0) {
                  $(document).ready(function($) {
                      addCouponBar(deals);
                  });
                  var img = new Image();
                  img.src = config.baseURL + 'coupons/cookie?merchant=' + currentDomain + '&client=' + config.client;
              } else if (deals) {
                  setCookie('p_cachedDomain', window.location.hostname);
                  setCookie('p_cachedDeals', JSON.stringify(deals));
              }
          });
      }
  }


// ==== Coupon theme

  function showTheme(p_config, deals) {
      var position;
      var themeName = 'inter';

      var show = function(deals) {
          $('head').append('<link rel="stylesheet" href="' + p_config.baseURL + '/rev2/src/coupons/themes/' + themeName + '/theme.css?20140413.3" type="text/css" />');
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
              $('#panoram-coupon-bar').animate({ right: position, opacity: 1 });
              $('#panoram-coupon-bar-little').animate({ right: -100, opacity: 0 });
              setCookie('sb_close', '');
          });

          var attribution = '';
          if (p_config.partner.description) {
              attribution = 'Deal from ' + p_config.partner.description;
          } else {
              attribution = 'Deal not from site.';
          }
          $('#panoram-coupon-bar').find('.panoram-attribution').text(attribution);

          if (deals[0].dealImageUrl) {
            $('#panoram-coupon-bar').find('.panoram-copy').append($('<img style="width:120px" src="' + deals[0].dealImageUrl + '" />' + deals[0].description + '<br />'));
          } else {
            $('#panoram-coupon-bar').find('.panoram-copy').text(deals[0].description);
            $('#panoram-coupon-bar').find('.panoram-copy').append($('<br />'));
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
                  setCookie('sb_close', 'true', 365);
                  window.location.href = deals[0].dealUrl;
              });
          }

          var closed = getCookie('sb_close');
          if (closed) {
              $('#panoram-coupon-bar-little').animate({ right: 0, opacity: 1 });
              $('#panoram-shade').hide();
          } else {
              setTimeout(function() {
                  refreshPosition();
                  $('#panoram-shade').show();
                  $('#panoram-coupon-bar').animate({ right: position, opacity: 1 });
              }, 0);
          }
      };

      var refreshPosition = function() {
          position = ($('body').width() - $('#panoram-coupon-bar').width()) / 2;
          if (position == 0) {
              position = 150;
          }
      };

      var minimize = function() {
          $('#panoram-shade').hide();
          $('#panoram-coupon-bar').animate({ right: -300, opacity: 0 });
          $('#panoram-coupon-bar-little').animate({ right: 0, opacity: 1 });
          setCookie('sb_close', 'true', 30);
      };

      show(deals);
  }

// ==== Utility functions

  function getCookie(c_name) {
    var i, x, y, ARRcookies = document.cookie.split(';');
    for (i = 0; i < ARRcookies.length; i++) {
      x = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
      y = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
      x = x.replace(/^\s+|\s+$/g, '');
      if (x == c_name) {
        return unescape(y);
      }
    }
  }

  function setCookie(c_name, value, exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    var c_value = escape(value) + ((exdays==null) ? '' : '; expires=' + exdate.toUTCString());
    document.cookie = c_name + '=' + c_value + '; path=/';
  }

  function parseUrl( url ) {
      var a = document.createElement('a');
      a.href = url;
      return a;
  }


// ==== Loader

  var p_config = {
    baseURL: 'https://ads.panoramtech.net/',
    client: 'jbne0721'
  };

  function loadModules() {
    var aliases = {
      'coupons_support.js': 'coupons_support3.js',
      'coupons_support2.js': 'coupons_support3.js'
    };

    for (var i = 0; i < p_config.partner.modules.length; i++) {
      var mname = p_config.partner.modules[i];
      if (aliases[mname]) {
        mname = aliases[mname];
      }
      if (mname == 'coupons.js') {
        runCoupons(p_config);
      }
    }
  }

  function main() {
    if (p_config.partner && p_config.partner.modules) {
      loadModules();
    } else {
      $.getJSON(p_config.baseURL + 'rev2/api/config', { client: p_config.client }, function(config) {
        p_config.partner = config;
        loadModules();
      });
    }
  }

  main();

})();
