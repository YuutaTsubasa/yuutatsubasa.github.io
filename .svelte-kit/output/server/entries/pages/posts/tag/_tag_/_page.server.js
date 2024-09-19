import { t as tagColors } from "../../../../../chunks/settings.js";
function entries() {
  return Object.keys(tagColors).map((tag) => ({ tag: encodeURIComponent(tag) }));
}
const prerender = true;
export {
  entries,
  prerender
};
