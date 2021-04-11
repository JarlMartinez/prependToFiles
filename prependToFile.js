const fs = require('fs');

function prependToFile(original, toPrepend, cb) {
  let cbCalled = false;

  const fileCopy = getFileCopyName(original);
  const rd = fs.createReadStream(original);
  const wr = fs.createWriteStream(fileCopy, { flags: 'a' });
  
  rd.on("error", err => done(err));
  wr.on("error", err => done(err));
  wr.on("close", ex => {
    finalAction();
  });
  
  createFileWithHeaderContent();
  rd.pipe(wr);

  function createFileWithHeaderContent() {
    try {
      fs.appendFileSync(fileCopy, toPrepend);
    } catch (err) {
      console.log("[error] Failed creating file", fileCopy);
      done(err);
    }
  }

  function finalAction() {
    try {
      fs.unlinkSync(original);
      fs.renameSync(fileCopy, original);
      done();
    } catch (err) {
      console.log("[error] Failed renaming", fileCopy);
      done(err);
    }    
  }

  function getFileCopyName(filePath) {
    const pathParts = filePath.split("\\");
    const fileName = pathParts[pathParts.length - 1];
    pathParts[pathParts.length - 1] = 'copy.' + fileName;
    return pathParts.join("\\"); 
  }

  // function showFileContent(fileToReadAndShow) {
  //   try {
  //     const data = fs.readFileSync(fileToReadAndShow);
  //     console.log(JSON.stringify(data.toString()));
  //   } catch (err) {
  //     console.log(chalk.red("[error] Failed read and show to console", fileCopy));
  //     throw err;
  //   }
  // }

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

module.exports = { prependToFile };
