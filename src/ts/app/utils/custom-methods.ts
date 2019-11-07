export const body = document.body;
export const enGrid = document.getElementById("engrid") as HTMLElement;
export const enInput = (() => {
  /* @TODO */
  /************************************
   * Globablly Scoped Constants and Variables
   ***********************************/

  // @TODO Needs to be expanded to bind other EN elements (checkbox, radio) and compound elements (split-text, split-select, select with other input, etc...)
  // @TODO A "Not" condition is needed for #en__field_transaction_email because someone could name their email opt in "Email" and it will get the .en_field--email class generated for it
  // get DOM elements
  const init = () => {
    const formInput = document.querySelectorAll(
      ".en__field--text, .en__field--email:not(.en__field--checkbox), .en__field--telephone, .en__field--number, .en__field--textarea, .en__field--select, .en__field--checkbox"
    );
    const otherInputs = document.querySelectorAll(".en__field__input--other");
    Array.from(formInput).forEach(e => {
      // @TODO Currently checkboxes always return as having a value, since they do but they're just not checked. Need to update and account for that, should also do Radio's while we're at it
      let element = e.querySelector("input, textarea, select") as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      if (element && element.value) {
        e.classList.add("has-value");
      }
      bindEvents(e);
    });

    /* @TODO */
    /************************************
     * Automatically select other radio input when an amount is entered into it.
     ***********************************/
    Array.from(otherInputs).forEach(e => {
      ["focus", "input"].forEach(evt => {
        e.addEventListener(
          evt,
          ev => {
            const target = ev.target as HTMLInputElement;
            if (target && target.parentNode && target.parentNode.parentNode) {
              const targetWrapper = target.parentNode as HTMLElement;
              targetWrapper.classList.remove("en__field__item--hidden");
              if (targetWrapper.parentNode) {
                const lastRadioInput = targetWrapper.parentNode.querySelector(".en__field__item:nth-last-child(2) input") as HTMLInputElement;
                lastRadioInput.checked = !0;
              }
            }
          },
          false
        );
      });
    });
  };

  return {
    init: init
  };
})();

