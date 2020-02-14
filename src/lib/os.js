const fs = require("fs");
const RuntimeError = require("../runtimeError.js");

module.exports.read = function(filepath, encoding = "utf-8") {
  if (filepath === null)
    throw new RuntimeError(
      this.token,
      "You must provide a filepath to os.read(filepath)."
    );

  try {
    let data = fs.readFileSync(filepath, encoding);
    return data;
  } catch (error) {
    throw new RuntimeError(this.token, `Failed to read file - ${error.code}.`);
  }
};

module.exports.write = function(filepath, data = "", encoding = "utf-8") {
  if (filepath === null)
    throw new RuntimeError(
      this.token,
      "You must provide a filepath to os.write(filepath)."
    );

  try {
    fs.writeFileSync(filepath, data, encoding);
    return null;
  } catch (error) {
    throw new RuntimeError(this.token, `Failed to write file - ${error.code}.`);
  }
};

module.exports.delete = function(path) {
  if (path === null)
    throw new RuntimeError(
      this.token,
      "You must provide a path to os.delete(path)."
    );

  try {
    fs.unlinkSync(path);
    return null;
  } catch (error) {
    throw new RuntimeError(
      this.token,
      `Failed to delete file - ${error.code}.`
    );
  }
};

module.exports.mkdir = function(path) {
  if (path === null)
    throw new RuntimeError(
      this.token,
      "You must provide a path to os.mkdir(path)."
    );

  try {
    fs.mkdirSync(path);
    return null;
  } catch (error) {
    throw new RuntimeError(
      this.token,
      `Failed to create folder - ${error.code}.`
    );
  }
};

module.exports.deletedir = function(path) {
  if (path === null)
    throw new RuntimeError(
      this.token,
      "You must delete a path to os.deletedir(path)."
    );

  try {
    fs.rmdirSync(path, { recursive: true });
    return null;
  } catch (error) {
    throw new RuntimeError(
      this.token,
      `Failed to delete folder - ${error.code}.`
    );
  }
};

module.exports.listdir = function(path) {
  if (path === null)
    throw new RuntimeError(
      this.token,
      "You must provide a path to os.listdir(path)."
    );

  try {
    let folderContents = fs.readdirSync(path);
    return folderContents;
  } catch (error) {
    throw new RuntimeError(
      this.token,
      `Failed to list contents of folder - ${error.code}.`
    );
  }
};
