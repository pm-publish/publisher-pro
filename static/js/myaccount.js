import Handlebars from 'handlebars'
import { Server, Modal } from './framework'
// import { Templates } from './article-templates'
import { Templates } from './account-templates'
import { SigninModal }  from './signinModal'
import Card from './StripeCard'


export const UserProfileController = function(data)
{
    this.currentUserCount = data.currentUserCount || 0;
    this.planUserCount = data.planUserCount || 0;
    this.modal = new SigninModal('modal', 'signin-modal', {
        "spinner"       : 'spinnerTmpl',
        "userPlan"      : 'userPlanMessage',
        "userPlanChange" : 'userPlanOkCancel',
        "message"        : "message"
    } );

    this.stripekey = $('#stripekey').html();
    this.stripe = Stripe(this.stripekey);
    const StripeCard = new Card();
    this.card = StripeCard.get(this.stripe);

    this.events();
    this.userEvents();
    // this.listingEvents();
    // this.fetchEmailLists();
};


UserProfileController.prototype.getError = function(data) {
    let text = data;
    if (typeof data.error !== 'string') {
        for (var key in data.error) {
            text = text + data.error[key] + " ";
        } 
    }
    return text;
}

UserProfileController.prototype.showError = function(error) {
    const modal = new Modal('modal', 'signin-modal', {
        "userPlanChange" : 'userPlanOkCancel'
    });
    modal.render("userPlanChange", "Error", {"message" : error, "okayLabel": "OK"})
}

UserProfileController.prototype.deleteUser = function(e) {
    const self = this;
    const user = $(e.target).closest('li');
    const userid = user.attr("id");
    const requestData = { 
        id: userid, 
    };
    return Server.create(_appJsConfig.baseHttpPath + '/user/delete-managed-user', requestData).done(function(data) {

        if (data.success == 1) {
            if (self.currentUserCount > 0) {
                self.currentUserCount -= 1;
            }
            user.remove();
            var userCountElem = $('.js-usercount');
            userCountElem.text(self.currentUserCount + " of " + self.planUserCount);

            if (self.currentUserCount < self.planUserCount) {
                $('.js-addUserButton').removeClass('u-hide');
            }
        } else {
            const error = self.getError(data.error);
            self.showError(error);
        }
    }).fail((r)=> {
        $('#createUserErrorMessage').text(r.textStatus);
    });
 
};

UserProfileController.prototype.renderUser = function(parent, data, template) {

    var userTemp = template ? Handlebars.compile(template) : Handlebars.compile(Templates.managed_user);
    if (data.constructor != Array) {
        data = [data];
    }
    var html = '';
    for (var i = 0; i < data.length; i++) {
        html += userTemp(data[i]);
    }

    parent.empty().append(html);
};

UserProfileController.prototype.render = function(data) 
{
    var self = this;
    var data = data.users.users || data.users;
    var users = [];
    for (var i=0; i< data.length; i++) {
        users.push({
            firstname: data[i].firstname, 
            lastname:  data[i].lastname, 
            username:  data[i].username, 
            email: data[i].email,
            id: data[i].id
        });
    }
    self.renderUser(($('#mangedUsers')), users);
    self.userEvents();
};

UserProfileController.prototype.search = function(params) 
{   
    var self = this;
    this.fetch(params, 'search-managed-users').done(function(data) {
        self.render(data);
    });
};

UserProfileController.prototype.fetchUsers = function(params) 
{   
    var self = this;
    this.fetch(params, 'load-more-managed').done(function(data) {
        self.render(data);
    });
};

UserProfileController.prototype.fetch = function(params, url) 
{
    var url = _appJsConfig.appHostName + '/api/user/'+ url;
    return Server.fetch(url, params);
};



