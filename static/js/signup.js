// Create a Stripe client
import { Form, Validators } from "./form";

import { Modal, Server } from "./framework";
import Card from "./StripeCard";

function verifyCaptcha(token) {
  recaptcha_response = token;
  Acme.subscribe.submit(e);
}

export const SubscribeForm = function (id, user) {
  var self = this;
  this.botTimer = 0;
  this.id = id || null;
  this.parent = Form.prototype;
  this.code = false;

  this.data = {
    username: this.random(15),
  };

  this.errorFields = [];

  this.validateRules = {
    verifypassword: ["notEmpty"],
    firstname: ["notEmpty"],
    lastname: ["notEmpty"],
    password: ["notEmpty"],
    email: ["notEmpty"],
    terms: ["isTrue"],
  };

  this.trial = $("#trial").val();
  this.signup = $("#signup").val();
  this.data["plantype"] = $("#plantype").val();

  if (this.trial == "1" && this.data.plantype === "time") {
    this.data["trial"] = "true";
    this.validateRules["changeterms"] = ["isTrue"];
  }
  if ($("#code-redeem").length > 0) {
    this.code = true;
    delete this.validateRules.terms;
    delete this.validateRules.changeterms;
  }

  this.validateFields = Object.keys(this.validateRules);

  setInterval(function () {
    self.botTimer = self.botTimer + 1;
  }, 1000);

  if (!this.signup) {
    this.stripeSetup();
  }
  this.loadData();
  this.events();
};

SubscribeForm.prototype = new Form(Validators);
SubscribeForm.constructor = SubscribeForm;
SubscribeForm.prototype.stripeSetup = function () {
  var self = this;
  var stripekey = $("#stripekey").html();
  this.stripe = Stripe(stripekey);
  const StripeCard = new Card();
  this.card = StripeCard.get(this.stripe);
};
SubscribeForm.prototype.random = function (length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
SubscribeForm.prototype.render = function (checkTerms) {
  this.clearInlineErrors();
  this.addInlineErrors();
  if (checkTerms) {
    if (
      !this.data.terms ||
      (this.data.trial === "true" && !this.data.changeterms)
    ) {
      this.confirmView = new Modal("modal", "signin-modal", {
        terms: "subscribeTerms",
      });
      this.confirmView.render("terms", "Almost there");
    }
  }
};
SubscribeForm.prototype.submit = async function (event) {
  var self = this;
  event.preventDefault();

  var validated = self.validate();
  var checkTerms = true;
  if (this.code) {
    checkTerms = false;
  }
  self.render(checkTerms);

  if (!validated) return;

  if (self.botTimer < 5 || $("#email-confirm").val() !== "") {
    window.location.href = location.origin + "/auth/thank-you";
    return;
  }

  const submitResponse = function (r) {
    // console.log(r);

    if (r.success == 1) {
      window.location.href = location.origin + "/auth/thank-you";
    } else {
      var errorElement = document.getElementById("card-errors");
      var text = r.error;
      if (Array.isArray(r.error)) {
        text = "";
        for (var key in r.error) {
          text = text + r.error[key] + " ";
        }
      } else if (typeof r.error === "object") {
        text = "";
        for (var key in r.error) {
          text = text + r.error[key] + " ";
        }
      }
      if(text.trim() == 'Email already exists. Please provide another email.') {
        text = `This email address already exist, please provide another email or <a class="j-signin" href="javascript:;">click here to login</a>`
      }
      errorElement.innerHTML = text;
    }
    self.signupModal.closeWindow();
  };

  async function generateRecaptchaToken() {
    return new Promise((resolve) => {
      grecaptcha.ready(function () {
        grecaptcha
          .execute(window.Acme.captcha_site_key, { action: "submit" })
          .then(function (token) {
            resolve(token);
          });
      });
    });
  }

  async function submitForm() {
    // captcha_site_key is set in the subscribe twig template based on
    // rules set in the theme config and reCaptcha integration
    if (typeof window.Acme.captcha_site_key !== "undefined") {
      self.data["g-recaptcha-response"] = await generateRecaptchaToken();
    }
    var idempotency_key = $('#idempotency_key').html();
    if(typeof idempotency_key !== "undefined" && idempotency_key != "") {
        self.data['idempotency_key'] = idempotency_key; // Duplicate Request Prevent 
    }
    try {
      const response = await Server.create("/auth/paywall-signup", self.data);
      submitResponse(response);
    } catch (error) {
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = error.statusText
        self.signupModal.closeWindow();
    }
  }

  this.signupModal = new Modal("modal", "spinner-modal", {
    spinner: "spinnerTmpl",
  });

  if (this.code || this.signup) {
    self.data["planid"] = $("#planid").val();
    self.data["redirect"] = false;
    if (this.signup == 1) {
      self.data["signuponly"] = "true";
      this.signupModal.render("spinner", "Signing up");
    }
    if (this.code) {
      this.signupModal.render("spinner", "Authorising code");
      self.data["giftcode"] = $("#code-redeem").val();
    }

    // captcha_site_key is set in the subscribe twig template based on
    // rules set in the theme config and reCaptcha integration
    // if (typeof window.Acme.captcha_site_key !== "undefined") {
    //   grecaptcha.ready(function () {
    //     grecaptcha
    //       .execute(window.Acme.captcha_site_key, { action: "submit" })
    //       .then(function (token) {
    //         self.data["g-recaptcha-response"] = token;
    //       });
    //   });
    // }
    self.data["stripetoken"] = null;  
    await submitForm() 
    
    // Server.create("/auth/paywall-signup", self.data)
    //   .done(submitResponse)
    //   .fail(function (r) {
    //     self.signupModal.closeWindow();
    //   });
  } else {
    // modal.render("spinner", "Your request is being processed.");
    this.signupModal.render("spinner", "Your request is being processed.");
    var stripeCall = this.stripe.createToken(self.card).then(async function (result) {
      if (result.error) {
        self.signupModal.closeWindow();
        // Inform the user if there was an error
        var errorElement = document.getElementById("card-errors");
        errorElement.textContent = result.error.message;
      } else {
        // Send the token to your server

        self.data["stripetoken"] = result.token.id;
        self.data["planid"] = $("#planid").val();
        self.data["redirect"] = false;

        // captcha_site_key is set in the subscribe twig template based on
        // rules set in the theme config and reCaptcha integration
        // if (typeof window.Acme.captcha_site_key !== "undefined") {
        //   grecaptcha.ready(function () {
        //     grecaptcha
        //       .execute(window.Acme.captcha_site_key, { action: "submit" })
        //       .then(function (token) {
        //         self.data["g-recaptcha-response"] = token;
        //       });
        //   });
        // }

        // var idempotency_key = $("#idempotency_key").html();
        // if (typeof idempotency_key !== "undefined" && idempotency_key != "") {
        //   self.data["idempotency_key"] = idempotency_key; // Duplicate Request Prevent
        // }

        // Server.create("/auth/paywall-signup", self.data)
        //   .done(submitResponse)
        //   .fail(function (r) {
        //     self.signupModal.closeWindow();
        //   });

        await submitForm();
      }
    });
  }
};

if ($("#stripekey").length > 0 && $("#paywallsubscribe").length > 0) {
  var main = $("main");
  var user = {
    user_id: main.data("userid"),
    user_guid: main.data("userguid"),
  };
  Acme.subscribe = new SubscribeForm("subscribeform", user);
}
