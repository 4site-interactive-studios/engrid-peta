import {
  Options,
  App,
  DonationFrequency,
  DonationAmount,
} from "@4site/engrid-common"; // Uses ENGrid via NPM
// import {
//   Options,
//   App,
//   DonationFrequency,
//   DonationAmount,
// } from "../../engrid-scripts/packages/common"; // Uses ENGrid via Visual Studio Workspace
import "./sass/main.scss";

import DonationLightboxForm from "./scripts/donation-lightbox-form";

const options: Options = {
  applePay: false,
  CapitalizeFields: true,
  ClickToExpand: true,
  CurrencySymbol: "$",
  DecimalSeparator: ".",
  MediaAttribution: true,
  SkipToMainContentLink: true,
  SrcDefer: true,
  // ProgressBar: true,
  Debug: App.getUrlParameter("debug") == "true" ? true : false,
  onLoad: () => {
    (<any>window).DonationLightboxForm = DonationLightboxForm;
    new DonationLightboxForm(DonationAmount, DonationFrequency);
    // Check if the field External Reference 6 is present, if not, create it
    const extRef6 = document.querySelector(
      "input[name='en_txn6']"
    ) as HTMLInputElement;
    const refURL =
      window.location != window.parent.location
        ? document.referrer
        : document.location.href;
    if (!extRef6) {
      App.createHiddenInput("en_txn6", refURL);
    } else {
      extRef6.value = refURL;
    }
  },
  onResize: () => console.log("Starter Theme Window Resized"),
};
new App(options);