UserProfileController.prototype.userEvents = function() 
{
    var self = this;


    $('.j-edit').unbind().on('click', function(e) {

        var listelem = $(e.target).closest('li');
        var userid = listelem.attr("id");

        function getUserData(func) {
            return {
                firstname: listelem.find('.j-firstname')[func](), 
                lastname:  listelem.find('.j-lastname')[func](), 
                username:  listelem.find('.j-username')[func](), 
                useremail: listelem.find('.j-email')[func](),
            };
        };

        var data = getUserData("text");
        var userTemp = Handlebars.compile(Templates.edit_user);
        var html = userTemp(data);
        listelem.empty().append(html);

        $('#cancelUserCreate').on('click', function(e) {
            self.renderUser(listelem, data);
            self.userEvents();
        });

        $('#saveUser').on('click', function(e) {

            var requestData = getUserData("val");
            requestData.id = userid;

            Server.create(_appJsConfig.baseHttpPath + '/home/edit-managed-profile', requestData).done((data) => {
                if (data.success == 1) {
                    self.renderUser(listelem, requestData);
                    $('#addManagedUser').removeClass('hidden');
                    $('#createUserErrorMessage').text('');

                } else {
                    const error = self.getError(data.error);
                    self.showError(error);
                }
                self.userEvents();

            }).fail((r) => {
                self.showError(r.textStatus);
            });     
        });
    });  

    $('.j-delete').unbind().on('click', function(e) {


        const modal = new Modal('modal', 'signin-modal', {
            "userPlanChange" : 'userPlanOkCancel',
            "spinner"       : 'spinnerTmpl',
        });
        modal.setTemplates(Templates);


        modal.render("userPlanChange", "Are you sure?", {message: "Are you sure?", "okayLabel" : "Yes, delete user"})
            .done(function() {
                var spinner = new Modal('modal', 'swap-modal', {
                    "spinner"       : 'spinnerTmpl'
                } );                
                spinner.render("spinner", "");        
                self.deleteUser(e).done(() => {
                    spinner.closeWindow();
                });
            });
    });   
};




