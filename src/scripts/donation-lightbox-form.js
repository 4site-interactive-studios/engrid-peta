export default class DonationLightboxForm {
  constructor() {
    console.log("DonationLightboxForm: constructor");
    // Each EN Row is a Section
    this.sections = document.querySelectorAll(
      "form.en__component > .en__component"
    );
    // Check if we're on the Thank You page
    if (pageJson.pageNumber === pageJson.pageCount) {
      this.sendMessage("status", "celebrate");
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
        this.sendMessage("error", "Submission Failed");
      }
    }
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
        <button class="section-navigation__submit" data-section-id="${key}" type="submit">
          <span>Give $AMOUNT $FREQUENCY now</span>
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
          if (this.validateSection(key)) {
            this.scrollToSection(key + 1);
          } else {
            this.sendMessage("error", "All fields are required");
          }
        });

      sectionNavigation
        .querySelector(".section-navigation__submit")
        ?.addEventListener("click", (e) => {
          e.preventDefault();
          if (this.validateSection(key)) {
            this.sendMessage("status", "loading");
            document.querySelector("form.en__component").submit();
          } else {
            this.sendMessage("error", "All fields are required");
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
  }
  // Validate a section
  validateSection(sectionId) {
    console.log(
      "DonationLightboxForm: validateSection",
      this.sections[sectionId]
    );
    return true;
  }
}
