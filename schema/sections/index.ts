import hero from "./hero";
import pageHeader from "./pageHeader";
import textMedia from "./textMedia";
import cardGrid from "./cardGrid";
import uspGrid from "./uspGrid";
import checklist from "./checklist";
import cta from "./cta";
import collectionList from "./collectionList";
import logoMarquee from "./logoMarquee";
import steps from "./steps";
import contact from "./contact";

export const sectionTypes = [hero, pageHeader, textMedia, cardGrid, uspGrid, checklist, cta, collectionList, logoMarquee, steps, contact];
export const sectionNames = sectionTypes.map((t) => ({ type: t.name }));