export const setBackgroundImages = () => {
  // Find Inline Background Image, hide it, and set it as the background image.
  let pageBackground = document.querySelector(".page-backgroundImage") as HTMLElement;
  let pageBackgroundImg = document.querySelector(".page-backgroundImage img") as HTMLImageElement;
  let pageBackgroundLegacyImg = document.querySelector(".background-image p") as HTMLElement;

  let pageBackgroundImgSrc: any = null;

  /*!
   * Determine if an element is in the viewport
   * (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
   * @param  {Node}    elem The element
   * @return {Boolean}      Returns true if element is in the viewport
   */
  const isInViewport = (e: any) => {
    const distance = e.getBoundingClientRect();
    return (
      distance.top >= 0 &&
      distance.left >= 0 &&
      distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      distance.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  if (pageBackgroundImg) {
    pageBackgroundImgSrc = pageBackgroundImg.src;
    pageBackgroundImg.style.display = "none";
  } else if (pageBackgroundLegacyImg) {
    // Support for legacy pages
    pageBackgroundImgSrc = pageBackgroundLegacyImg.innerHTML;
    pageBackgroundLegacyImg.style.display = "none";
  }

  if (pageBackground && pageBackgroundImgSrc) {
    const contentFooter = document.querySelector(".content-footer");
    if (isInViewport(contentFooter)) {
      body.classList.add("page-backgroundImage-visible");
    } else {
      body.classList.add("page-backgroundImage-overflow");
    }
    pageBackground.style.backgroundImage = "url(" + pageBackgroundImgSrc + ")";
  }
};

export const bindEvents = (e: Element) => {
  /* @TODO */
  /************************************
   * INPUT, TEXTAREA, AND SELECT ACTIVITY CLASSES (FOCUS AND BLUR)
   * NOTE: STILL NEEDS WORK TO FUNCTION ON "SPLIT" CUSTOM EN FIELDS
   * REF: https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event
   ***********************************/

  // Occurs when an input field gets focus
  const handleFocus = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target && target.parentNode && target.parentNode.parentNode) {
      const targetWrapper = target.parentNode.parentNode as HTMLElement;
      targetWrapper.classList.add("has-focus");
    }
  };

  // Occurs when a user leaves an input field
  const handleBlur = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target && target.parentNode && target.parentNode.parentNode) {
      const targetWrapper = target.parentNode.parentNode as HTMLElement;
      targetWrapper.classList.remove("has-focus");
      if (target.value) {
        targetWrapper.classList.add("has-value");
      } else {
        targetWrapper.classList.remove("has-value");
      }
    }
  };

  // Occurs when a user changes the selected option of a <select> element
  const handleChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    if (target && target.parentNode && target.parentNode.parentNode) {
      const targetWrapper = target.parentNode.parentNode as HTMLElement;
      targetWrapper.classList.add("has-value");
    }
  };

  // Occurs when a text or textarea element gets user input
  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    if (target && target.parentNode && target.parentNode.parentNode) {
      const targetWrapper = target.parentNode.parentNode as HTMLElement;
      targetWrapper.classList.add("has-value");
    }
  };

  // Occurs on browser autofill of fields
  const onAutoFillStart = (e: any) => {
    e.parentNode.parentNode.classList.add("is-autofilled", "has-value");
  };

  const onAutoFillCancel = (e: any) => e.parentNode.parentNode.classList.remove("is-autofilled", "has-value");
  const onAnimationStart = (e: any) => {
    const target = e.target as HTMLElement;
    const animation = e.animationName;
    switch (animation) {
      case "onAutoFillStart":
        return onAutoFillStart(target);
      case "onAutoFillCancel":
        return onAutoFillCancel(target);
    }
  };

  const enField = e.querySelector("input, textarea, select") as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  if (enField){
    enField.addEventListener("focus", handleFocus);
    enField.addEventListener("blur", handleBlur);
    enField.addEventListener("change", handleChange);
    enField.addEventListener("input", handleInput);
    enField.addEventListener("animationstart", onAnimationStart);
  }
};

