// import { Options, App } from "@4site/engrid-common"; // Uses ENGrid via NPM
import {
  Options,
  App,
  DonationFrequency,
  DonationAmount,
} from "../../engrid-scripts/packages/common"; // Uses ENGrid via Visual Studio Workspace
// import { DonationAmount, , EnForm, ProcessingFees } from "../../engrid-scripts/packages/common";
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
  onLoad: () => console.log("Starter Theme Loaded"),
  onResize: () => console.log("Starter Theme Window Resized"),
};
new App(options);

window.addEventListener("load", function () {
  (<any>window).DonationLightboxForm = DonationLightboxForm;
  new DonationLightboxForm(DonationAmount, DonationFrequency);
});
