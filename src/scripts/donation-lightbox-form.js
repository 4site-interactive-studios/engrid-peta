import { elementScrollIntoView } from "seamless-scroll-polyfill";
export default class DonationLightboxForm {
  constructor(DonationAmount, DonationFrequency) {
    this.amount = DonationAmount;
    this.frequency = DonationFrequency;
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
            urlParams.get("name")
          );
          engridContent = engridContent.replace(
            "{receipt_data~recurringFrequency}",
            urlParams.get("frequency")
          );
          engridContent = engridContent.replace(
            "{receipt_data~amount}",
            "$" + urlParams.get("amount")
          );
          engrid.innerHTML = engridContent;
        }
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
      if (EngagingNetworks.require._defined.enjs.checkSubmissionFailed()) {
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
                "Sorry! There's a problem processing your donation."
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
    }
    let paymentOpts = document.querySelector(".payment-options");
    if (paymentOpts) {
      this.clickPaymentOptions(paymentOpts);
    }

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
              <path fill="#418FDE" d="M7.214.786c.434-.434 1.138-.434 1.572 0 .433.434.433 1.137 0 1.571L4.57 6.572h10.172c.694 0 1.257.563 1.257 1.257s-.563 1.257-1.257 1.257H4.229l4.557 4.557c.433.434.433 1.137 0 1.571-.434.434-1.138.434-1.572 0L0 8 7.214.786z"/>
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
              <path fill="#418FDE" d="M7.214.786c.434-.434 1.138-.434 1.572 0 .433.434.433 1.137 0 1.571L4.57 6.572h10.172c.694 0 1.257.563 1.257 1.257s-.563 1.257-1.257 1.257H4.229l4.557 4.557c.433.434.433 1.137 0 1.571-.434.434-1.138.434-1.572 0L0 8 7.214.786z"/>
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
                  EngagingNetworks.require._defined.enjs.getDonationTotal(),
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
      elementScrollIntoView(this.sections[sectionId], {
        behavior: "smooth",
        block: "start",
        inline: "start",
      });
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
    const amount = EngagingNetworks.require._defined.enjs.getDonationTotal();
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
      // If payment type is not paypal or apple pay, check credit card expiration and cvv
      if (paymentType.value !== "paypal" && paymentType.value !== "applepay") {
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
    console.log("DonationLightboxForm: validateForm PASSED");
    return true;
  }
  // Bounce Arrow Up and Down
  bounceArrow(freq) {
    const arrow = document.querySelector(".monthly-upsell-message");
    if (arrow && freq === "no") {
      arrow.classList.add("bounce");
      setTimeout(() => {
        arrow.classList.remove("bounce");
      }, 1000);
    }
  }
  changeSubmitButton() {
    const submit = document.querySelector(".section-navigation__submit");
    const amount =
      "$" + EngagingNetworks.require._defined.enjs.getDonationTotal();
    let frequency = this.frequency.getInstance().frequency;
    let label = submit.dataset.label;
    frequency = frequency === "no" ? "" : "<small>/mo</small>";

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
}