UserProfileController.prototype.events = function () 
{
    var self = this;

    $('#portal-session').on('click', function(e) {
        const button = $(this);
        button.text('Opening...');
        e.preventDefault();
        Server.create(_appJsConfig.baseHttpPath + '/api/paywall/user-portal-session').then(function(r){
            // console.log(r.session.url);
            if (typeof r.session.url !== 'undefined') {
                const blah = window.open(r.session.url, 'donations', '_blank');
                button.text("Manage my donations");
                // window.location = r.session.url;
                // window.location.replace(r.session.url)
            }
        });

    });


    $('#account-form__email').unbind().on('click', function(e) {
        var elem = $(e.target);
        
        var action = elem.is(':checked') 
            ? self.mailChimpUser 
                ? 'subscribe' : 'create'
            : 'unsubscribe';

        var ids = elem.val().split(':');

        requestData = {
            list    : ids[0],
            group   : ids[1],
            action  : action
        };

        Server.create(_appJsConfig.baseHttpPath + '/api/integration/mailchimp-subscription', requestData )
            .done(function(r) {
                if (r.success == 1) {
                    self.mailChimpUser = true;
                    // var msg = 'Succesfully ' + action + 'd ' + actionVerb + ' ' + self.emailLists[requestData['list']];
                    // $("#account-form__email").prepend('<p>' + msg + '</p>');
                }
            }).fail(function(e) {
                $('#createUserErrorMessage').text(e.errorText);
            });
    });

    $('#profile-form').submit( function(e){
        // NOTE this form also uses validation from the stripe subscribe form
        // purely by accident as the event listeners in THAT form are generic.

        // Will need to separate if it becomes a problem but for now it works
        // The following stops submit and adds error text

        e.preventDefault();
        var errorText = '';

        if ( $('#firstname').val() == '' ) {
            errorText += "First name cannot be empty. <br />";
        }
        if ( $('#lastname').val() == '' ) {
            errorText += "Last name cannot be empty.  <br />";
        }

        if ($('#email').val() == '' ) {
            errorText += "Email cannot be empty. ";
        }

        $("#account-form__errorText").html(errorText);
        
        if (!errorText) {
            var spinner = new Modal('modal', 'swap-modal', {
                "spinner"       : 'spinnerTmpl'
            } );                
            spinner.render("spinner", ""); 
            $(this).unbind('submit').submit()
        }
    });

    $('#message-close').on('click', function(e) {
        e.preventDefault();
        var parent = $(this).parent().remove();
    });

    $('#managed-user-search').on('submit', function(e) {
        e.preventDefault();
        var search = {};
        $.each($(this).serializeArray(), function(i, field) {
            search[field.name] = field.value;
        });
        self.search(search);
        // $('#user-search-submit').hide();
        $('#user-search-clear').removeClass('u-hide');

    });

    $('#user-search-clear').on('click', function(e) {
        e.preventDefault();
        self.fetchUsers();
        $('#managed-user-search-field').val('');
        $('#user-search-submit').show();
        $('#user-search-clear').addClass('u-hide');
    });



    $('#addManagedUser').on('click', function(e) {
        e.preventDefault()
        var userTemp = Handlebars.compile(Templates.create_user);
        var data = {
            firstname: "First name", 
            lastname:  "Last name", 
            username:  "Username", 
            useremail: "Email",
        };

        // var html = '<li id="newUser" class="user-editor user-editor__add"><p class="text-button">Add User</p>' + userTemp(data) + '</li>';
        var html = userTemp(data);

        $('#createManagedUser').append(html);
        $('#newuserfirstname').focus();
        $('#addManagedUser').addClass('u-hide');
        $('#addUserLabel').removeClass('u-hide');

        $('#nousers').addClass('u-hide');

        $('#saveUser').on('click', function(e) {
            $('#userError').text("");

            var requestData = { 
                firstname: $('#newuserfirstname').val(), 
                lastname:  $('#newuserlastname').val(), 
                username:  Math.floor(100000000 + Math.random() * 9000000000000000), 
                useremail: $('#newuseruseremail').val(),
            };
            
            var errorText = "";
            if (requestData.firstname === ""){
                errorText += "First name cannot be blank. ";
            }
            if (requestData.lastname === ""){
                errorText += "Last name cannot be blank. ";
            }
            if (requestData.useremail === ""){
                errorText += "Email cannot be blank. ";
            }
            if (errorText != "") {
                $('#userError').text(errorText);
                return;
            }
            
            
            var spinner = new Modal('modal', 'swap-modal');                
            spinner.render("spinnerTmpl"); 

            Server.create(_appJsConfig.baseHttpPath + '/user/create-paywall-managed-user', requestData).done((data) => {

                if (data.success == 1) {
                    location.reload(false);             
                } else {
                    spinner.closeWindow();
                    const error = self.getError(data.error);
                    self.showError(error);
                }
            }).fail((r) => {
                spinner.closeWindow();
                self.showError(r.textStatus);
            });
        });

        $('#cancelUserCreate').on('click', function(e) {
            $('#newUser').remove();
            $('#addManagedUser').removeClass('u-hide');
            $('#addUserLabel').addClass('u-hide');
            $('#createUserErrorMessage').text('');
        });
    });



    $('#cancelAccount').on('click', function(e) {
        e.preventDefault();
        // var listelem = $(e.target).closest('li');

        let status = 'cancelled';
        let title = "Are you sure?";
        let cancelLabel = "No";
        let buttonLabel = "Yes, cancel my plan";
        let message = "Please confirm you would like to cancel your plan";
        if ($(e.target).text().toLowerCase() == 'restart subscription') {
            title = "Welcome back!";
            message = "Please confirm you would like to reactivate this plan."
            buttonLabel = "Yes, restart my plan";
            status = 'paid'
        }
        const requestData = { 
            status: status, 
        };


        const modal = new Modal('modal', 'signin-modal', {
            "userPlanChange" : 'userPlanOkCancel'
        });
        modal.setTemplates(Templates);
        modal.render("userPlanChange", title, {"message" : message, "okayLabel": buttonLabel, "cancelLabel": cancelLabel})
            .done(function(r) {

                $('#dialog').parent().remove();

                var spinner = new Modal('modal', 'swap-modal', {
                    "spinner"       : 'spinnerTmpl'
                } );                
                spinner.render("spinner", ""); 


                
                Server.create(_appJsConfig.baseHttpPath + '/user/paywall-account-status', requestData).done((data) => {
                    
                    if (data.success == 1) {
                        window.location.reload(false);             
                    } else {
                        const error = self.getError(data.error);
                        let msg =  "It looks like your payment details are missing. Please add a payment method, click Update, then choose a new plan";
                        self.modal.render("userPlan", "Oops...", {message: error}); 
                        spinner.closeWindow();
                    }

                }).fail((r) => {
                    $('#createUserErrorMessage').text(r.textStatus);
                    spinner.closeWindow();
                });
       
            }); 
    });       


    $('.j-setplan').on('click', function(e) {
        e.stopPropagation();
        let modalTitle = "You've chosen a new plan";

        const modal = new Modal('modal', 'signin-modal', {
            "spinner": "spinnerTmpl",
            "userPlan" : 'userPlanMessage',
            "userPlanChange" : 'userPlanOkCancel'
        });
        modal.setTemplates(Templates);

        let elem = $(e.target);
        const newPlan = elem.parents('.j-plan-details');
        const currentPlan      = $('#currentPlanStats');
        const cardSupplied     = currentPlan.data("cardsupplied");

        const currentUserCount = +self.currentUserCount;
        const oldcost          = +currentPlan.data('currentcost');
        const oldPlanPeriod    = +currentPlan.data('currentplanperiodcount');
        const expDate          =  currentPlan.data('expiry');
        let olddays            =  currentPlan.data('currentperiod');
        const oldPlanType      =  currentPlan.data('currenttype');

        const planusers        = +newPlan.data('planusercount');
        const newcost          = +newPlan.data('plancost');
        const newPlanPeriod    = +newPlan.data('planperiodcount');
        let newdays            =  newPlan.data('planperiod');
        const newPlanType      =  newPlan.data('plantype');

        if (currentUserCount > 0 && currentUserCount > planusers) {
            modal.render("userPlan", "Oops...", {message: "You have too many users for that plan. Please remove <br /> them and try again"});
            return;
        }

        // if it looks like there's a bug where the price to change plan
        // seem ridiculously high, check the expiry date of the user!!!
        if (newdays == 'week')  {newdays = 7;}
        if (newdays == 'month') {newdays = 365/12;}
        if (newdays == 'year')  {newdays = 365;}
        if (olddays == 'week')  {olddays = 7;}
        if (olddays == 'month') {olddays = 365/12;}
        if (olddays == 'year')  {olddays = 365;}
        newdays = newdays * newPlanPeriod;
        olddays = olddays * oldPlanPeriod;
        const newplandailycost = newcost / newdays;
        const plandailycost = oldcost/olddays;


        let msg = "";
        let newCharge = 0;
        if ( newPlanType == 'article' || ( newPlanType == 'time' && oldPlanType === 'article') ) {
            newCharge = newcost / 100;
        }


        if (oldPlanType === 'signup' ) {
            newCharge = newcost / 100;
        }
        
        
        if (oldPlanType === 'time' && newPlanType === 'time' && newcost < oldcost ) {
            newCharge = 0;
        }
        const _MS_PER_DAY = 1000 * 60 * 60 * 24;
        function dateDiffInDays(a, b) {
            // Discard the time and time-zone information.
            const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
            const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
          
            return Math.floor((utc2 - utc1) / _MS_PER_DAY);
          }
          

        const expiryObj = new Date(expDate);
        const today = new Date();

        // var diffTime = Math.abs(today.getTime() - expiryObj.getTime());
        // var diffDays1 = Math.ceil(diffTime / (1000 * 3600 * 24)); 
        const diffDays = dateDiffInDays(today, expiryObj); 
        // var diffDays = moment(expDate).diff(moment(), 'days');

        // more expensive time base plan changes require a charge that is the difference in cost between the two
        if (oldPlanType === 'time' && newPlanType === 'time' && diffDays > 0) {
            if ((newplandailycost-plandailycost) * diffDays >= 0) {
                newCharge = Math.round((( newplandailycost-plandailycost) * diffDays) / 100 );
            }
        }

        let charge = "";
        if (newCharge > 0) {
            charge = newCharge.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            msg = "This plan change will cost $" + charge + ".";
        }

        if (oldPlanType === 'time' && newPlanType === 'article') {
            msg += " Articles will be counted from the end of your current paid period.";
        }

        if (oldPlanType === 'article' && newPlanType === 'article') {
            modalTitle = "Buy more articles";
            msg = "Please confirm your article purchase, this will cost $" + charge + ".";
        }

        if (oldPlanType === 'article' && newPlanType === 'time') {
            msg += " You will have access to your new plan immediately.";
        }

        if (newPlanType === 'signup') {
            msg = "Please confirm your plan change.";
        }


        if (cardSupplied === 'f' ) {
            msg = msg + "It looks like your payment details are missing. Please add a payment method, click Update, then choose a new plan";
            self.modal.render("userPlan", "Oops...", {message: msg});
            return;
        }

        const requestData = { 
            planid: newPlan.data('planid') 
        };



        const changeModal = new Modal('modal', 'signin-modal', {
            "userPlanChange" : 'userPlanOkCancel'
        });
        changeModal.setTemplates(Templates);

        const spinner = new Modal('modal', 'swap-modal', {
            "spinner" : 'spinnerTmpl'
        });
        changeModal.render("userPlanChange",  modalTitle, {"message" : msg, "okayLabel": "Purchase now"})
            .done(function() {
                $('#dialog').parent().remove();

                spinner.render("spinner");

                Server.create(_appJsConfig.baseHttpPath + '/user/change-paywall-plan', requestData).done((data) => {
                    if (data.success == 1) {
                        window.location.reload();
                    } else {
                        $('#dialog').parent().remove();
                        spinner.closeWindow();
                        const errorModal = new Modal('modal', 'signin-modal', {
                            "userPlanChange" : 'userPlanOkCancel'
                        });
                        errorModal.setTemplates(Templates);   
                        errorModal.render("userPlanMessage",  "Error", {"message" : data.error, "okayLabel": "poo"})
    
                    }

                }).fail((r) => {
                    spinner.closeWindow();
                    $('#createUserErrorMessage').text(r.textStatus);
                });
            }); 
    });





    $('.js-cus_acnt__showForm').on('click', function() {
        const $this = $(this);
        $this.addClass('u-hide');
        $this.closest('.infoBox__area').find('.infoBox-dataGrid').addClass('u-hide');
        $this.closest('.infoBox__area').find('.infoBox-form').removeClass('u-hide');

        self.stripeCardEvent();
    });

    $('.js-cus_acnt__HideForm').on('click', function() {
        const $this = $(this);
        $('.js-cus_acnt__showForm').removeClass('u-hide');
        $this.closest('.infoBox__area').find('.infoBox-dataGrid').removeClass('u-hide');
        $this.closest('.infoBox__area').find('.infoBox-form').addClass('u-hide');
    });

    $(".js-tableView tr .js-toggleTableRow").on("click", function(){
        var $elem = $(this);
        if ($elem.text().toLowerCase() === 'view features') {
            $elem.text('Hide features');
        } else {
            $elem.text('View features');
        }
        var fr = $(this).closest('tr.view').next('.folded');
        fr.toggleClass('active');
    });
};


UserProfileController.prototype.stripeCardEvent = function () {
    var self = this;
    var udform = document.getElementById('update-card-form');

    if (udform != null) {

        udform.addEventListener('submit', function(event) {
            event.preventDefault();

            self.modal.render("spinner", "Updating card...", {'class':'u-relative'});

            const errorElement = document.getElementById('card-errors');

            errorElement.textContent = '';
            // const stripe = Stripe(self.stripekey);
            self.stripe.createToken(self.card).then(function(result) {
                if (result.error) {
                    self.modal.closeWindow();

                    // Inform the user if there was an error
                    var errorElement = document.getElementById('card-errors');
                    errorElement.textContent = result.error.message;
                } else {
                    // Send the token to your server
                    const formdata = {"stripetoken":result.token.id}
                    Server.create(_appJsConfig.baseHttpPath + '/user/update-payment-details', formdata).done((r) => {
                        if (r.success === 1) {

                            self.modal.renderLayout('message', {message: "Success"});

                            location.reload();
                        } else {
                            self.modal.closeWindow();
                            self.showError(r.error);
                        }
                    });
                }
            });
        });
    }
}
