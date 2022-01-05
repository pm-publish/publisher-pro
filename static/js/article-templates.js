import Handlebars from 'handlebars'


Handlebars.registerHelper('labelFix', function (text) {
    if (!text) return "";
    if (text === "year") return "Annual";
    if (text === "month") return "Monthly";
    if (text === "one_time") return "One-time";
    // var label = text.split(/[ _]/).map(function(l) {
    //     return l[0].toUpperCase() + l.substring(1);
    // }).join(" ");

    return label;
});

Handlebars.registerHelper('priceFix', function (price) {
    if (!price) return "";
    price = parseInt(price);
    price = price / 100;
    return price;
});




Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

const cardTemplateTop =
    '<div class="{{cardClass}} {{containerClass}}"> \
    <a  itemprop="url" \
        href="{{url}}" \
        class="card-infoo swap" \
        draggable="{{draggable}}" \
        data-id="{{articleId}}" \
        data-position="{{position}}" \
        data-status="{{articleStatus}}" \
        data-social="0" \
        data-article-image="{{{imageUrl}}}" \
        data-article-text="{{title}}" \
        title="{{titleString}}"> \
    \
        <article class="{{cardType}}c-cards-view {{hasMediaClass}} {{articleStatus}}">';

const cardTemplateBottom =
    '</article>' +

    '{{#if userHasBlogAccess}}' +
    '<div class="btn_overlay articleMenu">' +
    '<button title="Hide" data-guid="{{guid}}" class="btnhide social-tooltip HideBlogArticle" type="button" data-social="0">' +
    '<i class="fa fa-eye-slash"></i><span class="hide">Hide</span>' +
    '</button>' +
    '<button onclick="window.location=\'{{{editUrl}}}\'; return false;" title="Edit" class="btnhide social-tooltip" type="button">' +
    '<i class="fa fa-edit"></i><span class="hide">Edit</span>' +
    '</button>' +
    '<button data-position="{{position}}" data-social="0" data-id="{{articleId}}" title="{{pinTitle}}" class="btnhide social-tooltip PinArticleBtn {{# ifCond isPinned "==" 1}} selected {{/ifCond}} " type="button" data-status="{{isPinned}}">' +
    '<i class="fa fa-thumb-tack"></i><span class="hide">{{pinText}}</span>' +
    '</button>' +
    '</div>' +
    "{{/if}}" +
    '</a>' +
    '</div>';




