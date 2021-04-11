const { prependToFile } = require("./prependToFile");

const myText = `//
// Venafi 2021
// Luis Martinez
//

`;

const fs = require( 'fs' );
const path = require( 'path' );

(async ()=>{
  console.log('-------------------');
  await loopThrougFilesAndApply(process.cwd());
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
        console.log(item.split("\\")[item.split("\\").length - 1], "would've been affected");
        prependToFile(itemPath, myText, function(err) {
          if(err) {
            console.log('Error prependint to', itemPath);
            throw err;
          }
          console.log("Success renaming:\n", itemPath, "\n");
        });
      } else if(stat.isDirectory()) {

        // await loopThrougFilesAndApply(itemPath, toApply);
      }
    }
  }
  catch(e) {
    console.log("[error] Failed looping:", dir);
    throw e;
  }
};