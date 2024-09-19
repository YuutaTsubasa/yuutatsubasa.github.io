import { c as create_ssr_component, e as escape } from "./ssr.js";
const css = {
  code: ".error-container.svelte-1qt7fvw{display:flex;justify-content:center;align-items:center;height:100vh;width:100vw;font-size:6rem;font-weight:bold;color:white;background-size:cover;background-position:center;background-repeat:no-repeat;background-image:url('/images/background.webp');text-align:center}",
  map: `{"version":3,"file":"ErrorMessage.svelte","sources":["ErrorMessage.svelte"],"sourcesContent":["<script>\\n    export let message = \\"發生錯誤，請嘗試返回首頁看看。\\"; // 默認的錯誤訊息\\n  <\/script>\\n  \\n  <style>\\n    .error-container {\\n      display: flex;\\n      justify-content: center;\\n      align-items: center;\\n      height: 100vh;\\n      width: 100vw;\\n      font-size: 6rem;\\n      font-weight: bold;\\n      color: white; /* 使用 Tailwind 的黃色 */\\n      background-size: cover;\\n      background-position: center;\\n      background-repeat: no-repeat;\\n      background-image: url('/images/background.webp'); /* 背景圖片 */\\n      text-align: center;\\n    }\\n  </style>\\n  \\n  <p class=\\"error-container\\">{message}</p>"],"names":[],"mappings":"AAKI,+BAAiB,CACf,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,KAAK,CACb,KAAK,CAAE,KAAK,CACZ,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,IAAI,CACjB,KAAK,CAAE,KAAK,CACZ,eAAe,CAAE,KAAK,CACtB,mBAAmB,CAAE,MAAM,CAC3B,iBAAiB,CAAE,SAAS,CAC5B,gBAAgB,CAAE,8BAA8B,CAChD,UAAU,CAAE,MACd"}`
};
const ErrorMessage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { message = "發生錯誤，請嘗試返回首頁看看。" } = $$props;
  if ($$props.message === void 0 && $$bindings.message && message !== void 0) $$bindings.message(message);
  $$result.css.add(css);
  return `<p class="error-container svelte-1qt7fvw">${escape(message)}</p>`;
});
export {
  ErrorMessage as E
};
