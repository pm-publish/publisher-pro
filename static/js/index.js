'use strict';

import { ArticleFeed, UserFeed, UserCard } from './articleFeed'
import { UserProfileController } from './myaccount'
import { View, PubSub, ListMenu, Server, Modal, LightBox } from './framework'
import { SigninModal } from './signinModal'
import { EventForm }   from './events'
import { Card } from './card'
import { Form } from './form'
import AdLoader from './advertising'
import {SubscribeForm} from './signup'


window.Acme = window.Acme || {};
window.Acme.UserProfileController = UserProfileController;
window.Acme.View.UserFeed = UserFeed;
window.Acme.ArticleFeed = ArticleFeed;
window.Acme.Usercard = UserCard;
window.Acme.Card = Card;
window.Acme.Form = Form;
window.Acme.listMenu = ListMenu;
window.Acme.lightBox = LightBox;
window.Acme.modal = Modal;
window.Acme.EventForm = EventForm;
window.Acme.server = Server;
window.Acme.PubSub = PubSub;
window.Acme.articleFeeds = {};
const ads = new AdLoader();
ads.LoadAds();



var layouts = {
    "signin": 'signinFormTmpl',
    "register": 'registerTmpl',
    "forgot": 'forgotFormTmpl',
    "spinner": 'spinnerTmpl',
    "expired": 'expiredNotice',
    "userPlan": 'userPlanMessage',
    "userPlanChange": 'userPlanOkCancel'
}

Acme.SigninView = new SigninModal('modal', 'signin-modal', layouts);

$('#signinBtn, #articleSigninBtn, .j-signin').on('click', function () {
    Acme.SigninView.render("signin", "Sign in");
});

$('a.j-register').on('click', function (e) {
    e.preventDefault();
    Acme.SigninView.render("register", "Register your interest");
});






$('.j-mcsubscribe').on('click', function (event) {
    var email = $('#' + $(event.currentTarget).data('input')).val();
    document.getElementById("mce-group[3]-" + $(event.currentTarget).data('type')).checked = true;
    $('#j-box-' + $(event.currentTarget).data('type')).addClass('d-none');
    $('#j-mcpopup-thankyou').text('You are signing up to the ' + $(event.currentTarget).data('title') + '.');
    $('#mce-EMAIL').val(email);
    $('#j-mcpopup').removeClass('d-none');
});

$('.j-mcmultisubscribe').on('click', function (event) {
    $("#j-box-3-0").addClass("d-none");
    $("#j-box-3-1").addClass("d-none");
    $("#j-box-3-2").addClass("d-none");
    $("#j-box-3-3").addClass("d-none");
    $('#j-mcpopup-thankyou').text('Thank you for signing up');
    $('#j-mcpopup-blurb').text("To unsubscribe, click the link in the email.");
    $('#j-mcpopup-cancel').text('CLOSE');
    $('#j-mcpopup-signup').addClass('d-none');
});

$('.j-mccancel').on('click', function () {
    $('#j-mcpopup').data('email', '');
    $('#j-mcpopup').addClass('d-none');
    $("#j-mccheckbox-3-0").prop("checked", false);
    $("#j-box-3-0").removeClass("d-none");
    $("#j-mccheckbox-3-1").prop("checked", false);
    $("#j-box-3-1").removeClass("d-none");
    $("#j-mccheckbox-3-2").prop("checked", false);
    $("#j-box-3-2").removeClass("d-none");
    $("#j-mccheckbox-3-3").prop("checked", false);
    $("#j-box-3-3").removeClass("d-none");
    $('#j-mcpopup-signup').removeClass('d-none');
    $('#j-mcpopup-cancel').html('CANCEL');
    $('#j-mcpopup-blurb').html("While you’re here would you like to sign up to any of our other email newsletters?");

});

$('.j-mcprosubscribe').on('click', function (event) {
    $('#j-mcpopup').removeClass('d-none');
});



















// var isMenuBroken, isMobile;
var sbCustomMenuBreakPoint = 1120;
var mobileView = 620;
var desktopView = 1119;
var scrollMetric = [$(window).scrollTop()];
var menu_top_foldaway = $("#menu-top-foldaway");
var menu_bottom_foldaway = $("#menu-bottom-foldaway");
var foldaway_search = false;

// isMenuBroken = function() {
//     if (window.innerWidth > sbCustomMenuBreakPoint) {
//         return false;
//     }
//     return true;
// };

// isMobile = function(){
//     if (window.innerWidth < mobileView) {
//         return true;
//     }
//     return false;
// };

var isDesktop = function () {
    if (window.innerWidth > desktopView) {
        return true;
    }
    return false;
};


var isScolledPast = function (position) {
    if (scrollMetric[0] >= position) {
        return true;
    }
    return false;
};



