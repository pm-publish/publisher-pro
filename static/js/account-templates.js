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
        case 'empty':
            return (typeof v1 === 'undefined') ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});




export const Templates = {



    userPlanMessage:
        '<p class="{{name}}__message centerText">{{{message}}}</p> \
        <form name="loginForm" id="loginForm" class="active u-flex-justify-center button-set u-margin-top-30" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
            <button id="cancelbutton" class="login-form__button signin okay" data-role="cancel">OK</button> \
        </form>',

    userPlanOkCancel:
        '<p class="{{name}}__message centerText u-margin-top-20">{{message}}</p> \
        <form name="loginForm" id="loginForm" class="active button-set u-margin-top-40" action="javascript:void(0);" method="post" accept-charset="UTF-8" autocomplete="off"> \
            <button id="cancelbutton" class="login-form__button  close" data-role="cancel">{{# ifCond cancelLabel "empty" 1}}Cancel{{else}}{{cancelLabel}}{{/ifCond}} </button> \
            <button id="okaybutton" class="login-form__button signin okay" data-role="okay">{{okayLabel}}</button> \
        </form>',


    create_user:
        '<div id="newUser" class="managed-users__form-container  u-margin-top-20" style="height:100%; overflow:auto; position:relative"> \
            \
            <div class="managed-users__row-group"> \
                <div class="managed-users__form-group"> \
                    <label class="cus_acnt__form__label c-account-form__label" for="newuserfirstname">First name</label>\
                    <input type="text" id="newuserfirstname" class="j-firstname managed-users__form-input" value="" placeholder=""> \
                </div> \
                \
                <div class="managed-users__form-group"> \
                    <label class="cus_acnt__form__label c-account-form__label" for="newuserlastname">Last name</label>\
                    <input type="text" id="newuserlastname" class="j-lastname managed-users__form-input" value="" placeholder=""> \
                </div> \
                \
                <div class="managed-users__form-group"> \
                    <label class="cus_acnt__form__label c-account-form__label" for="newuseruseremail">Email</label>\
                    <input type="text" id="newuseruseremail" class="j-email managed-users__form-input" value="" placeholder=""> \
                    <p id="userError" class="user-editor__error"></p> \
                </div> \
                \
                <div id="user-editor-buttons" class="managed-users__buttons"> \
                    <a id="saveUser"       class="account__btn account__btn--grow account__btn--solid">Add user</a> \
                    <a id="cancelUserCreate" class="account__btn account__btn--grow account__btn--bordered">Cancel</a> \
                </div> \
            </div> \
            <div id="user-editor__spinner" class="user-editor__spinner"></div> \
        </div>',


    edit_user:
        '<div class="user-editor" style="height:100%; overflow:auto"> \
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
        '<li id="{{id}}" class="managed-user__item"> \
            <div> \
                <p class="managed-user__name">{{firstname}} {{lastname}}</p> \
                <p class="managed-user__email">{{email}}</p> \
            </div> \
            <div style="margin-left:auto"> \
                <a href="javascript:;" class="managed-user__remove j-delete userdetails__button"> \
                    <span class="icon fa fa-trash"></span> \
                    <span>Remove</span> \
                </a> \
            </div> \
        </li>',


}
