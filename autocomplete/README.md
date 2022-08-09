## Features

- Provides Autocomplete suggestions in a popup menu based on words present in the current document.

Note: Currently only works with whitespace-delimited languages like English.

## How to Use

- The default hotkeys are:
  - `down`: select the next suggestion.
  - `up`: select the previous suggestion.
  - `tab`: insert the currently selected suggestion into the editor.
- You can customise the hotkeys in the settings.
  - Note that hotkeys for this plugin must be specified as text in the settings - eg. `ctrl+n` or `enter` rather than using the normal hotkey system in RemNote.

## Developers

This plugin is an example plugin built by the RemNote team to demonstrate how to build plugins using the new plugin SDK. The source code has been extensively documented to explain the various API functions.

If you are interested in building your own plugins, taking a look through the source code for this plugin (as well as the other example plugins and plugins built by the community) would be a great starting point. Of course, you should also check out the official documentation, guides and tutorials on our [plugin website](https://plugins.remnote.com/).

If you are new to writing plugins, we recommend checking out the [dictionary plugin project tutorial](https://plugins.remnote.com/in-depth-tutorial/overview).
