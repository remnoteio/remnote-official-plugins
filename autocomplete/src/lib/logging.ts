import { RNPlugin } from "@remnote/plugin-sdk";

function getTime() {
  return new Date().toTimeString().substr(0, 8);
}

export function log(
  plugin: RNPlugin,
  message: string,
  notify: boolean = false
) {
  console.log(`[${getTime()}] (Autocomplete Plugin): ${message}`);
  if (notify) {
    plugin.app.toast(message);
  }
}