$('html').on('click', function (e) {
    $('.Acme-pulldown ul').hide();
});





var stickHeader = function () {
    if (isScolledPast(210)) {
        $("#topAddBlock").removeClass("fixadd");
        $("#topAddBlock").css({
            "position": "absolute",
            "top": "212px"
        });
        $(".menu-mobile").data('foldaway', true);


    } else {
        $("#topAddBlock").addClass("fixadd");
        $("#topAddBlock").css({
            "position": "",
            "top": ""
        });

    }
    return false;
};



Acme.HeaderMenu = function () {
    this.topMenu = $('#menu-top-foldaway');
    this.bottomMenu = $('#menu-bottom-foldaway');

    this.menu = $("#foldaway-panel");
    this.subscriptions = PubSub.subscribe({
        'Acme.headerMenu.listener': ["update_state"]
    });

    this.listeners = {
        "fixedMenu": function (data) {
            if (data.fixedMenu === 'hide') {
                this.hideFixed();
            } else {
                this.showFixed();
            }
        }
    }
}

Acme.HeaderMenu.prototype = new View();
Acme.HeaderMenu.constructor = Acme.HeaderMenu;
Acme.HeaderMenu.prototype.showFixed = function () {
    this.menu.addClass('showMenuPanel');
}
Acme.HeaderMenu.prototype.hideFixed = function () {
    menu_top_foldaway.addClass('u-hide');
    menu_bottom_foldaway.addClass('u-hide');
    this.menu.removeClass('showMenuPanel');
    $("#menu-foldaway").removeClass('o-close').addClass('o-hamburger');
}

Acme.headerMenu = new Acme.HeaderMenu();


var scrollUpMenu = function () {
    // var isMob = isMobile();
    if (isScolledPast(300) && isDesktop()) {
        Acme.headerMenu.showFixed();
    } else if (!foldaway_search) {
        Acme.headerMenu.hideFixed();
    }
}




//Onload and resize events
$(window).on("resize", function () {
    stickHeader();
    scrollUpMenu();
}).resize();

//On Scroll
$(window).scroll(function () {
    var direction = 'down';
    var scroll = $(window).scrollTop();
    if (scroll < scrollMetric[0]) {
        direction = 'up';
    }
    scrollMetric = [scroll, direction];
    stickHeader();
    scrollUpMenu();
});



$("#menu-foldaway").on("click", function (e) {
    $(e.target).toggleClass('o-hamburger').toggleClass('o-close');
    menu_top_foldaway.toggleClass('u-hide');
    menu_bottom_foldaway.toggleClass('u-hide');
    if (foldaway_search) {
        foldaway_search = false;
        $("li.menu-item-search-foldaway>ul.search-foldaway").removeAttr('style');
        $(".menuContainer > ul > li.menu-item-search-foldaway").removeClass('now-active');
    }
});

$(".menu-mobile, #mobile-search-close").on("click", function (e) {
    var thisMenuElem = $(this).parent('.sb-custom-menu');
    var overlay = $(".mobile-menu__overlay");
    // $(this).toggleClass("active");
    $('#mobile-menu').toggleClass("mobile-menu--active");

    $("body").toggleClass('acme-modal-active');

    overlay.animate({
        "opacity": "toggle"
    }, {
        duration: 500
    }, function () {
        overlay.fadeIn();
    });
    e.preventDefault();
});




// this search handler is for normal desktop header, locked header search handler below
$("#desktop-search").on("click", function (e) {
    if (window.innerWidth > sbCustomMenuBreakPoint) {

        var icon = $('#desktop-search > span:first-child');
        if (icon.hasClass('icon-search')) {
            icon.removeClass('icon-search').addClass('o-close');
        } else {
            icon.removeClass('o-close').addClass('icon-search');
        }
        $("#desktop-searchform").toggleClass('site-header-search--active');
        $("#menu-primary-menu").toggleClass('submenu--hidden');
        $("#desktop-header-search").focus();
    }
});


// locked header search handler
$("#locked-header-search-button").on("click", function (e) {
    if (window.innerWidth > sbCustomMenuBreakPoint) {

        var icon = $('#locked-header-search-button > span:first-child');
        if (icon.hasClass('icon-search')) {
            icon.removeClass('icon-search').addClass('o-close');
        } else {
            icon.removeClass('o-close').addClass('icon-search');
        }
        $("#locked-searchform").toggleClass('site-header-search--active');
        $("#menu-locked").toggleClass('submenu--hidden');

        $("#locked-header-search").focus();
    }
});





