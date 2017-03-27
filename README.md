# svg2react-icon


> A library to generate reusable React Icon components from raw SVG icons
 
## Features

* Create a React Icon component file for each raw SVG icon file
* Rename illegal SVG attributes
* Optimize the SVG (remove comments, unnecessary parts, etc)
* Remove colors so that the parent's font-color will be cascaded to the icon
* supports TypeScript component

## Install

```bash
npm install --save-dev svg2react-icon
```

## Sample usage

In your `package.json`:

```js
{
  "scripts": {     
    "build": "svg2react-icon [inputDir] [outputDir] [isTypeScript]",
    ...
  }
}
```

Or within the command-line:

```console
svg2react-icon [inputDir] [outputDir] [isTypeScrip]
```


## License

MIT