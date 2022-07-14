# RemNote Plugin Template 

## Required Software

You'll need the following software to start developing:

1. [Node.js](https://nodejs.org/en/download/) v14.

Please note that v14 is **not the latest version of node** - ensure that the version you install is **v14** rather than the latest version, or your plugin will not compile properly.

2. [A GitHub Account](https://github.com/)

3. [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

4. An IDE or Text Editor

We recommend using [Visual Studio Code](https://code.visualstudio.com/), but any other IDE or text editor will work.

## Template Setup Guide

### Clone the Template

- Click on the Clone or download button
- Press "Use HTTPS"
- Copy the link
- Open a terminal in the directory where you want to clone the repository
- Run `git clone <link>` to download the template repository.

### Running the Template

Open your terminal of choice and navigate into the folder of the repository you just cloned. If you are interested in learning about the structure of the plugin template, check the [template documentation](./03_parts_of_template.md) page.

First, check that you have installed the correct version of Node.js (v14).

```bash
node -v
```

Then run:

```bash
npm install
```

This will install a very minimal React App, along with the RemNote plugin SDK (software development kit).

### Start your plugin

Inside the plugin folder, run:

```bash
npm run dev-sandbox-only
```

## Resources

If you are interested in building your own plugins, taking a look through the source code for our example plugins and plugins built by the community would be a great starting point. Of course, you should also check out the official documentation, guides and tutorials on our [plugin website](https://plugins.remnote.com). If you are new to writing plugins, we recommend checking out the [dictionary plugin project tutorial](https://plugins.remnote.com/tutorials/project).
