# Changelog

## Version 2.0

### Breaking changes:

* Typescript mode is activated by `--typescript` flag instead of positional argument

```shell
# v.1
svg2treact-icon <inputDir> <outputDir> true

# v.2
svg2treact-icon --typescript <inputDir> <outputDir>
```

* Icons no longer automatically flip when `rtl` class is added to the body. If you rely on this behavior you need to implement it in the component's CSS.

* `inputDir` and `outputDir` no longer have defaults and must be provided explicitly.

### Other changes:

* Added `--monochrome` flag that strips all `fill` and `stroke` attributes from SVG. It's recommended to use this flag, but make sure that it doesn't corrupt your icons. Icons that contain strokes or stack multiple paths on top of each other will break. Ask your designer to provide an icon with strokes converted to fills, and all layers flattened.

## Version 3.0

### Breaking changes:

* Fix bug with ignoring svg width and height, now if they available - they will be used, in other case, default size will be used, previously always default size was used
* Remove Icon component wrapper