export const debugBar = () => {
  const debugStart = () => {
    if (body.classList.contains("debug-enabled")) {
      body.classList.remove("debug-off");
      body.classList.add("debug-on");
    }
  };

  const debugStop = () => {
    if (body.classList.contains("debug-enabled")) {
      body.classList.remove("debug-on");
      body.classList.add("debug-off");
      // const debugBar = (HTMLButtonElement) => document.getElementById("debug-toggle");
      // if(debugBar){
      //   debugBar.innerHTML = "Turn Debug On";
      // }
    }
  };

  if (
    window.location.search.indexOf("mode=DEMO") > -1 ||
    window.location.href.indexOf("debug") != -1 ||
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
  ) {
    body.classList.add("debug-disabled");
    body.classList.add("debug-off");
    // body.addEventListener("mouseenter", debugStart);
    // body.addEventListener("mouseleave", debugStop);
    if (enGrid) {
      enGrid.insertAdjacentHTML(
        "afterend",
        '<span id="debug-bar">' +
          // '<button id="debug-toggle" type="button">Turn Debug On</button>' +
          '<button id="layout-toggle" type="button">Layout Toggle</button>' +
          "</span>"
      );
    } else {
      body.classList.add("debug-disabled");
    }
    if (document.getElementById("debug-toggle")) {
      const debugTemplateButton = document.getElementById("debug-toggle");
      if (debugTemplateButton) {
        debugTemplateButton.addEventListener(
          "click",
          function() {
            debugToggle();
          },
          false
        );
      }
    }

    if (document.getElementById("layout-toggle")) {
      const debugTemplateButton = document.getElementById("layout-toggle");
      if (debugTemplateButton) {
        debugTemplateButton.addEventListener(
          "click",
          function() {
            layoutToggle();
          },
          false
        );
      }
    }

    const debugToggle = () => {
      if (body) {
        if (body.classList.contains("debug-enabled")) {
          body.classList.remove("debug-enabled");
          body.classList.remove("debug-on");
          body.classList.add("debug-disabled");
          body.classList.add("debug-off");
        } else if (body.classList.contains("debug-disabled")) {
          body.classList.remove("debug-disabled");
          body.classList.remove("debug-off");
          body.classList.add("debug-enabled");
          body.classList.add("debug-on");
        } else {
          console.log("While trying to switch visualizations, something unexpected happen.");
        }
      }
    };

    const layoutToggle = () => {
      if (enGrid) {
        // if (enGrid.classList.contains("layout-leftleft1col")) {
        //   removeClassesByPrefix(enGrid, "layout-");
        //   enGrid.classList.add("layout-centerleft1col");
        // } else if (enGrid.classList.contains("layout-centerleft1col")) {
        //   removeClassesByPrefix(enGrid, "layout-");
        //   enGrid.classList.add("layout-centercenter1col");
        // } else if (enGrid.classList.contains("layout-centercenter1col")) {
        //   removeClassesByPrefix(enGrid, "layout-");
        //   enGrid.classList.add("layout-centercenter2col");
        // } else if (enGrid.classList.contains("layout-centercenter2col")) {
        //   removeClassesByPrefix(enGrid, "layout-");
        //   enGrid.classList.add("layout-debug");
        // } else if (enGrid.classList.contains("layout-debug")) {
        //   removeClassesByPrefix(enGrid, "layout-");
        //   enGrid.classList.add("layout-leftleft1col");
        // } else {
        //   console.log("While trying to switch layouts, something unexpected happen.");
        // }
        if (enGrid.classList.contains("layout-centerleft1col")) {
          removeClassesByPrefix(enGrid, "layout-");
          enGrid.classList.add("layout-centercenter1col");
        } else if (enGrid.classList.contains("layout-centercenter1col")) {
          removeClassesByPrefix(enGrid, "layout-");
          enGrid.classList.add("layout-debug");
        } else if (enGrid.classList.contains("layout-debug")) {
          removeClassesByPrefix(enGrid, "layout-");
          enGrid.classList.add("layout-centerleft1col");
        } else {
          console.log("While trying to switch layouts, something unexpected happen.");
        }
      }
    };

    const removeClassesByPrefix = (el: HTMLElement, prefix: string) => {
      for (var i = el.classList.length - 1; i >= 0; i--) {
        if (el.classList[i].startsWith(prefix)) {
          el.classList.remove(el.classList[i]);
        }
      }
    };
  }
};