export const Templates = {
    modal:
        // style="scrolling == unusable position:fixed element might be fixing login for ios safari
        // also margin-top:10px
        '<div id="{{name}}" class="flex_col {{name}}"> \
    <div id="dialog" class="{{name}}__window"> \
        <div class="{{name}}__container centerContent" style="scrolling == unusable position:fixed element"> \
            <div class="{{name}}__header"> \
                <h2 class="{{name}}__title">{{{title}}}</h2> \
                <a class="{{name}}__close" href="#" data-behaviour="close"></a> \
            </div> \
            <div class="{{name}}__content-window" id="dialogContent" style="scrolling == unusable position:fixed element"></div> \
        </div> \
    </div> \
</div>',

// <p class="{{name}}__description">{{description}}</p> \

    donate_modal:
        // style="scrolling == unusable position:fixed element might be fixing login for ios safari
        // also margin-top:10px
        '<div id="{{name}}" class="flex_col {{name}}"> \
    <div id="dialog" class="{{name}}__window"> \
        <div class="{{name}}__container centerContent" style="scrolling == unusable position:fixed element"> \
            <div class="{{name}}__content-window" id="dialogContent" style="scrolling == unusable position:fixed element"></div> \
        </div> \
    </div> \
</div>',



    donations:
        '<div id="{{id}}" class="donate-form" data-selected="{{selected.price_id}}"> \
    \
    <div class="donate-form__header"> \
        <div class="donate-form__periods j-donation-periods" data-active="{{active}}"> \
            {{#each prices}} \
                {{#each this}} \
                    <button data-elem="period" data-period="{{@key}}" data-product="{{../../id}}" class="donate-form__period-button {{# ifCond @key "==" ../../active}} donate-form__period-button--active {{/ifCond}} u-margin-right-10">{{labelFix @key}}</button>\
                {{/each}} \
            {{/each}} \
        </div> \
        \
        <div class="donate-form__close"> \
            <a class="donate-form__close-icon o-close" href="#" data-behaviour="close"></a> \
        </div> \
    </div> \
    \
    \
    <img src="{{logo}}" class="donate-form__logo"/> \
    \
    <p class="donate-form__text">How much would you like to contribute{{intervalString}}?</p> \
    \
    {{#each prices}} \
        {{#each this}} \
            {{# ifCond @key "==" ../../active}} \
                <div data-key="{{@key}}" data-active="{{../../active}}" class="donate-form__prices j-donation-price"> \
                    {{#each this}} \
                        <button data-selected="{{../../../selected.price_id}}" class="donate-form__price-button  {{# ifCond ../../../selected.price_id "==" this.id}} donate-form__price-button--active {{/ifCond}}    u-margin-right-10" data-elem="price" data-product="{{this.product}}" data-price_id="{{this.id}}">${{this.price}}</button>\
                    {{/each}} \
                </div> \
            {{/ifCond}} \
        {{/each}} \
    {{/each}} \
    \
    <div class="donations__amount"> \
        <p class="donate-form__amount-label">or specify an amount</p> \
        <input class="donate-form__input donate-form__input--override j-donate-input" data-elem="input" data-product="{{id}}" type="text" value="{{priceFix selected.amount}}" placeholder="$NZD" /> \
    </div> \
    {{# ifCond selected.amount ">" 0}} \
        <button id="donate-button" class="donate-form__button" data-elem="checkout">Donate ${{priceFix selected.amount}}</button> \
    {{ else }} \
        <button id="donate-button" class="donate-form__button" data-elem="checkout">Donate</button> \
    {{/ifCond}} \
</div>',




    donateSignupForm:
        // <script> tag possible ios safari login fix
        '<div id="{{id}}" class="donate-form" data-selected="{{selected.price_id}}"> \
            <div class="donate-form__header"> \
                <div class="donate-form__close"> \
                    <a class="donate-form__close-icon o-close" href="#" data-behaviour="close"></a> \
                </div> \
            </div> \
            \
            <img src="{{logo}}" class="donate-form__logo"/> \
            \
            \
            {{# ifCond validEmail "==" null}} \
                <p class="{{class-prefix}}login-form__email-share j-email-text">Please enter your email address</p> \
            {{/ifCond}} \
            {{# ifCond validEmail "==" false}} \
                <p class="{{class-prefix}}login-form__email-share j-email-text">It looks like you don\'t have an account with us.<br />Would you like to continue with this email address?</p> \
            {{/ifCond}} \
            \
            {{# ifCond validEmail "==" true}} \
                <p class="{{class-prefix}}login-form__email-share j-email-text"><strong>It looks like you have an account with us!</strong> <br />Please enter your password to continue.</p> \
            {{/ifCond}} \
            \
            \
            {{# ifCond validEmail "==" false}} \
                <p class="{{class-prefix}}login-form__input-result {{class-prefix}}login-form__input-result--active j-email-result">{{user.username}}</p> \
            {{/ifCond}} \
            \
            <form name="loginForm" id="loginForm" class="{{class-prefix}}login-form active" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
                \
                <div class="{{class-prefix}}login-form__email-container j-email-container u-margin-top-20"> \
                    {{#if user.username }} \
                        {{#if validEmail }} \
                            <input id="loginPass" class="{{class-prefix}}login-form__input {{class-prefix}}login-form__input--password j-signin-password" type="password" name="password"  value="" /> \
                        {{/if}} \
                    {{/if}} \
                    \
                    {{# ifCond validEmail "==" null}} \
                        <input id="loginName" class="{{class-prefix}}login-form__input j-register-username" type="text" name="username" value="" placeholder="" /> \
                        <label for="loginName" class="{{class-prefix}}login-form__input-label input__label">Enter your email address</label> \
                    {{/ifCond}} \
                    \
                    {{# ifCond validEmail "==" false}} \
                        <button data-elem="" id="" type="" class="{{class-prefix}}login-form__button-back j-retry">Use a different email</button> \
                    {{/ifCond}} \
                </div> \
                \
                <div class="{{class-prefix}}login-form__error_text u-display-none j-error-text"></div> \
                \
                <div class="{{class-prefix}}login-form__button-container"> \
                    <button data-elem="" id="modal-signinBtn" type="submit" class="{{class-prefix}}login-form__button {{# ifCond validEmail "==" false}}{{class-prefix}}login-form__button--active{{/ifCond}} j-continue">Continue</button> \
                    <div id="email_spinner" class="{{class-prefix}}login-form__spinner u-display-none"><div class="spinner"></div></div> \
                </div> \
                \
                {{# ifCond validEmail "==" true}} \
                    <p class="{{class-prefix}}login-form__forgot  j-forgot" data-elem="forgot" data-behaviour="forgot" class="">Forgot password?</p> \
                {{/ifCond}} \
                <script>$("#loginName").on("input", function() {window.scrollBy(0,1);window.scrollBy(0,-1);})</script> \
            </form> \
        </div>',



    mailchimpList:
        '<div> \
            <input type="checkbox" class="email-subscription__checkbox" name="summary-email" id="mailchimp" value="{{listId}}:{{groupId}}" {{checked}}> \
            <label class="email-subscription__label">{{{name}}}</label> \
        </div>',

    pulldown:
        '<div id="{{ name }}" class="Acme-pulldown {{class}}"> \
            <p class="Acme-pulldown__selected-item"></p> \
            <span class="Acme-pulldown__span"></span> \
            <ul class="Acme-pulldown__list" data-key="{{ key }}"></ul> \
        </div>',


    create_user:
        '<div class="cus_acnt__infoBox-form" style="height:100%; overflow:auto; position:relative"> \
            <div class="cus_acnt__form__group"> \
                <label class="cus_acnt__form__label c-account-form__label" for="newuserfirstname">First name</label>\
                <input type="text" id="newuserfirstname" class="j-firstname cus_acnt__form__input" value="" placeholder="{{firstname}}"> \
            </div> \
            <div class="cus_acnt__form__group"> \
                <label class="cus_acnt__form__label c-account-form__label" for="newuserlastname">Last name</label>\
                <input type="text" id="newuserlastname" class="j-lastname cus_acnt__form__input" value="" placeholder="{{lastname}}"> \
            </div> \
            <div class="cus_acnt__form__group"> \
                <label class="cus_acnt__form__label c-account-form__label" for="newuseruseremail">Email</label>\
                <input type="text" id="newuseruseremail" class="j-email cus_acnt__form__input" value="" placeholder="{{useremail}}"> \
                <p id="userError" class="user-editor__error"></p> \
            </div> \
            <div id="user-editor-buttons" class="cus_acnt__form__group cus_acnt__form__btns"> \
                <a id="saveUser"       class="cus_acnt__btn cus_acnt__btn__solid">Add user</a> \
                <a id="cancelUserCreate" class="cus_acnt__btn cus_acnt__btn__bordered">cancel</a> \
            </div> \
            <div id="user-editor__spinner" class="user-editor__spinner"></div> \
        </div>',


    edit_user:
        '<div class="" style="height:100%; overflow:auto"> \
            <div class="user-editor__input-container u-float-left"> \
                <input type="text" id="newuserfirstname" class="j-firstname user-editor__input" value="{{firstname}}" placeholder="First name"> \
                <input type="text" id="newuserusername" class="j-username user-editor__input" value="{{username}}" placeholder="Email address"> \
                </div> \
            <div class="user-editor__input-container u-float-right"> \
                <input type="text" id="newuserlastname" class="j-lastname user-editor__input" value="{{lastname}}" placeholder="Last name"> \
            </div> \
            <div id="user-editor-buttons" class="user-editor__input-container u-float-right"> \
                <a id="cancelUserCreate" class="userdetails__button userdetails__button--delete u-float-right"></a> \
                <a id="saveUser"       class="userdetails__button userdetails__button--save u-float-right">Save</a> \
            </div> \
        </div>',

    managed_user:
        '<div class="u-float-left"> \
            <p class="userdetails__name"> \
                <span class="j-firstname">{{firstname}}</span> \
                <span class="j-lastname">{{lastname}}</span> \
            </p> \
            <p class="j-username userdetails__username">{{username}}</p> \
        </div>\
        <a class="j-delete userdetails__button userdetails__button--delete u-float-right"></a> \
        <a class="j-edit userdetails__button userdetails__button--edit u-float-right"></a>',


    managed_user:
        '<li id="{{id}}" class="userdetails {{cardClass}}"> \
            <div class="u-float-left"> \
                <p class="userdetails__name"> \
                    <span class="j-firstname">{{firstname}}</span> \
                    <span class="j-lastname">{{lastname}}</span> \
                </p> \
            </div>\
            <a class="j-delete userdetails__button userdetails__button--delete u-float-right"></a> \
            <a class="j-edit userdetails__button userdetails__button--edit u-float-right"></a> \
            <p class="j-email  userdetails__email u-float-right">{{email}}</p> \
        </li>',


    signinFormTmpl:
        // <script> tag possible ios safari login fix
        '<form name="loginForm" id="loginForm" class="{{class-prefix}}login-form active" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
        \
        <div class="signin-modal__form-group"> \
            <div class="signin-modal__form-group__label"> \
                <label class="signin-modal__form-group__label-text">Email address</label> \
            </div> \
            <input id="loginName" class="{{class-prefix}}login-form__input j-register-username" type="text" name="username" placeholder="Email" value="" /> \
        </div> \
        <div class="signin-modal__form-group"> \
            <div class="signin-modal__form-group__label"> \
                <label class="signin-modal__form-group__label-text">Password</label> \
                <p class="{{class-prefix}}login-form__forgot layout" data-layout="forgot" class="">Forgot password</p> \
            </div> \
            <input id="loginPass" class="{{class-prefix}}login-form__input j-signin-password" type="password" name="password" placeholder="******" value="" /> \
        </div> \
        \
        <div class="{{class-prefix}}login-form__error message active u-hide"> \
            <div class="{{class-prefix}}login-form__error_text">Invalid Email or Password</div> \
        </div> \
        \
        <div class="button-set"> \
            <button type="submit" class="login-form__button cancel">Cancel</button> \
            <button data-elem="signin" id="modal-signinBtn" type="submit" class="{{class-prefix}}login-form__button _btn _btn--red signin">Sign in</button> \
        </div> \
        \
        <script>$("#loginName").on("input", function() {window.scrollBy(0,1);window.scrollBy(0,-1);})</script>\
    </form>',







    registerTmpl:
        '<form name="registerForm" id="registerForm" class="active" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
        \
        <input id="name" class="" type="text" name="name" placeholder="Name"> \
        <input id="email" class="" type="email" name="email" placeholder="Email"> \
        \
        <div class="message active u-hide"> \
            <div class="account-modal__error_text">Done!</div> \
        </div> \
        \
        <button id="signinBtn" type="submit" class="_btn _btn--red register">Register</button> \
    </form>',


    forgotFormTmpl:
        '<form name="forgotForm" id="forgotForm" class="password-reset-form active" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
        <input type="hidden" name="_csrf" value="" /> \
        <p class="password-reset-form__p">Enter your email below and we will send you a link to set your password.</p> \
        <div class="signin-modal__form-group"> \
            <div class="signin-modal__form-group__label"> \
                <label class="signin-modal__form-group__label-text">Email address</label> \
            </div> \
            <input id="email" class="login-form__input password-reset-form__input" type="text" name="email" placehold="Email" value=""> \
        </div> \
        <div class="message active u-hide"> \
            <div class="login-form__error_text">No user with that email found.</div> \
        </div> \
        \
        <div class="button-set"> \
            <button id="forgotBtn" type="submit" class="login-form__button fullwidth _btn _btn--red forgot signin">Send email</button> \
        </div> \
    </form>',


    spinner:
        '<div id="{{name}}" class="flex_col {{name}}"> \
        <div id="dialog" class="{{name}}__window"> \
            <div class="{{name}}__header"> \
                <h2 class="{{name}}__title">{{title}}</h2> \
            </div> \
            <div class="{{name}}__content-window" id="dialogContent"></div> \
        </div> \
    </div>',


    spinner: 
    '<div id="{{name}}" class="flex_col {{name}}"> \
        <div id="dialog" class="{{name}}__window"> \
            <div class="{{name}}__header"> \
                <h2 class="{{name}}__title">{{title}}</h2> \
            </div> \
            <div class="{{name}}__content-window" id="dialogContent"></div> \
        </div> \
    </div>',
    

    spinnerTmpl: '<div class="spinner"></div>',

    subscribeTerms: '<p class="password-reset-form__p u-margin-bottom-20">Please agree to the terms of use.</p><div><form><button class="_btn _btn--red" data-role="okay">OK</button></form></div>',


    userPlanMessage:
        '<p class="{{name}}__message centerText">{{{message}}}</p> \
        <form name="loginForm" id="loginForm" class="active u-flex-justify-center button-set u-margin-top-30" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
            <button id="cancelbutton" class="login-form__button signin okay" data-role="cancel">OK</button> \
        </form>',

    userPlanOkCancel:
        '<p class="{{name}}__message centerText u-margin-top-20">{{message}}</p> \
        <form name="loginForm" id="loginForm" class="active button-set u-margin-top-40" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
            <button id="cancelbutton" class="login-form__button  close" data-role="cancel">Cancel</button> \
            <button id="okaybutton" class="login-form__button signin okay" data-role="okay">{{okayLabel}}</button> \
        </form>',




    systemCardTemplate:
        cardTemplateTop +
        '{{#if hasMedia}}\
            <figure class="{{cardType}}c-cards-view__media">\
                <img draggable="false" class="img-responsive {{imgClass}}" data-original="{{imageUrl}}" src="{{imageUrl}}" {{imgBackgroundStyle}}">\
            </figure>\
        {{/if}} \
        \
        <div class="{{cardType}}c-cards-view__container">\
            <div class="c-cards-view__container-topSection">\
                <div class="c-cards-view__category-wrap">\
                    <div class="c-cards-view__category">{{label}}</div>\
                </div>\
                <h2 class="c-cards-view__heading js-c-cards-view-heading j-truncate j-headline">{{{ title }}}</h2>\
                <p class="c-cards-view__description js-c-cards-view-description j-truncate j-excerpt">{{{ excerpt }}}</p>\
            </div>\
            <div class="c-cards-view__author">\
                <div class="c-cards-view__author-name">{{ author }}</div>\
                <div class="c-cards-view__time">{{date}}</div>\
            </div>' +
        cardTemplateBottom
};


// var systemCardTemplate = 
// '<div class="{{containerClass}} "> \
//     <a  itemprop="url" \
//         href="{{url}}" \
//         class="card swap {{hasMediaClass}}" \
//         draggable="true" \
//         data-id="{{articleId}}" \
//         data-position="{{position}}" \
//         data-social="0" \
//         data-article-image="{{{imageUrl}}}" \
//         data-article-text="{{title}}"> \
//         \
//         <article class="{{cardType}}c-cards-view">\
//             {{#if hasMedia}}\
//                 <figure class="{{cardType}}c-cards-view__media">\
//                     <img draggable="false" class="img-fluid lazyload" data-original="{{imageUrl}}" src="{{imageUrl}}" style="background-image:url("{{placeholder}}"")> \
//                 </figure>\
//             {{/if}} \
//         \
//             <div class="{{cardType}}c-cards-view__container content">\
//                     <div class="{{cardType}}c-cards-view__category category">{{label}}</div>\
//                     <h2 class="{{cardType}}c-cards-view__heading j-truncate">{{{ title }}}</h2class="">\
//                     <p class="{{cardType}}c-cards-view__description j-truncate">{{{ excerpt }}}</p>\
//                     <div class="{{cardType}}c-cards-view__author-name author">\
//                         <img src="{{profileImg}}" class="img-circle">\
//                         <p class="">{{ createdBy.displayName }}</p>\
//                     </div>\
//             </div>\
//         </article>'+

//         '{{#if userHasBlogAccess}}'+
//             '<div class="btn_overlay articleMenu">'+
//                 '<button title="Hide" data-guid="{{guid}}" class="btnhide social-tooltip HideBlogArticle" type="button" data-social="0">'+
//                     '<i class="fa fa-eye-slash"></i><span class="hide">Hide</span>'+
//                 '</button>'+
//                 '<button onclick="window.location=\'{{{editUrl}}}\'; return false;" title="Edit" class="btnhide social-tooltip" type="button">'+
//                     '<i class="fa fa-edit"></i><span class="hide">Edit</span>'+
//                 '</button>'+
//                 '<button data-position="{{position}}" data-social="0" data-id="{{articleId}}" title="{{pinTitle}}" class="btnhide social-tooltip PinArticleBtn" type="button" data-status="{{isPinned}}">'+
//                     '<i class="fa fa-thumb-tack"></i><span class="hide">{{pinText}}</span>'+
//                 '</button>'+
//             '</div>'+
//         "{{/if}}"+
//     '</a>'+
// '</div>';








// Acme.systemCardTemplate = 
//     cardTemplateTop + 
//         '{{#if hasMedia}}\
//             <figure class="{{cardType}}c-cards-view__media">\
//                 <img draggable="false" class="img-responsive {{imgClass}}" data-original="{{imageUrl}}" src="{{imageUrl}}" {{imgBackgroundStyle}}">\
//             </figure>\
//         {{/if}} \
//         \
//         <div class="{{cardType}}c-cards-view__container content">\
//             <div class="{{cardType}}c-cards-view__category category">{{label}}</div>\
//             <h2 class="{{cardType}}c-cards-view__heading j-truncate">{{{ title }}}</h2>\
//             <p class="{{cardType}}c-cards-view__description j-truncate">{{{ excerpt }}}</p>\
//             <div class="{{cardType}}c-cards-view__author-name author">\
//                 <img src="{{profileImg}}" class="img-circle">\
//                 <p>{{ createdBy.displayName }}</p>\
//             </div>\
//         </div>' + 
//     cardTemplateBottom;







// var socialCardTemplate =  '<div class="{{containerClass}}">' +
//                                 '<a href="{{social.url}}" target="_blank" class="card swap card__{{social.source}} {{#if social.hasMedia}} withImage__content {{else }} without__image {{/if}} {{videoClass}}" data-id="{{socialId}}" data-position="{{position}}" data-social="1" data-article-image="{{{social.media.path}}}" data-article-text="{{social.content}}">'+
//                                     '{{#if social.hasMedia}}'+
//                                     '<div class="card-image lazyload" data-original="{{social.media.path}}" style="background-image:url(https://placeholdit.imgix.net/~text?txtsize=33&txt=Loading&w=450&h=250)">'+
//                                         '<div class="play_icon video-player" data-source="{{social.source}}" data-url="{{social.media.videoUrl}}" data-poster="{{social.media.path}}"></div>'+
//                                     '</div>' +
//                                     '{{/if}}'+
//                                     '<div class="content-section">' +
//                                         '<div class="title-section">' +
//                                             '<span>{{social.source}}</span>' +
//                                             '<div class="card-icon"></div>' +
//                                         '</div>' +
//                                         '<p class="description" id="updateSocial{{socialId}}" data-update="0">{{{social.content}}}</p>' +
//                                         '<div class="caption_bottom">' +
//                                             '<div class="author_name">{{social.user.name}}</div>' +
//                                             '<div class="post_date">{{social.publishDate}}</div>' +
//                                         '</div>' +
//                                     '</div>' +
//                                     '{{#if userHasBlogAccess}}'+
//                                         '<div class="btn_overlay articleMenu">'+
//                                             '<button title="Hide" data-guid="{{social.guid}}" class="btnhide social-tooltip HideBlogArticle" type="button" data-social="1">'+
//                                                 '<i class="fa fa-eye-slash"></i><span class="hide">Hide</span>'+
//                                             '</button>'+
//                                             '<button title="Edit" class="btnhide social-tooltip editSocialPost" type="button" data-url="/admin/social-funnel/update-social?guid={{blog.guid}}&socialguid={{social.guid}}">'+
//                                             '<i class="fa fa-edit"></i><span class="hide">Edit</span>'+
//                                             '</button>'+
//                                             '<button data-position="{{position}}" data-social="1" data-id="{{socialId}}" title="{{pinTitle}}" class="btnhide social-tooltip PinArticleBtn" type="button" data-status="{{isPinned}}">'+
//                                                 '<i class="fa fa-thumb-tack"></i><span class="hide">{{pinText}}</span>'+
//                                             '</button>'+
//                                         '</div>'+
//                                     '{{/if}}'+   
//                                 '</a>' +
//                             '</div>';