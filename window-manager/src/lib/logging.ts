import { RNPlugin } from "@remnote/plugin-sdk";

function getTime() {
  return new Date().toTimeString().substr(0, 8);
}

export function log(
  plugin: RNPlugin,
  message: string,
  notify: boolean = false
) {
  console.log(`[${getTime()}] (Window Manager Plugin): ${message}`);
  if (notify) {
    plugin.toast(message, { autoClose: 2000 });
  }
}
