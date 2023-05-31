const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if (isSafari) {
  window.__forceSmoothScrollPolyfill__ = true;
}
import smoothscroll from "smoothscroll-polyfill";
smoothscroll.polyfill();
export default class DonationLightboxForm {
  constructor(DonationAmount, DonationFrequency) {
    this.amount = DonationAmount;
    this.frequency = DonationFrequency;
    this.ipCountry = "";
    console.log("DonationLightboxForm: constructor");
    // Each EN Row is a Section
    this.sections = document.querySelectorAll(
      "form.en__component > .en__component"
    );
    // Check if we're on the Thank You page
    if (pageJson.pageNumber === pageJson.pageCount) {
      this.sendMessage("status", "loaded");
      this.sendMessage("status", "celebrate");
      this.sendMessage("class", "thank-you");
      document.querySelector("body").dataset.thankYou = "true";
      // Get Query Strings
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("name")) {
        let engrid = document.querySelector("#engrid");
        if (engrid) {
          let engridContent = engrid.innerHTML;
          engridContent = engridContent.replace(
            "{user_data~First Name}",
            atob(urlParams.get("name"))
          );
          engridContent = engridContent.replace(
            "{receipt_data~recurringFrequency}",
            atob(urlParams.get("frequency"))
          );
          engridContent = engridContent.replace(
            "{receipt_data~amount}",
            "$" + atob(urlParams.get("amount"))
          );
          engrid.innerHTML = engridContent;
          this.sendMessage("firstname", atob(urlParams.get("name")));
        }
      } else {
        // Try to get the first name
        const thisClass = this;
        const pageDataUrl =
          location.protocol +
          "//" +
          location.host +
          location.pathname +
          "/pagedata";
        fetch(pageDataUrl)
          .then(function (response) {
            return response.json();
          })
          .then(function (json) {
            if (json.hasOwnProperty("firstName") && json.firstName !== null) {
              thisClass.sendMessage("firstname", json.firstName);
            } else {
              thisClass.sendMessage("firstname", "Friend");
            }
          })
          .catch((error) => {
            console.error("PageData Error:", error);
          });
      }
      return false;
    }
    if (!this.sections.length) {
      // No section or no Donation Page was found
      this.sendMessage("error", "No sections found");
      return false;
    }
    console.log(this.sections);
    if (this.isIframe()) {
      // If iFrame
      this.buildSectionNavigation();
      // If Form Submission Failed
      if (
        this.checkNested(
          window.EngagingNetworks,
          "require",
          "_defined",
          "enjs",
          "checkSubmissionFailed"
        ) &&
        window.EngagingNetworks.require._defined.enjs.checkSubmissionFailed()
      ) {
        console.log("DonationLightboxForm: Submission Failed");
        // Submission failed
        if (this.validateForm()) {
          // Front-End Validation Passed, get first Error Message
          const error = document.querySelector("li.en__error");
          if (error) {
            // Check if error contains "problem processing" to send a smaller message
            if (
              error.innerHTML.toLowerCase().indexOf("problem processing") > -1
            ) {
              this.sendMessage(
                "error",
                `
                Sorry! There's a problem processing your donation.<br>
                Please check your payment details and resubmit.<br>
                If the problem persists, e-mail <strong>DonorE@peta.org</strong><br> 
                or call <strong>757-213-8731</strong> Mon.-Fri. 9 a.m.-5 p.m. ET. 
                `
              );
              this.scrollToElement(
                document.querySelector(".en__field--ccnumber")
              );
            } else {
              this.sendMessage("error", error.textContent);
            }
            // Check if error contains "payment" or "account" and scroll to the right section
            if (
              error.innerHTML.toLowerCase().indexOf("payment") > -1 ||
              error.innerHTML.toLowerCase().indexOf("account") > -1
            ) {
              this.scrollToElement(
                document.querySelector(".en__field--ccnumber")
              );
            }
          }
        }
      }
      document
        .querySelectorAll("form.en__component input.en__field__input")
        .forEach((e) => {
          e.addEventListener("focus", (event) => {
            // Run after 50ms - We need this or else some browsers will disregard the scroll due to the focus event
            const sectionId = this.getSectionId(e);
            setTimeout(() => {
              if (sectionId > 0 && this.validateForm(sectionId - 1)) {
                this.scrollToElement(e);
              }
            }, 50);
          });
        });
    }
    let paymentOpts = document.querySelector(".payment-options");
    if (paymentOpts) {
      this.clickPaymentOptions(paymentOpts);
    }

