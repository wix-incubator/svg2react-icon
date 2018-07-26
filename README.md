# svg2react-icon


> A library to generate reusable React Icon components from raw SVG icons

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

Options:
```console
  --typescript    generate TypeScript components instead of JS
  --monochrome    strip all fill and stroke attributes
  --namedExport   use named export instead of export default
```

## License

MIT
