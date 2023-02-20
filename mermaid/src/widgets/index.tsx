import { declareIndexPlugin, ReactRNPlugin, RichTextInterface, WidgetLocation } from "@remnote/plugin-sdk";
import "../style.css";

export const MERMAID_POWERUP = "memaid_powerup";

const STYLE = `
:root{--mermaid-border: #ddd;--mermaid-border-dark: #535353;--mermaid-block: #f7f6f3;--mermaid-block-dark: #2b2b33;--mermaid-input: #f7f6f3;--mermaid-input-dark: #2b2b33}[data-rem-container-tags~=mermaid]{border:1px solid var(--mermaid-border);border-radius:4px;padding:.5rem;margin-top:.5rem;margin-bottom:.5rem;margin-left:1.6rem}[data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid]{background-color:var(--mermaid-input)}[data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid]>.rn-editor__rem__body__text,[data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid]>div>.rn-editor__rem__body__text{min-height:2rem}[data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid] .rem-button__container{left:-5.2rem}[data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid] .hierarchy-editor__tag-bar__tag{display:none}[data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid] #code-node{background-color:var(--mermaid-block)}[data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid]:not(rem-container--focused) #code-node{display:none}[data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid].rem-container--focused #code-node{display:block}[data-document-tags~=mermaid] .rn-doc-title #code-node{font-size:1rem}[data-document-tags~=mermaid] [data-rem-container-tags~=mermaid]>div>div:first-child{display:none}.dark [data-rem-container-tags~=mermaid]{border:1px solid var(--mermaid-border-dark);border-radius:4px;padding:.5rem;margin-top:.5rem;margin-bottom:.5rem;margin-left:1.6rem}.dark [data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid]{background-color:var(--mermaid-input-dark)}.dark [data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid]>.rn-editor__rem__body__text,.dark [data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid]>div>.rn-editor__rem__body__text{min-height:2rem}.dark [data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid] .rem-button__container{left:-5.2rem}.dark [data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid] .hierarchy-editor__tag-bar__tag{display:none}.dark [data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid] #code-node{background-color:var(--mermaid-block-dark)}.dark [data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid]:not(rem-container--focused) #code-node{display:none}.dark [data-rem-container-tags~=mermaid] [data-rem-tags~=mermaid].rem-container--focused #code-node{display:block}.dark [data-document-tags~=mermaid] .rn-doc-title #code-node{font-size:1rem}.dark [data-document-tags~=mermaid] [data-rem-container-tags~=mermaid]>div>div:first-child{display:none}
`;

const SAMPLE_MERMAID: RichTextInterface = [
  {
    text: `
flowchart TD
  Start
    `.trim(),
    i: "m",
    code: true,
  },
];

async function onActivate(plugin: ReactRNPlugin) {
  await plugin.app.registerPowerup("Mermaid", MERMAID_POWERUP, "A Mermaid plugin", {
    slots: [{ code: "Coding", name: "Code" }],
  });

  await plugin.app.registerWidget("mermaid", WidgetLocation.UnderRemEditor, {
    dimensions: { height: "auto", width: "100%" },
    powerupFilter: MERMAID_POWERUP,
  });

  await plugin.app.registerCommand({
    id: "mermaid",
    name: "Mermaid",
    action: async () => {
      const rem = await plugin.focus.getFocusedRem();
      await rem?.addPowerup(MERMAID_POWERUP);
      await rem?.setText(SAMPLE_MERMAID);
    },
  });
  await plugin.app.registerCSS("mermaidcss", STYLE);
}

async function onDeactivate(_: ReactRNPlugin) {}

declareIndexPlugin(onActivate, onDeactivate);
