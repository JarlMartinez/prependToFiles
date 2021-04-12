const fs = require('fs');

module.exports = { prependToFile };

async function prependToFile(original, toPrepend) {

  return new Promise((resolve, reject) => {
    const fileCopy = getFileCopyName(original);
    const rd = fs.createReadStream(original);
    const wr = fs.createWriteStream(fileCopy, { flags: 'a' }); // Flag for appending, default is override.
    
    rd.on("error", err => reject(err));
    wr.on("error", err => reject(err));
    wr.on("close", ex => {
      // At this point, fileCopy contains file data with the text prepend.
      replaceNewFileWithPrevious(original, fileCopy)
        .then(() => resolve())
        .catch(err => reject(err));
    });
    
    // 1st, create file called like copy.myfile.js.
    // 2nd, append what should be at the beggining.
    // 3th, (then) pipe from original to new.
    // for 4th look what is written for onClose event.
    createFileWithHeaderContent(fileCopy, toPrepend)
      .then(() => rd.pipe(wr))
      .catch(err => reject(err));
  });
}

function createFileWithHeaderContent(absolutePathOfNewFile, textToPrepend) {
  return new Promise((resolve, reject) => {
    try {
      fs.appendFileSync(absolutePathOfNewFile, textToPrepend);
      resolve();
    } catch (err) {
      console.log("[error] Failed creating file", absolutePathOfNewFile);
      reject(err);
    }
  })
}

function replaceNewFileWithPrevious(original, newone) {
  return new Promise((resolve, reject) => {
    try {
      fs.unlinkSync(original);
      fs.renameSync(newone, original);
      resolve();
    } catch (err) {
      console.log("[error] Failed renaming new file", newone);
      reject(err);
    }
  })
}

function getFileCopyName(filePath) {
  const pathParts = filePath.split("\\");
  const fileName = pathParts[pathParts.length - 1];
  pathParts[pathParts.length - 1] = 'copy.' + fileName;
  return pathParts.join("\\"); 
}
