## Features

- Provides a "Hide in Queue" powerup that hides the tagged Rem in the queue.
- Also provides a "Remove from Queue" powerup which removes the targged Rem from the hierarchy in the queue.

## How to Use

### Hide In Queue

Tag any Rem with "Hide in Queue" (using the command). Its content will be replaced with "Hidden in Queue":

**Editor:**
![](https://i.imgur.com/06IHTFp.png)

**Queue:**
![](https://i.imgur.com/nntgSw1.png)

### Remove from Queue

Tag any Rem with "Remove from Queue" (using the command). Its content will be completely removed.

**Editor:**
<br/>
![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/editor.png)

**Queue:**
<br/>
![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/queue.png)

### No Hierarchy

Tag any Rem with "No Hierarchy" (using the command). Any ancestors will be hidden on the front and back of the flashcard.

**Editor:**
<br/>
![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/no-hier-ed.png)

**Queue:**
<br/>
![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/no-hier-queue.png)

### Hide Parent

Tag any Rem with "Hide Parent" (using the command `Hide Parent` or `/hp`)). Its immediate parent will be hidden on the front of the flashcard, but revealed on the back. (Similar to **Hide in Queue**, but instead of tagging the parent Rem, the user tags the specific flashcard Rem, so that other flashcards descendants of the same parent Rem are not affected.)

**Editor:**
<br/>
![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/hide-parent-editor.png)

**Queue:**
<br/>
![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/hide-parent-queue-question.png)

![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/hide-parent-queue-answer.png)


### Hide Grandparent

Tag any Rem with "Hide Grandparent" (using the command `Hide Grandparent` or `/hgp`). Its grandparent will be hidden on the front of the flashcard, but revealed on the back.

**Editor:**
<br/>
![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/hide-grandparent-editor.png)

**Queue:**
<br/>
![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/hide-grandparent-queue-question.png)

![](https://raw.githubusercontent.com/remnoteio/remnote-official-plugins/main/hide-in-queue/images/hide-grandparent-queue-answer.png)

## Developers

This plugin is an example plugin built by the RemNote team to demonstrate how to build plugins using the new plugin SDK. The source code has been extensively documented to explain the various API functions.

If you are interested in building your own plugins, taking a look through the source code for this plugin (as well as the other example plugins and plugins built by the community) would be a great starting point. Of course, you should also check out the official documentation, guides and tutorials on our [plugin website](https://plugins.remnote.com/).

If you are new to writing plugins, we recommend checking out the [dictionary plugin project tutorial](https://plugins.remnote.com/in-depth-tutorial/overview).