$(".menuContainer > ul > li.menu-item-search-foldaway").on("click", function (e) {
    if (!foldaway_search) { foldaway_search = true } else { foldaway_search = false };
    if (window.innerWidth > sbCustomMenuBreakPoint) {
        $(this).children("ul").stop(true, false).slideToggle(225);
        $(this).toggleClass('now-active');
        if (window.innerWidth > sbCustomMenuBreakPoint) {
            $("input#header-search-foldaway").focus();
        }
    }
});

$("li.menu-item-search").bind("mouseenter focus mouseleave", function () {
    if (window.innerWidth > sbCustomMenuBreakPoint) {
        $("input#header-search").focus();
        return false;
    }
});

$("li.menu-item-search-foldaway").bind("mouseenter focus mouseleave", function () {
    if (window.innerWidth > sbCustomMenuBreakPoint) {
        $("input#header-search-foldaway").focus();
        return false;
    }
});

//For accessibility
$(".sb-custom-menu > ul > li > a").focus(function (e) {
    if (window.innerWidth > sbCustomMenuBreakPoint) {
        $('ul.menu > li').children('ul.sub-menu').stop(true, true).slideUp('fast');
        $(this).parent().children('ul').stop(true, true).slideDown('fast');
        e.preventDefault();
    }
});


$('#profile').on('click', function (e) {
    $('#header__menu').toggleClass('Profile_Open');
    $('body').toggleClass('no_profile');
    e.preventDefault();
});

$('.bio-show-more').on('click', function (e) {
    e.preventDefault();
    var button = $(this);
    var arrow = button.find('span');
    arrow.toggleClass('down').toggleClass('up');
    var bio = button.siblings('p.bio');
    bio.toggle();
});

$('.j-recent-header').click(function (e) {
    if ($(this).hasClass('faded')) {
        $('.j-recent-header').toggleClass('faded');
        $('.j-recent-toggle').toggleClass('u-hide');
    }
});



$("img.lazyload").lazyload({
    effect: "fadeIn"
});


var cardHolder = '';
clearTimeout(cardHolder);
cardHolder = setTimeout((function () {
    $('.j-truncate').dotdotdot({
        watch: true
    });
}), 750);


window.Acme.scrollThumbs = function(elem) {
    if (elem.length === 0) {
        return;
    }
    var elem = $(elem);
    var elemWidth = elem.width();
    var container = elem.parent();
    var containerWidth = container.width();
    var scrollAmount = container.scrollLeft();
    var containerView = [scrollAmount, containerWidth + scrollAmount];

    var middle = (containerView[1] - containerView[0]) / 2 ;
    var middle = scrollAmount + middle;
    var elempos = elem[0].offsetLeft + elemWidth/2;

    if ( elempos > middle ) {
        var scroll = true;
        var scrollpos = scrollAmount + (elempos - middle);
    } else if ( elem[0].offsetLeft < middle ) {
        var scroll = true;
        var scrollpos = scrollAmount - (middle - elempos);
    }

    if (scroll) {
        container.animate({
            scrollLeft : scrollpos
        });
    }
}


window.Acme.scrollThumbsVertical = function(elem) {
    if (elem.length === 0) {
        return;
    }
    var elem = $(elem);
    var elemHeight = elem.height();
    var container = elem.parent();
    var containerHeight = container.height();
    var scrollAmount = container.scrollTop();
    var containerView = [scrollAmount, containerHeight + scrollAmount];

    var middle = (containerView[1] - containerView[0]) / 2 ;
    var middle = scrollAmount + middle;

    var elempos = elem[0].offsetTop + elemHeight/2;

    if ( elempos > middle ) {
        var scroll = true;
        var scrollpos = scrollAmount + (elempos - middle);
    } else if ( elem[0].offsetLeft < middle ) {
        var scroll = true;
        var scrollpos = scrollAmount - (middle - elempos);
    }

    if (scroll) {
        container.animate({
            scrollTop : scrollpos
        });
    }
}

window.Acme.scrollThumbsHorizontal = function(elem) {
    if (elem.length === 0) {
        return;
    }
    var elem = $(elem);
    var elemWidth = elem.width();
    var container = elem.parent();
    var containerWidth = container.width();
    var scrollAmount = container.scrollLeft();
    var containerView = [scrollAmount, containerWidth + scrollAmount];

    var middle = (containerView[1] - containerView[0]) / 2 ;
    var middle = scrollAmount + middle;
    var elempos = elem[0].offsetLeft + elemWidth/2;

    if ( elempos > middle ) {
        var scroll = true;
        var scrollpos = scrollAmount + (elempos - middle);
    } else if ( elem[0].offsetLeft < middle ) {
        var scroll = true;
        var scrollpos = scrollAmount - (middle - elempos);
    }

    if (scroll) {
        container.animate({
            scrollLeft : scrollpos
        });
    }
}