    this.putArrowUpSVG();

    DonationFrequency.getInstance().onFrequencyChange.subscribe((s) =>
      this.bounceArrow(s)
    );
    DonationFrequency.getInstance().onFrequencyChange.subscribe(() =>
      this.changeSubmitButton()
    );
    DonationAmount.getInstance().onAmountChange.subscribe(() =>
      this.changeSubmitButton()
    );
    this.changeSubmitButton();
    this.sendMessage("status", "loaded");
    // Check if theres a color value in the url
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("color")) {
      document.body.style.setProperty(
        "--color_primary",
        urlParams.get("color")
      );
    }
    // Check your IP Country
    fetch(`https://${window.location.hostname}/cdn-cgi/trace`)
      .then((res) => res.text())
      .then((t) => {
        let data = t.replace(/[\r\n]+/g, '","').replace(/\=+/g, '":"');
        data = '{"' + data.slice(0, data.lastIndexOf('","')) + '"}';
        const jsondata = JSON.parse(data);
        this.ipCountry = jsondata.loc;
        this.canadaOnly();
        console.log("Country:", this.ipCountry);
      });
    const countryField = document.querySelector("#en__field_supporter_country");
    if (countryField) {
      countryField.addEventListener("change", (e) => {
        this.canadaOnly();
      });
    }
    // Email validator tool
    const emailField = document.querySelector(
      "#en__field_supporter_emailAddress"
    );
    if (emailField) {
      "change paste".split(" ").forEach((e) => {
        emailField.addEventListener(e, (event) => {
          // Run after 50ms
          setTimeout(() => {
            this.validateEmail(emailField.value);
          }, 50);
        });
      });
      const emailWrapper = emailField.closest(".en__field");
      const emailError = document.createElement("div");
      emailError.id = "petaEmailValidator";
      emailError.classList.add("email-validator");
      emailError.innerHTML = `<span class="message"></span><a href="#" class="close">Close</a>`;
      emailWrapper.appendChild(emailError);
      emailError.addEventListener("click", (e) => {
        if (e.target.classList.contains("close")) {
          e.preventDefault();
          emailError.classList.remove("show");
        }
        if (e.target.classList.contains("set-suggestion")) {
          e.preventDefault();
          emailField.value = e.target.innerHTML;
          emailError.classList.remove("show");
        }
      });
    }
  }
  // Send iframe message to parent
  sendMessage(key, value) {
    const message = { key: key, value: value };
    window.parent.postMessage(message, "*");
  }
  // Check if is iFrame
  isIframe() {
    return window.self !== window.top;
  }
  // Build Section Navigation
  buildSectionNavigation() {
    console.log("DonationLightboxForm: buildSectionNavigation");
    this.sections.forEach((section, key) => {
      section.dataset.sectionId = key;
      const sectionNavigation = document.createElement("div");
      sectionNavigation.classList.add("section-navigation");
      if (key == 0) {
        sectionNavigation.innerHTML = `
        <button class="section-navigation__next" data-section-id="${key}">
          <span>Continue</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path fill="#fff" d="M7.687 13.313c-.38.38-.995.38-1.374 0-.38-.38-.38-.996 0-1.375L10 8.25H1.1c-.608 0-1.1-.493-1.1-1.1 0-.608.492-1.1 1.1-1.1h9.2L6.313 2.062c-.38-.38-.38-.995 0-1.375s.995-.38 1.374 0L14 7l-6.313 6.313z"/>
          </svg>
        </button>
      `;
      } else if (key == this.sections.length - 1) {
        sectionNavigation.innerHTML = `
        <button class="section-navigation__previous" data-section-id="${key}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path fill="var(--color_primary)" d="M7.214.786c.434-.434 1.138-.434 1.572 0 .433.434.433 1.137 0 1.571L4.57 6.572h10.172c.694 0 1.257.563 1.257 1.257s-.563 1.257-1.257 1.257H4.229l4.557 4.557c.433.434.433 1.137 0 1.571-.434.434-1.138.434-1.572 0L0 8 7.214.786z"/>
          </svg>
        </button>
        <button class="section-navigation__submit" data-section-id="${key}" type="submit" data-label="Give $AMOUNT$FREQUENCY now">
          <span>Give Now</span>
        </button>
      `;
      } else {
        sectionNavigation.innerHTML = `
        <button class="section-navigation__previous" data-section-id="${key}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
              <path fill="var(--color_primary)" d="M7.214.786c.434-.434 1.138-.434 1.572 0 .433.434.433 1.137 0 1.571L4.57 6.572h10.172c.694 0 1.257.563 1.257 1.257s-.563 1.257-1.257 1.257H4.229l4.557 4.557c.433.434.433 1.137 0 1.571-.434.434-1.138.434-1.572 0L0 8 7.214.786z"/>
          </svg>
        </button>
        <button class="section-navigation__next" data-section-id="${key}">
          <span>Continue</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 14 14">
              <path fill="#fff" d="M7.687 13.313c-.38.38-.995.38-1.374 0-.38-.38-.38-.996 0-1.375L10 8.25H1.1c-.608 0-1.1-.493-1.1-1.1 0-.608.492-1.1 1.1-1.1h9.2L6.313 2.062c-.38-.38-.38-.995 0-1.375s.995-.38 1.374 0L14 7l-6.313 6.313z"/>
          </svg>
        </button>
      `;
      }

      sectionNavigation
        .querySelector(".section-navigation__previous")
        ?.addEventListener("click", (e) => {
          e.preventDefault();
          this.scrollToSection(key - 1);
        });

      sectionNavigation
        .querySelector(".section-navigation__next")
        ?.addEventListener("click", (e) => {
          e.preventDefault();
          if (this.validateForm(key)) {
            this.scrollToSection(key + 1);
          }
        });

      sectionNavigation
        .querySelector(".section-navigation__submit")
        ?.addEventListener("click", (e) => {
          e.preventDefault();
          // Validate the entire form again
          if (this.validateForm()) {
            // Send Basic User Data to Parent
            this.sendMessage(
              "donationinfo",
              JSON.stringify({
                name: document.querySelector("#en__field_supporter_firstName")
                  .value,
                amount:
                  window.EngagingNetworks.require._defined.enjs.getDonationTotal(),
                frequency: this.frequency.getInstance().frequency,
              })
            );
            // Only shows cortain if payment is not paypal
            const paymentType = document.querySelector(
              "#en__field_transaction_paymenttype"
            ).value;
            if (paymentType != "paypal") {
              this.sendMessage("status", "loading");
            } else {
              // If Paypal, submit the form on a new tab
              const thisClass = this;
              document.addEventListener("visibilitychange", function () {
                if (document.visibilityState === "visible") {
                  thisClass.sendMessage("status", "submitted");
                } else {
                  thisClass.sendMessage("status", "loading");
                }
              });
              document.querySelector("form.en__component").target = "_blank";
            }
            document.querySelector("form.en__component").submit();
          }
        });
      section.querySelector(".en__component").append(sectionNavigation);
    });
  }
  // Scroll to a section
  scrollToSection(sectionId) {
    console.log("DonationLightboxForm: scrollToSection", sectionId);
    const section = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (this.sections[sectionId]) {
      console.log(section);
      this.sections[sectionId].scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
    }
    if (sectionId > 0) {
      this.sendMessage("status", "footer");
    }
  }
  // Scroll to an element's section
  scrollToElement(element) {
    if (element) {
      const sectionId = this.getSectionId(element);
      if (sectionId) {
        this.scrollToSection(sectionId);
      }
    }
  }
  // Get Element's section id
  getSectionId(element) {
    if (element) {
      return element.closest("[data-section-id]").dataset.sectionId;
    }
    return false;
  }

  // Validate the form
  validateForm(sectionId = false) {
    const form = document.querySelector("form.en__component");

    // Validate Frequency
    const frequency = form.querySelector(
      "[name='transaction.recurrfreq']:checked"
    );
    const frequencyBlock = form.querySelector(".en__field--recurrfreq");
    const frequencySection = this.getSectionId(frequencyBlock);
    if (sectionId === false || sectionId == frequencySection) {
      if (!frequency || !frequency.value) {
        this.scrollToElement(
          form.querySelector("[name='transaction.recurrfreq']:checked")
        );
        this.sendMessage("error", "Please select a frequency");
        if (frequencyBlock) {
          frequencyBlock.classList.add("has-error");
        }
        return false;
      } else {
        if (frequencyBlock) {
          frequencyBlock.classList.remove("has-error");
        }
      }
    }

    // Validate Amount
    const amount = this.checkNested(
      window.EngagingNetworks,
      "require",
      "_defined",
      "enjs",
      "getDonationTotal"
    )
      ? window.EngagingNetworks.require._defined.enjs.getDonationTotal()
      : 0;
    const amountBlock = form.querySelector(".en__field--donationAmt");
    const amountSection = this.getSectionId(amountBlock);
    if (sectionId === false || sectionId == amountSection) {
      if (!amount || amount <= 0) {
        this.scrollToElement(amountBlock);
        this.sendMessage("error", "Please enter a valid amount");
        if (amountBlock) {
          amountBlock.classList.add("has-error");
        }
        return false;
      } else {
        if (amountBlock) {
          amountBlock.classList.remove("has-error");
        }
      }
    }
    // Validate Payment Method
    const paymentType = form.querySelector(
      "#en__field_transaction_paymenttype"
    );
    const ccnumber = form.querySelector("#en__field_transaction_ccnumber");
    const ccnumberBlock = form.querySelector(".en__field--ccnumber");
    const ccnumberSection = this.getSectionId(ccnumberBlock);
    console.log(
      "DonationLightboxForm: validateForm",
      ccnumberBlock,
      ccnumberSection
    );
    if (sectionId === false || sectionId == ccnumberSection) {
      if (!paymentType || !paymentType.value) {
        this.scrollToElement(paymentType);
        this.sendMessage("error", "Please add your credit card information");
        if (ccnumberBlock) {
          ccnumberBlock.classList.add("has-error");
        }
        return false;
      }
      // If payment type is not paypal, check credit card expiration and cvv
      if (paymentType.value !== "paypal") {
        if (!ccnumber || !ccnumber.value) {
          this.scrollToElement(ccnumber);
          this.sendMessage("error", "Please add your credit card information");
          if (ccnumberBlock) {
            ccnumberBlock.classList.add("has-error");
          }
          return false;
        } else {
          if (ccnumberBlock) {
            ccnumberBlock.classList.remove("has-error");
          }
        }
        if (/^\d+$/.test(ccnumber.value) === false) {
          this.scrollToElement(ccnumber);
          this.sendMessage("error", "Only numbers are allowed on credit card");
          if (ccnumberBlock) {
            ccnumberBlock.classList.add("has-error");
          }
          return false;
        } else {
          if (ccnumberBlock) {
            ccnumberBlock.classList.remove("has-error");
          }
        }
        const ccexpire = form.querySelectorAll("[name='transaction.ccexpire']");
        const ccexpireBlock = form.querySelector(".en__field--ccexpire");
        let ccexpireValid = true;
        ccexpire.forEach((e) => {
          if (!e.value) {
            this.scrollToElement(ccexpireBlock);
            this.sendMessage("error", "Please enter a valid expiration date");
            if (ccexpireBlock) {
              ccexpireBlock.classList.add("has-error");
            }
            ccexpireValid = false;
            return false;
          }
        });
        if (!ccexpireValid && ccexpireBlock) {
          return false;
        } else {
          if (ccexpireBlock) {
            ccexpireBlock.classList.remove("has-error");
          }
        }

        const cvv = form.querySelector("#en__field_transaction_ccvv");
        const cvvBlock = form.querySelector(".en__field--ccvv");
        if (!cvv || !cvv.value) {
          this.scrollToElement(cvv);
          this.sendMessage("error", "Please enter a valid CVV");
          if (cvvBlock) {
            cvvBlock.classList.add("has-error");
          }
          return false;
        } else {
          if (cvvBlock) {
            cvvBlock.classList.remove("has-error");
          }
        }
      }
    }
    // Validate Everything else
    const mandatoryFields = form.querySelectorAll(".en__mandatory");
    let hasError = false;
    mandatoryFields.forEach((field) => {
      if (hasError) {
        return;
      }
      const fieldElement = field.querySelector(".en__field__input");
      const fieldLabel = field.querySelector(".en__field__label");
      const fieldSection = this.getSectionId(fieldElement);
      if (sectionId === false || sectionId == fieldSection) {
        if (!fieldElement.value) {
          this.scrollToElement(fieldElement);
          this.sendMessage("error", "Please enter " + fieldLabel.textContent);
          field.classList.add("has-error");
          hasError = true;
          return false;
        } else {
          field.classList.remove("has-error");
        }
        // If it's the e-mail field, check if it's a valid email
        if (
          fieldElement.name === "supporter.emailAddress" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldElement.value) === false
        ) {
          this.scrollToElement(fieldElement);
          this.sendMessage("error", "Please enter a valid email address");
          field.classList.add("has-error");
          hasError = true;
          return false;
        }
      }
    });
    if (hasError) {
      return false;
    }
    // Validate City Characters Limit
    const city = form.querySelector("#en__field_supporter_city");
    const cityBlock = form.querySelector(".en__field--city");
    if (!this.checkCharsLimit("#en__field_supporter_city", 100)) {
      this.scrollToElement(city);
      this.sendMessage("error", "This field only allows up to 100 characters");
      if (cityBlock) {
        cityBlock.classList.add("has-error");
      }
      return false;
    } else {
      if (cityBlock) {
        cityBlock.classList.remove("has-error");
      }
    }
    // Validate Street Address line 1 Characters Limit
    const streetAddress1 = form.querySelector("#en__field_supporter_address1");
    const streetAddress1Block = form.querySelector(".en__field--address1");
    if (!this.checkCharsLimit("#en__field_supporter_address1", 35)) {
      this.scrollToElement(streetAddress1);
      this.sendMessage(
        "error",
        "This field only allows up to 35 characters. Longer street addresses can be broken up between Lines 1 and 2."
      );
      if (streetAddress1Block) {
        streetAddress1Block.classList.add("has-error");
      }
      return false;
    } else {
      if (streetAddress1Block) {
        streetAddress1Block.classList.remove("has-error");
      }
    }
    // Validate Street Address line 2 Characters Limit
    const streetAddress2 = form.querySelector("#en__field_supporter_address2");
    const streetAddress2Block = form.querySelector(".en__field--address2");
    if (!this.checkCharsLimit("#en__field_supporter_address2", 35)) {
      this.scrollToElement(streetAddress2);
      this.sendMessage(
        "error",
        "This field only allows up to 35 characters. Longer street addresses can be broken up between Lines 1 and 2."
      );
      if (streetAddress2Block) {
        streetAddress2Block.classList.add("has-error");
      }
      return false;
    } else {
      if (streetAddress2Block) {
        streetAddress2Block.classList.remove("has-error");
      }
    }
    // Validate Zip Code Characters Limit
    const zipCode = form.querySelector("#en__field_supporter_postcode");
    const zipCodeBlock = form.querySelector(".en__field--postcode");
    if (!this.checkCharsLimit("#en__field_supporter_postcode", 20)) {
      this.scrollToElement(zipCode);
      this.sendMessage("error", "This field only allows up to 20 characters");
      if (zipCodeBlock) {
        zipCodeBlock.classList.add("has-error");
      }
      return false;
    } else {
      if (zipCodeBlock) {
        zipCodeBlock.classList.remove("has-error");
      }
    }

    // Validate First Name Characters Limit
    const firstName = form.querySelector("#en__field_supporter_firstName");
    const firstNameBlock = form.querySelector(".en__field--firstName");
    if (!this.checkCharsLimit("#en__field_supporter_firstName", 100)) {
      this.scrollToElement(firstName);
      this.sendMessage("error", "This field only allows up to 100 characters");
      if (firstNameBlock) {
        firstNameBlock.classList.add("has-error");
      }
      return false;
    } else {
      if (firstNameBlock) {
        firstNameBlock.classList.remove("has-error");
      }
    }
    // Validate Last Name Characters Limit
    const lastName = form.querySelector("#en__field_supporter_lastName");
    const lastNameBlock = form.querySelector(".en__field--lastName");
    if (!this.checkCharsLimit("#en__field_supporter_lastName", 100)) {
      this.scrollToElement(lastName);
      this.sendMessage("error", "This field only allows up to 100 characters");
      if (lastNameBlock) {
        lastNameBlock.classList.add("has-error");
      }
      return false;
    } else {
      if (lastNameBlock) {
        lastNameBlock.classList.remove("has-error");
      }
    }
    console.log("DonationLightboxForm: validateForm PASSED");
    return true;
  }
  checkCharsLimit(field, max) {
    const fieldElement = document.querySelector(field);
    if (fieldElement && fieldElement.value.length > max) {
      return false;
    }
    return true;
  }

  // Bounce Arrow Up and Down
  bounceArrow(freq) {
    const arrow = document.querySelector(".monthly-upsell-message");
    if (arrow && freq === "onetime") {
      arrow.classList.add("bounce");
      setTimeout(() => {
        arrow.classList.remove("bounce");
      }, 1000);
    }
  }
  changeSubmitButton() {
    const submit = document.querySelector(".section-navigation__submit");
    const amount = this.checkNested(
      window.EngagingNetworks,
      "require",
      "_defined",
      "enjs",
      "getDonationTotal"
    )
      ? "$" + window.EngagingNetworks.require._defined.enjs.getDonationTotal()
      : null;
    let frequency = this.frequency.getInstance().frequency;
    let label = submit ? submit.dataset.label : "";
    frequency = frequency === "onetime" ? "" : "<small>/mo</small>";

    if (amount) {
      label = label.replace("$AMOUNT", amount);
      label = label.replace("$FREQUENCY", frequency);
    } else {
      label = label.replace("$AMOUNT", "");
      label = label.replace("$FREQUENCY", "");
    }

    if (submit && label) {
      submit.innerHTML = `<span>${label}</span>`;
    }
  }
  clickPaymentOptions(opts) {
    opts.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const paymentType = document.querySelector(
          "#en__field_transaction_paymenttype"
        );
        if (paymentType) {
          paymentType.value = btn.className.substr(15);
          // Go to the next section
          this.scrollToSection(
            parseInt(btn.closest("[data-section-id]").dataset.sectionId) + 1
          );
        }
      });
    });
  }
  // Append arrow SVG to the monthly upsell message
  putArrowUpSVG() {
    const arrow = document.querySelector(".monthly-upsell-message");
    if (arrow) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.classList.add(this.setArrowPosition());
      svg.classList.add("monthly-upsell-message__arrow");
      svg.setAttribute("viewBox", "0 0 21 40");
      svg.setAttribute("preserveAspectRatio", "xMidYMid");
      svg.innerHTML = `<path fill="currentColor" d="M16.578 4.68c-.581-.596-1.748-1.65-2.638-1.094-.553.344-.847 1.109-1.171 1.667-.371.641-.738 1.283-1.1 1.93-.695 1.248-1.365 2.51-1.99 3.794-1.206 2.492-2.228 5.146-2.825 7.855-.96 4.35-.574 9.438.985 13.607.981 2.622 2.461 5.004 4.555 6.883.39.352 1.42 1.11 1.781.354.344-.72-.748-1.92-1.182-2.322-1.37-1.266-2.264-3.404-2.693-5.502-.49-2.394-.429-4.934.037-7.327.552-2.836 1.607-5.558 2.882-8.14.703-1.425 1.457-2.825 2.252-4.199.398-.685.806-1.365 1.22-2.042.451-.738 1.168-1.555 1.31-2.41.186-1.146-.673-2.29-1.423-3.055z"/>
        <path fill="currentColor" d="M19.44 1.424C18.95.862 17.91-.183 17.064.028c-1.897.471-3.446 1.651-4.945 2.849-1.424 1.136-2.846 2.276-4.25 3.435-2.826 2.333-5.823 4.69-7.78 7.84-.654 1.056 2.438 4.04 3.053 3.117 1.984-2.983 5.07-5.029 8.061-6.895 1.422-.886 2.875-1.734 4.169-2.807.22-.183.442-.372.666-.564-.062 1.105-.104 2.214-.12 3.33-.019 1.621-.017 3.246.002 4.867.02 1.686-.054 3.421.107 5.1.11 1.153 1.024 2.277 1.905 2.955.33.255 2.036 1.328 2.15.269.347-3.215-.033-6.574-.072-9.806-.039-3.224-.087-6.564.48-9.75.165-.915-.482-1.889-1.052-2.544z"/>`;
      arrow.appendChild(svg);
    }
  }
  // Return the arrow position
  setArrowPosition() {
    const frequencyWrapper = document.querySelector(
      ".en__field--recurrfreq .en__field__element--radio"
    );
    if (frequencyWrapper) {
      const left = frequencyWrapper.querySelector(
        '.en__field__item:first-child input[value="MONTHLY"]'
      );
      const right = frequencyWrapper.querySelector(
        '.en__field__item:last-child input[value="MONTHLY"]'
      );
      if (left) {
        return "left";
      }
      if (right) {
        return "right";
      }
    }
    return null;
  }
  // Return true if you are in Canada, checking 3 conditions
  // 1 - You are using a Canadian ip address
  // 2 - You choose Canada as your country
  // 3 - Your browser language is en-CA
  isCanada() {
    const country = document.querySelector("#en__field_supporter_country");
    if (country) {
      if (country.value === "CA") {
        return true;
      }
    }
    const lang = window.navigator.userLanguage || window.navigator.language;
    if (lang === "en-CA" || this.ipCountry === "CA") {
      return true;
    }
    return false;
  }
  // Display and check the class canada-only if you are in Canada
  canadaOnly() {
    const canadaOnly = document.querySelectorAll(".canada-only");
    if (canadaOnly.length) {
      if (this.isCanada()) {
        canadaOnly.forEach((item) => {
          item.style.display = "";
          const input = item.querySelectorAll("input[type='checkbox']");
          if (input.length) {
            input.forEach((input) => {
              input.checked = false;
            });
          }
        });
      } else {
        canadaOnly.forEach((item) => {
          item.style.display = "none";
          const input = item.querySelectorAll("input[type='checkbox']");
          if (input.length) {
            input.forEach((input) => {
              input.checked = true;
            });
          }
        });
      }
    }
  }
  // Email validation
  validateEmail(email) {
    const url = `https://services.peta.org/api/v1/validate/email?email=${email}&lang=en`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        const petaEmailValidator = document.querySelector(
          "#petaEmailValidator"
        );
        if (petaEmailValidator) {
          if (data.suggestion) {
            const message = `Did you mean <a href="#" class="set-suggestion">${data.suggestion.match}</a>?`;
            petaEmailValidator.querySelector(".message").innerHTML = message;
            petaEmailValidator.classList.add("show");
          } else {
            petaEmailValidator.classList.remove("show");
          }
        }
      });
  }
  checkNested(obj, level, ...rest) {
    if (obj === undefined) return false;
    if (rest.length == 0 && obj.hasOwnProperty(level)) return true;
    return this.checkNested(obj[level], ...rest);
  }
}