export const inputPlaceholder = () => {
  const enGridFloatLabels = document.querySelector("#engrid:not(.float-labels)") as HTMLElement;
  if (enGridFloatLabels) {
    const enFieldDonationAmt = document.querySelector(".en__field--donationAmt.en__field--withOther .en__field__input--other") as HTMLInputElement;
    // const enFieldFirstName = document.querySelector("#en__field_supporter_firstName") as HTMLInputElement;
    // const enFieldLastName = document.querySelector("#en__field_supporter_lastName") as HTMLInputElement;
    // const enFieldEmailAddress = document.querySelector("#en__field_supporter_emailAddress") as HTMLInputElement;
    // const enFieldPhoneNumber = document.querySelector("#en__field_supporter_phoneNumber") as HTMLInputElement;
    const enFieldPhoneNumber2 = document.querySelector("#en__field_supporter_phoneNumber2") as HTMLInputElement;
    // const enFieldCountry = document.querySelector("#en__field_supporter_country") as HTMLSelectElement;
    // const enFieldAddress1 = document.querySelector("#en__field_supporter_address1") as HTMLInputElement;
    // const enFieldAddress2 = document.querySelector("#en__field_supporter_address2") as HTMLInputElement;
    // const enFieldCity = document.querySelector("#en__field_supporter_city") as HTMLInputElement;
    // const enFieldRegion = document.querySelector("#en__field_supporter_region") as HTMLSelectElement;
    // const enFieldPostcode = document.querySelector("#en__field_supporter_postcode") as HTMLInputElement;
    const enFieldHonname = document.querySelector("#en__field_transaction_honname") as HTMLInputElement;
    const enFieldInfname = document.querySelector("#en__field_transaction_infname") as HTMLInputElement;
    const enFieldInfemail = document.querySelector("#en__field_transaction_infemail") as HTMLInputElement;
    // const enFieldInfcountry = document.querySelector("#en__field_transaction_infcountry") as HTMLSelectElement;
    const enFieldInfadd1 = document.querySelector("#en__field_transaction_infadd1") as HTMLInputElement;
    const enFieldInfadd2 = document.querySelector("#en__field_transaction_infadd2") as HTMLInputElement;
    const enFieldInfcity = document.querySelector("#en__field_transaction_infcity") as HTMLInputElement;
    // const enFieldInfreg = document.querySelector("#en__field_transaction_infreg") as HTMLSelectElement;
    const enFieldInfpostcd = document.querySelector("#en__field_transaction_infpostcd") as HTMLInputElement;
    const enFieldGftrsn = document.querySelector("#en__field_transaction_gftrsn") as HTMLInputElement;
    // const enPaymentType = document.querySelector("#en__field_transaction_paymenttype") as HTMLInputElement;
    const enFieldCcnumber = document.querySelector("#en__field_transaction_ccnumber") as HTMLInputElement;
    // const enFieldCcexpire = document.querySelector("#en__field_transaction_ccexpire") as HTMLInputElement;
    // const enFieldCcvv = document.querySelector("#en__field_transaction_ccvv") as HTMLInputElement;
    // const enFieldBankAccountNumber = document.querySelector("#en__field_supporter_bankAccountNumber") as HTMLInputElement;
    // const enFieldBankRoutingNumber = document.querySelector("#en__field_supporter_bankRoutingNumber") as HTMLInputElement;

    if (enFieldDonationAmt) {
      enFieldDonationAmt.placeholder = "Other";
      enFieldDonationAmt.setAttribute("type", "number");
    }
    // if (enFieldFirstName) {
    //   enFieldFirstName.placeholder = "First name";
    // }
    // if (enFieldLastName) {
    //   enFieldLastName.placeholder = "Last name";
    // }
    // if (enFieldEmailAddress) {
    //   enFieldEmailAddress.placeholder = "Email address";
    // }
    // if (enFieldPhoneNumber) {
    //   enFieldPhoneNumber.placeholder = "Phone number";
    // }
    if (enFieldPhoneNumber2) {
      enFieldPhoneNumber2.placeholder = "000-000-0000 (optional)";
    }
    // if (enFieldCountry){
    //   enFieldCountry.placeholder = "Country";
    // // }
    // if (enFieldAddress1) {
    //   enFieldAddress1.placeholder = "Street address";
    // }
    // if (enFieldAddress2) {
    //   enFieldAddress2.placeholder = "Apt., ste., bldg.";
    // }
    // if (enFieldCity) {
    //   enFieldCity.placeholder = "City";
    // }
    // if (enFieldRegion){
    //   enFieldRegion.placeholder = "TBD";
    // }
    // if (enFieldPostcode) {
    //   enFieldPostcode.placeholder = "Post code";
    // }
    if (enFieldHonname) {
      enFieldHonname.placeholder = "Honoree name";
    }
    if (enFieldInfname) {
      enFieldInfname.placeholder = "Recipient name";
    }
    if (enFieldInfemail) {
      enFieldInfemail.placeholder = "Recipient email address";
    }
    // if (enFieldInfcountry){
    //   enFieldInfcountry.placeholder = "TBD";
    // }
    if (enFieldInfadd1) {
      enFieldInfadd1.placeholder = "Recipient street address";
    }
    if (enFieldInfadd2) {
      enFieldInfadd2.placeholder = "Recipient Apt., ste., bldg.";
    }
    if (enFieldInfcity) {
      enFieldInfcity.placeholder = "Recipient city";
    }
    // if (enFieldInfreg){
    //   enFieldInfreg.placeholder = "TBD";
    // }
    if (enFieldInfpostcd) {
      enFieldInfpostcd.placeholder = "Recipient postal code";
    }
    if (enFieldGftrsn) {
      enFieldGftrsn.placeholder = "Reason for your gift";
    }
    // if (enPaymentType) {
    //   enPaymentType.placeholder = "TBD";
    // }
    if (enFieldCcnumber) {
      enFieldCcnumber.placeholder = "•••• •••• •••• ••••";
    }
    // if (enFieldCcexpire) {
    //   enFieldCcexpire.placeholder = "MM / YY";
    // }
    // if (enFieldCcvv) {
    //   enFieldCcvv.placeholder = "CVV";
    // }
    // if (enFieldBankAccountNumber) {
    //   enFieldBankAccountNumber.placeholder = "Bank account number";
    // }
    // if (enFieldBankRoutingNumber) {
    //   enFieldBankRoutingNumber.placeholder = "Bank routing number";
    // }
  }
};

