document.addEventListener("DOMContentLoaded", function (event) {

    // Lazyload, dotdotdot and owlCarousel curently run externallly to webpack bundle

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

    $("#owl-gallery-image").owlCarousel({
        items: 1,
        thumbs: true,
        thumbsPrerendered: true,
        URLhashListener: true,
        startPosition: 'URLHash',
        pagination: true,
        dots: false,
        nav: true,
        onInitialized: counter,
        onTranslated: counter,
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

    $('.js-cus_acnt__showForm').on('click', function() {
        $(this).addClass('cus_acnt__hide');
        $(this).closest('.cus_acnt__infoBox__area').find('.cus_acnt__infoBox-dataGrid').addClass('cus_acnt__hide');
        $(this).closest('.cus_acnt__infoBox__area').find('.cus_acnt__infoBox-form').removeClass('cus_acnt__hide');
    });

    $('.js-cus_acnt__HideForm').on('click', function() {
        $('.js-cus_acnt__showForm').removeClass('cus_acnt__hide');
        $(this).closest('.cus_acnt__infoBox__area').find('.cus_acnt__infoBox-dataGrid').removeClass('cus_acnt__hide');
        $(this).closest('.cus_acnt__infoBox__area').find('.cus_acnt__infoBox-form').addClass('cus_acnt__hide');
    });

    $(".js-tableView tr .js-toggleTableRow").on("click", function(){
        $(this).closest('tr.view').next('.folded').toggleClass("open");
      });
});
