const { prependToFile } = require("./prependToFile");

const myText = `//
//
// Copyright 2021 Venafi, Inc.
// All Rights Reserved.
//
// This program is unpublished proprietary source code of Venafi, Inc.
// Your use of this code is limited to those rights granted in the license between you and Venafi.
//
// Author:	Luis Martinez (luis.martinez@venafi.com)
//
//

`;

const fs = require( 'fs' );
const path = require( 'path' );

let totalFilesDigested = 0;

(async ()=>{
  console.log('-------------------');
  let initialPoint;
  if (process.argv[2]) {
    initialPoint = process.argv[2];
  } else {
    console.log("No argument recieved. Please provide an starting point");
    process.exit();
  }
  await loopThrougFilesAndApply(path.resolve(process.cwd(), process.argv[2]));
  console.log(totalFilesDigested, 'Files got prepend');
  console.log('-------------------');
})();

async function loopThrougFilesAndApply(dir, toApply){
  try {
    // Get the files as an array
    const itemsAtDir = await fs.promises.readdir(dir);

    for (const item of itemsAtDir ) {
      const itemPath = path.join(dir, item);

      const stat = await fs.promises.stat(itemPath);

      if(stat.isFile()) {
        if (itemPath.split("\\").filter(item => item === "src").length > 0) {
          prependToFile(itemPath, myText, function(err) {
            if(err) {
              console.log('Error prependint to', itemPath);
              throw err;
            }
            totalFilesDigested++;
          });
        }
      } else if(stat.isDirectory()) {
        if (
          itemPath.split("\\")
          .filter(item => item === "node_modules" || item === "dist" || item === "build")
          .length > 0
        ) {
          //
        } else {
          await loopThrougFilesAndApply(itemPath, toApply);
        }
      }
    }
  }
  catch(e) {
    console.log("[error] Failed looping:", dir);
    throw e;
  }
};