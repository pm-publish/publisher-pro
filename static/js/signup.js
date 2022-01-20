// Create a Stripe client
import { Form, Validators } from './form'

import { Modal, Server } from './framework'
import Card from './StripeCard'

function verifyCaptcha(token) {
    recaptcha_response = token;
    Acme.subscribe.submit(e);
}

export const SubscribeForm = function(id, user) {
    
    this.botTimer = 0;
    this.id = id || null;
    this.parent = Form.prototype;
    this.code = false;

    this.data = {
        "username": this.random(15),
    };


    this.errorFields = [];

    this.validateRules = {
        "verifypassword"    : ["notEmpty"],
        "firstname"         : ["notEmpty"], 
        "lastname"          : ["notEmpty"], 
        "password"          : ["notEmpty"],
        "email"             : ["notEmpty"], 
        "terms"             : ["isTrue"],    
    };

    var trial = $('#trial').val();
    this.data['plantype'] = $('#plantype').val();

    if (trial == "1" && this.data.plantype === 'time') {
        this.data['trial'] = 'true';
        this.validateRules['changeterms'] = ["isTrue"];
    }
    if ($("#code-redeem").length > 0) {
        this.code = true;
        delete this.validateRules.terms;
        delete this.validateRules.changeterms;
    }

    this.validateFields = Object.keys(this.validateRules);
    this.stripeSetup();
    this.loadData();
    this.events();
};



SubscribeForm.prototype = new Form(Validators);
SubscribeForm.constructor = SubscribeForm;
SubscribeForm.prototype.stripeSetup = function () {
    var self = this;
    var stripekey = $('#stripekey').html();
    this.stripe = Stripe(stripekey);
    const StripeCard = new Card();
    this.card = StripeCard.get(this.stripe);

    setInterval(function(){
        self.botTimer = self.botTimer + 1;
    }, 1000);
}
SubscribeForm.prototype.random = function(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
SubscribeForm.prototype.render = function(checkTerms) 
{
    this.clearInlineErrors();
    this.addInlineErrors();
    if (checkTerms) {
        if (!this.data.terms || (this.data.trial === 'true' && !this.data.changeterms)) {
            this.confirmView = new Modal('modal', 'signin-modal', {'terms': 'subscribeTerms'});
            this.confirmView.render("terms", "Almost there");
        }
    }
};
SubscribeForm.prototype.submit = function(event) 
{
    var self = this;
    event.preventDefault();

    var validated = self.validate();
    var checkTerms = true;
    if (this.code) {
        checkTerms = false;
    }
    self.render(checkTerms);
    
    if (!validated) return;

    if (self.botTimer < 5 || $('#email-confirm').val() !== "") {
        window.location.href = location.origin + "/auth/thank-you";
    }

    var signup = $('#signup').val();
    
    var submitResponse= function(r) {
        // console.log(r);
        if (r.success == 1) {
                window.location.href = location.origin + '/auth/thank-you';

        } else {

            var errorElement = document.getElementById('card-errors');
            var text = '';
            for (var key in r.error) {
                text = text + r.error[key] + " ";
            } 
            // console.log(text);
            errorElement.textContent = text;
        }
        self.signup.closeWindow();
    }


    this.signup = new Modal('modal', 'spinner-modal', {"spinner": 'spinnerTmpl'});

    if (this.code || signup) {
        self.data['planid'] = $('#planid').val();
        self.data['redirect'] = false;
        if (signup == 1) {
            self.data['signuponly'] = 'true';
        }
        if (this.code) {
            this.signup.render("spinner", "Authorising code");
            self.data['giftcode'] = $('#code-redeem').val();
        }

        self.data['stripetoken'] = null;
        Server.create('/auth/paywall-signup', self.data).done(submitResponse).fail(function(r) {
            self.signup.closeWindow();
        });

    } else {

        // modal.render("spinner", "Your request is being processed.");
        this.signup.render("spinner", "Your request is being processed.");
        var stripeCall = this.stripe.createToken(self.card).then(function(result) {

            if (result.error) {
                self.signup.closeWindow();
                // Inform the user if there was an error
                var errorElement = document.getElementById('card-errors');
                errorElement.textContent = result.error;
            } else {
                // Send the token to your server

                self.data['stripetoken'] = result.token.id;
                self.data['planid'] = $('#planid').val();
                self.data['redirect'] = false;
                Server.create('/auth/paywall-signup', self.data).done(submitResponse).fail(function(r) {
                    self.signup.closeWindow();
                });
            }
        });   
    }

        
};


if ($('#stripekey').length > 0 && $('#paywallsubscribe').length > 0 ) {
    
    var main = $('main');
    var user = {
        user_id : main.data('userid'),
        user_guid : main.data('userguid')
    };
    Acme.subscribe = new SubscribeForm('subscribeform', user);
}