export const watchInmemField = () => {
  const enFieldTransactionInmem = document.getElementById("en__field_transaction_inmem") as HTMLInputElement;

  const handleEnFieldTransactionInmemChange = (e: Event) => {
    if (enFieldTransactionInmem.checked) {
      enGrid.classList.add("has-give-in-honor");
    } else {
      enGrid.classList.remove("has-give-in-honor");
    }
  };

  // Check Give In Honor State on Page Load
  if (enFieldTransactionInmem) {
    // Run on page load
    if (enFieldTransactionInmem.checked) {
      enGrid.classList.add("has-give-in-honor");
    } else {
      enGrid.classList.remove("has-give-in-honor");
    }

    // Run on change
    enFieldTransactionInmem.addEventListener("change", handleEnFieldTransactionInmemChange);
  }
};

export const watchRecurrpayField = () => {
  const enFieldRecurrpay = document.querySelector(".en__field--recurrpay") as HTMLElement;
  const transactionRecurrpay = document.getElementsByName("transaction.recurrpay") as NodeList;
  const enFieldRecurrpayStartingValue = document.querySelector('input[name="transaction.recurrpay"]:checked') as HTMLInputElement;
  let enFieldRecurrpayCurrentValue = document.querySelector('input[name="transaction.recurrpay"]:checked') as HTMLInputElement;

  const handleEnFieldRecurrpay = (e: Event) => {
    enFieldRecurrpayCurrentValue = document.querySelector('input[name="transaction.recurrpay"]:checked') as HTMLInputElement;
    if (enFieldRecurrpayCurrentValue.value == "Y") {
      enGrid.classList.remove("has-give-once");
      enGrid.classList.add("has-give-monthly");
    } else if (enFieldRecurrpayCurrentValue.value == "N") {
      enGrid.classList.remove("has-give-monthly");
      enGrid.classList.add("has-give-once");
    }
  };

  // Check Giving Frequency on page load
  if (enFieldRecurrpay) {
    enFieldRecurrpayCurrentValue = document.querySelector('input[name="transaction.recurrpay"]:checked') as HTMLInputElement;
    if (enFieldRecurrpayCurrentValue.value == "Y") {
      enGrid.classList.remove("has-give-once");
      enGrid.classList.add("has-give-monthly");
    } else if (enFieldRecurrpayCurrentValue.value == "N") {
      enGrid.classList.add("has-give-once");
      enGrid.classList.remove("has-give-monthly");
    }
  }

  // Watch each Giving Frequency radio input for a change
  if (transactionRecurrpay) {
    Array.from(transactionRecurrpay).forEach(e => {
      let element = e as HTMLInputElement;
      element.addEventListener("change", handleEnFieldRecurrpay);
    });
  }
};

