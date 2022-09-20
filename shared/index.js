/**
 * Copyright (c)  Yahilo. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import  fs from "fs"
import path from "path";
import { getSharedPath, getDynamicImport, getSharedDirectoryPath } from "./utils.js";

const defaultSharedDirectory = [
  {
    dir: "functions",
    sharedFolder: "functions/shared-fns/index.js",
  },
  {
    dir: "._ab_em",
    sharedFolder: "functions/shared-fns/index.js",
  },
];

const getShared = (customSharedDirectory, customSharedFolderPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      let relative = path.resolve();
      let sharedFolderPath =
        customSharedFolderPath || `${relative}/shared-fns/index.js`;

      const dirPaths = customSharedDirectory || defaultSharedDirectory;

      for await (const pathData of dirPaths) {
        if (sharedFolderPath.includes(`/${pathData.dir}`)) {
          sharedFolderPath = getSharedPath({ ...pathData, relative });
          const sharedData = await getDynamicImport(sharedFolderPath);
          return resolve(sharedData);
        }
      }

      // For testing read shared folder in relative path
      const testSharedData = await getDynamicImport(sharedFolderPath);
      return resolve(testSharedData);
    } catch (error) {
      reject(error);
    }
  });
};

export const getSharedModules = async (options) => {
  return new Promise(async (resolve, reject) => {
    try {  
      let sharedDirectoryPath=getSharedDirectoryPath(options)
      
      let functionsObj={}
      let fileLoadingPromise=[]
      
    fileLoadingPromise=fs.readdirSync(sharedDirectoryPath).map(async file => {
      return new Promise(async (resolve,reject)=>{
        try{
          let indexFilePath=sharedDirectoryPath+`/${file}/index.js`
          let sharedFolderPath=sharedDirectoryPath+ `/${file}`
          const fileStats=fs.statSync(sharedFolderPath)
          if(fileStats.isDirectory()){
          const module = await import(indexFilePath)
          functionsObj={...functionsObj,...module.default}
          }
          return resolve({})
        }catch(err){
          console.log("err",err)
          reject(err);
        }
      })
        })
    
   await Promise.allSettled(fileLoadingPromise)
    return resolve(functionsObj)
  
    } catch (error) {
      reject(error);
    }
  });

};

const functionsObj=await getSharedModules({sharedDir:"../examples/shared-fns"})
console.log(functionsObj)

export default { getShared,getSharedModules};
