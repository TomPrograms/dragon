# 1.3.0 - 03/03/2020

### Added

- `dist.js` for usage in the browser.
- `math.root()` function.
- `math.ceil()` function.

### Changed

- Renamed `math.Pi` to `math.pi`.
- Added `try` `catch` to attempting to check existence of file to load with `import()`, improving browser compatibility.

# 1.2.0 - 19/02/2020

### Added

- `time.sleep(ms)` command.
- Exporting of single data types in place of the `exports` dictionary.
- Bitwise Not (`~`) operator.
- `in` keyword.

# 1.1.0 - 16/02/2020

### Added

- `do {} while ()` statements.
- `^`, `&`, `|`, `>>` and `<<` operators.
- `math` standard library.

### Fixed

- Operator precedence - ensured `**` higher precedence than other operators.
- Bug with standard libraries throwing errors.

### Changed

- Ensured `len()` function not provided with an incompatible correct data type.

# 1.0.0 - 16/02/2020

- 🎉 Initial Release of Dragon.
