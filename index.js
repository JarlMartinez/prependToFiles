const fs = require( 'fs' );
const path = require( 'path' );
const { prependToFile } = require("./prependToFile");

const TEXT_TO_PREPEND =
`//
// Copyright 2021 Venafi, Inc.
// All Rights Reserved.
//
// This program is unpublished proprietary source code of Venafi, Inc.
// Your use of this code is limited to those rights granted in the license between you and Venafi.
//
// Author: Luis Martinez (luis.martinez@venafi.com)
//

`;

// A tree can face multiple 'yes include' nodes, 
// only one 'dont include' is enough to not
// include antything from that node down.

const DIR_AND_FILES_EXCLUDE = [
  "node_modules", "build", "dist", ".json", ".html", ".ejs"
];

const DIRS_FILES_TO_INCLUDE = [
  "src", "scripts", "config.js", "webpack.config.js"
];

let TotalFilesDigested = 0;

(async ()=>{
  // A path should be passed as argument, and only one argument.
  if (process.argv[2] && process.argv.length === 3) {
    const pathUserInput = process.argv[2];

    console.log('-------------------');
    await loopThrougAndApply(
      path.resolve( process.cwd(), pathUserInput )
    );
    console.log(TotalFilesDigested, 'Files got prepend');  
    console.log('-------------------');

  } else {
    console.log("No argument recieved. Please provide an starting point");
    process.exit();
  }
})();

async function loopThrougAndApply(dir){
  try {
    const itemsAtDirAsArray = await fs.promises.readdir(dir);
    
    for (const item of itemsAtDirAsArray ) {
      const itemAbsolutePath = path.join(dir, item);
      const stat = await fs.promises.stat(itemAbsolutePath);

      if(stat.isFile() && shouldItemKeepGoing(itemAbsolutePath) ) {
          // Apply file changes.
          await prependToFile(itemAbsolutePath, TEXT_TO_PREPEND);
          TotalFilesDigested++;
      }

      if(stat.isDirectory() && shouldItemKeepGoing(itemAbsolutePath)) {
        await loopThrougAndApply(itemAbsolutePath);
      }
    }
  }

  catch(e) {
    console.log("[error] Failed looping:", dir);
    throw e;
  }
};

function shouldItemKeepGoing( itemAbsoulutePath ) {
  const absolutePathParts = itemAbsoulutePath.split("\\");

  // First off check if has explicitly being set to be exclude.
  if (
    DIR_AND_FILES_EXCLUDE.length > 0 &&
    (absolutePathParts.some(part => DIR_AND_FILES_EXCLUDE.includes(part)) ||
    DIR_AND_FILES_EXCLUDE.includes( path.extname(itemAbsoulutePath) )) // Check if its file and if extension should be excluded.
  ) {
    return false;
  }

  // Second, verify if are items to specifically include. 
  if (DIRS_FILES_TO_INCLUDE.length > 0) {
    // If its included...
    if (absolutePathParts.some(part => DIRS_FILES_TO_INCLUDE.includes(part))) {
      return true;
    }
    // reject anything else ...
    return false
  }

  // If dirsToInclude is emtpy, treat whatever else.
  return true;
}