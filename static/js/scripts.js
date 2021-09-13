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
            document.querySelector('.body').classList.add("no-scroll");
        }
    }
    sidebarMenuOpen();

    function sidebarMenuClose() {
        let getMenuClick = document.querySelector('.js-closeMenu');
        getMenuClick.addEventListener('click', closeMenuFunction);
        function closeMenuFunction() {
            document.querySelector('.c-sidebarMenu').classList.remove("sidebar-active");
            document.querySelector('.body').classList.remove("no-scroll");
        }
    }

    sidebarMenuClose();

});