$("#owl-gallery-image").owlCarousel({
    items: 1,
    dots: false,
    nav: true,
    navText: [
        "",
        ""
    ]
});   



//this is used for the gallery template
$("#owl-gallery-article").owlCarousel({
    items: 1,
    thumbs: true,
    thumbsPrerendered: true,
    URLhashListener:true,
    startPosition: 'URLHash',
    pagination: true,
    dots: false,
    nav: true,
    navText: [
        "",
        ""
    ]
});  

function counter(event) {
    var element = event.target;
    var items = event.item.count;
    var item = event.item.index + 1;

    // it loop is true then reset counter from 1
    if (item > items) {
        item = item - items
    }
    $('#counter').html(item + " of " + items)
}

//sidebar function

function sidebarMenuOpen() {
    let getMenuClick = document.querySelector('.js-menu');
    getMenuClick.addEventListener('click', openMenuFunction);
    function openMenuFunction() {
        document.querySelector('.c-sidebarMenu').classList.add("sidebar-active");
        document.querySelector('body').classList.add("u-noscroll");
    }
}
sidebarMenuOpen();

function sidebarMenuClose() {
    let getMenuClick = document.querySelector('.js-closeMenu');
    getMenuClick.addEventListener('click', closeMenuFunction);
    function closeMenuFunction() {
        document.querySelector('.c-sidebarMenu').classList.remove("sidebar-active");
        document.querySelector('.body').classList.remove("u-noscroll");
    }
}

sidebarMenuClose();

$('.js-sideBarItem').on('click', function (e) {
    e.preventDefault();
    var getParentLi = $(this).closest('.js-sideBarList');
    if (getParentLi.hasClass('active')) {
        getParentLi.toggleClass('active');
    } else {
        getParentLi.siblings(".js-sideBarList").removeClass('active');
        getParentLi.addClass('active');
    }
});

$('body').not('.js-menu').on('click', function (e) {
    if (!$(e.target).is('.c-sidebarMenu, .c-sidebarMenu *') && !$(e.target).is('.js-menu, .js-menu *')) {
        $('.c-sidebarMenu').removeClass("sidebar-active");
        $('.body').removeClass("u-noscroll");
    }
});

setTimeout(function () {
    $(".c-article__main-content figure img").each(function() {
        var width = $(this).width() + 'px';
        var captionObj = $(this).closest('figure').find('figcaption');
        if(captionObj) {
            captionObj.css({'width': width, "display": "block"});
        }
    });
  },400);
  
  $(window).resize(function() {
    $(".c-article__main-content figure img").each(function() {
        var width = $(this).width() + 'px';
        var captionObj = $(this).closest('figure').find('figcaption');
        if(captionObj) {
            captionObj.css({'width': width, "display": "block"});
        }
    });
  })

function searchBox(containerCls, closeCls) {
    let mainSearchCont = document.querySelector(`.${containerCls}`);
    let mainSearchClose = document.querySelector(`.${closeCls}`);
    let mainSearchInput = document.querySelector('.c-searchWrapper_input');
    mainSearchCont.addEventListener('click', function() {
        this.parentElement.classList.contains('active') ? this.parentElement.classList.remove('active') : this.parentElement.classList.add('active');
    });

    mainSearchClose.addEventListener('click', function() {
        this.parentElement.parentElement.classList.contains('active') ? this.parentElement.parentElement.classList.remove('active') : this.parentElement.parentElement.classList.add('active');
        mainSearchInput.value = '';
    })

    $('body').not(`.${containerCls}`).on('click', function (e) {
        if (!$(e.target).is('.c-searchWrapper_box, .c-searchWrapper_box *') && !$(e.target).is('.js_mainSearchBox, .js_mainSearchBox *')) {
            $(`.${containerCls}`).closest('.c-searchWrapper').removeClass("active");
        }
    });
}

searchBox('js_mainSearchBox', 'js_closeSearchBox');


/* sticky header */

const nav = document.querySelector(".js_header");
const scrollUp = "scroll-up";
const scrollDown = "scroll-down";
let lastScroll = 0;

window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll >= 20) {
        nav.classList.add("c-header--sticky");
    } else {
        nav.classList.remove("c-header--sticky");
    }
    if (currentScroll <= 0) {
        nav.classList.remove(scrollUp);
        return;
    }

    if (currentScroll > lastScroll && !nav.classList.contains(scrollDown)) {
        // down
        nav.classList.remove(scrollUp);
        nav.classList.add(scrollDown);
    } else if (
        currentScroll < lastScroll &&
        nav.classList.contains(scrollDown)
    ) {
        // up
        nav.classList.remove(scrollDown);
        nav.classList.add(scrollUp);
    }
    lastScroll = currentScroll;
});

