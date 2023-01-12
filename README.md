# svg2react-icon

---
📌 **Deprecation Notice**


```diff
- As of 1.1.2023 This repository is deprecated!
- It is no longer maintained by Components.
```

Feel free to 
If you need react compatible icons please install [@wix/wix-ui-icons-common](https://github.com/wix-private/wix-design-systems-utils/tree/master/packages/wix-ui-icons-common)

---

---

---

---

A library to generate reusable React Icon components from raw SVG icons

## Features

* Create a React Icon component file for each raw SVG icon file
* Rename illegal SVG attributes
* Optimize the SVG (remove comments, unnecessary parts, etc)
* Remove colors so that the parent's font-color will be cascaded to the icon
* *Optional* - output TypeScript components

## Install

```bash
npm install --save-dev svg2react-icon
```

## Sample usage

In your `package.json`:

```js
{
  "scripts": {
    "build": "svg2react-icon [options] <inputDir> <outputDir>",
    ...
  }
}
```

Or in the command-line:

```console
svg2react-icon [options] <inputDir> <outputDir>
```

By default, the files that will be generated are:

```
outputDir
|
+ -- index.ts
|
+ -- components
    |
    Icon1.tsx
    ... 
```

By using the `--no-sub-dir` the `index` file and all the icons will be 
generated in the `outputDir` without the extra `components` folder. 

Options:
```console
  --typescript    generate TypeScript components instead of JS
  --monochrome    strip all fill and stroke attributes
  --named-export  use named export instead of export default
  --keep-colors   keep svg fill and stroke colors
  --no-sub-dir    Output index file and components all inside the output directory
```

## License

MIT