export const watchGiveBySelectField = () => {
  const enFieldGiveBySelect = document.querySelector(".en__field--giveBySelect") as HTMLElement;
  const transactionGiveBySelect = document.getElementsByName("transaction.giveBySelect") as NodeList;
  let enFieldGiveBySelectCurrentValue = document.querySelector('input[name="transaction.giveBySelect"]:checked') as HTMLInputElement;

  const handleEnFieldGiveBySelect = (e: Event) => {
    enFieldGiveBySelectCurrentValue = document.querySelector('input[name="transaction.giveBySelect"]:checked') as HTMLInputElement;
    if (enFieldGiveBySelectCurrentValue.value == "card") {
      enGrid.classList.add("has-give-by-card");
      enGrid.classList.remove("has-give-by-check");
      enGrid.classList.remove("has-give-by-paypal");
    } else if (enFieldGiveBySelectCurrentValue.value == "check") {
      enGrid.classList.remove("has-give-by-card");
      enGrid.classList.add("has-give-by-check");
      enGrid.classList.remove("has-give-by-paypal");
    } else if (enFieldGiveBySelectCurrentValue.value == "paypal") {
      enGrid.classList.remove("has-give-by-card");
      enGrid.classList.remove("has-give-by-check");
      enGrid.classList.add("has-give-by-paypal");
    }
  };

  // Check Giving Frequency on page load
  if (enFieldGiveBySelect) {
    enFieldGiveBySelectCurrentValue = document.querySelector('input[name="transaction.giveBySelect"]:checked') as HTMLInputElement;
    if (enFieldGiveBySelectCurrentValue.value == "card") {
      enGrid.classList.add("has-give-by-card");
      enGrid.classList.remove("has-give-by-check");
      enGrid.classList.remove("has-give-by-paypal");
    } else if (enFieldGiveBySelectCurrentValue.value == "check") {
      enGrid.classList.remove("has-give-by-card");
      enGrid.classList.add("has-give-by-check");
      enGrid.classList.remove("has-give-by-paypal");
    } else if (enFieldGiveBySelectCurrentValue.value == "paypal") {
      enGrid.classList.remove("has-give-by-card");
      enGrid.classList.remove("has-give-by-check");
      enGrid.classList.add("has-give-by-paypal");
    }
  }

  // Watch each Giving Frequency radio input for a change
  if (transactionGiveBySelect) {
    Array.from(transactionGiveBySelect).forEach(e => {
      let element = e as HTMLInputElement;
      element.addEventListener("change", handleEnFieldGiveBySelect);
    });
  }
};

// Support the Legacy Give By Select field
export const watchLegacyGiveBySelectField = () => {
  const enFieldGiveBySelect = document.querySelector(".en__field--give-by-select") as HTMLElement;
  const transactionGiveBySelect = document.getElementsByName("supporter.questions.180165") as NodeList;
  let enFieldGiveBySelectCurrentValue = document.querySelector('input[name="supporter.questions.180165"]:checked') as HTMLInputElement;

  const handleEnFieldGiveBySelect = (e: Event) => {
    enFieldGiveBySelectCurrentValue = document.querySelector('input[name="supporter.questions.180165"]:checked') as HTMLInputElement;
    if (enFieldGiveBySelectCurrentValue.value == "card") {
      enGrid.classList.add("has-give-by-card");
      enGrid.classList.remove("has-give-by-paypal");
    } else if (enFieldGiveBySelectCurrentValue.value == "paypal") {
      enGrid.classList.remove("has-give-by-card");
      enGrid.classList.add("has-give-by-paypal");
    }
  };

  // Check Giving Frequency on page load
  if (enFieldGiveBySelect) {
    enFieldGiveBySelectCurrentValue = document.querySelector('input[name="supporter.questions.180165"]:checked') as HTMLInputElement;
    if (enFieldGiveBySelectCurrentValue.value == "card") {
      enGrid.classList.add("has-give-by-card");
      enGrid.classList.remove("has-give-by-paypal");
    } else if (enFieldGiveBySelectCurrentValue.value == "paypal") {
      enGrid.classList.remove("has-give-by-card");
      enGrid.classList.add("has-give-by-paypal");
    }
  }

  // Watch each Giving Frequency radio input for a change
  if (transactionGiveBySelect) {
    Array.from(transactionGiveBySelect).forEach(e => {
      let element = e as HTMLInputElement;
      element.addEventListener("change", handleEnFieldGiveBySelect);
    });
  }
};

/*
 * Input fields as reference variables
 */
