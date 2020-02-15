# Installing

You can install Dragon using NPM by running:

```
$ npm i -g dragon-lang
```

Note: The `-g` flag is heavily recommended as it allows for global usage across your device and adds the `dragon` command to your device. You can update a Node-installed Dragon by running `npm update`.

## Usage

You can then execute a file using Dragon by running:

```
$ dragon test.drg
```

You can then use the Dragon shell by running:

```
$ dragon
```

You could also run a file from within the Dragon shell, by importing the relevant file such as:

```
> import("./test.drg");
```

Next: [Hello World](./hello-world.md)