const field_credit_card = document.getElementById("en__field_transaction_ccnumber") as HTMLInputElement;
const field_payment_type = document.getElementById("en__field_transaction_paymenttype") as HTMLSelectElement;
let field_expiration_parts = document.querySelectorAll(".en__field--ccexpire .en__field__input--splitselect");
const field_country = document.getElementById("en__field_supporter_country") as HTMLInputElement;
let field_expiration_month = field_expiration_parts[0] as HTMLSelectElement;
let field_expiration_year = field_expiration_parts[1] as HTMLSelectElement;

/*
 * Helpers
 */

// current_month and current_year used by handleExpUpdate()
let d = new Date();
var current_month = d.getMonth() + 1; // month options in expiration dropdown are indexed from 1
var current_year = d.getFullYear() - 2000;

// getCardType used by handleCCUpdate()
const getCardType = (cc_partial: string) => {
  let key_character = cc_partial.charAt(0);
  switch (key_character) {
    case "3":
      return "AX";
    case "4":
      return "VI";
    case "5":
      return "MC";
    case "6":
      return "DI";
    default:
      return "na";
  }
};

/*
 * Handlers
 */
const handleCCUpdate = () => {
  let card_type = getCardType(field_credit_card.value);
  if (card_type && field_payment_type.value != card_type) {
    field_payment_type.value = card_type;
  }
};

const handleExpUpdate = (e: string) => {
  // handle if year is changed to current year (disable all months less than current month)
  // handle if month is changed to less than current month (disable current year)
  if (e == "month") {
    let selected_month = parseInt(field_expiration_month.value);
    let disable = selected_month < current_month;
    console.log("month disable", disable, typeof disable, selected_month, current_month);
    for (let i = 0; i < field_expiration_year.options.length; i++) {
      // disable or enable current year
      if (parseInt(field_expiration_year.options[i].value) <= current_year) {
        if (disable) {
          //@TODO Couldn't get working in TypeScript
          field_expiration_year.options[i].setAttribute("disabled", "disabled");
        } else {
          field_expiration_year.options[i].disabled = false;
        }
      }
    }
  } else if (e == "year") {
    let selected_year = parseInt(field_expiration_year.value);
    let disable = selected_year == current_year;
    console.log("year disable", disable, typeof disable, selected_year, current_year);
    for (let i = 0; i < field_expiration_month.options.length; i++) {
      // disable or enable all months less than current month
      if (parseInt(field_expiration_month.options[i].value) < current_month) {
        if (disable) {
          //@TODO Couldn't get working in TypeScript
          field_expiration_month.options[i].setAttribute("disabled", "disabled");
        } else {
          field_expiration_month.options[i].disabled = false;
        }
      }
    }
  }
};

/*
 * Event Listeners
 */
if (field_credit_card) {
  field_credit_card.addEventListener("keyup", function() {
    handleCCUpdate();
  });
  field_credit_card.addEventListener("paste", function() {
    handleCCUpdate();
  });
  field_credit_card.addEventListener("blur", function() {
    handleCCUpdate();
  });
}

if (field_expiration_month && field_expiration_year) {
  field_expiration_month.addEventListener("change", function() {
    handleExpUpdate("month");
  });

  field_expiration_year.addEventListener("change", function() {
    handleExpUpdate("year");
  });
}

const getUrlParameter = (name: string) => {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};
let country_code = getUrlParameter("country");
if (country_code) {
  field_country.value = country_code;
}

// EN Polyfill to support "label" clicking on Advocacy Recipient "labels"
export const contactDetailLabels = () => {
  const contact = document.querySelectorAll(".en__contactDetails__rows") as NodeList;
  if (contact) {
    Array.from(contact).forEach(e => {
      let element = e as HTMLElement;
      element.addEventListener("click", recipientChange);
    });
  }

  const recipientChange = (e: Event) => {
    const recipientLabelRow = e.target as HTMLElement;
    const contactCheckbox = recipientLabelRow.previousSibling as HTMLInputElement;
    contactCheckbox.checked = !contactCheckbox.checked;
  };
};
