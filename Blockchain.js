//Defines Blockchain Class


/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');

//Import LevelSandbox
const LevelSandboxClass = require('./levelSandbox.js');
const BlockClass = require('./Block.js');


/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.chain = new LevelSandboxClass.LevelSandbox();
    this.addGenesisBlock();
  }

//Function to add Genesis block    
  addGenesisBlock(){
    let genBlock = new BlockClass.Block("First block in the chain - Genesis block");
    genBlock.time = new Date().getTime().toString().slice(0,-3);
    genBlock.previousBlockHash = '';
    genBlock.hash = SHA256(JSON.stringify(genBlock)).toString();
    // Add Genesis block to the chain. The block height 0 is used as the key.
    this.chain.addLevelDBData(0, JSON.stringify(genBlock).toString()).then((value) => {
        if(value){
            console.log(`Genesis block created`);
        }else{
            console.log(`Error adding Genesis block to chain`);
        }
    });
  }

  // Adds new block. Returns Promise
  addBlock(newBlock){
    return new Promise((resolve, reject) => {
        //Check for Genesis block    
        this.getBlock(0).then(value => {
            //Create Genesis block if not found
            if(value == undefined){
                this.addGenesisBlock();
            }
            //Get height of last block
            return this.getBlockHeight();
        }).then(height => {
            //Set height of new block
            newBlock.height = height;

           //Set UTC timestamp of new block
            newBlock.time = new Date().getTime().toString().slice(0,-3);
            
            //Get Previous block
            return this.getBlock(height - 1);
        }).then(prevBlock => {
            //Set previous block hash of new block
            newBlock.previousBlockHash = JSON.parse(prevBlock).hash;

            //Set Block hash with SHA256 using newBlock and converting to a string
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

             // Adding new block object to chain. The block height is used as the key.
            return this.chain.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString());             
        }).then(result => {
                if(result){
                    //successfully added new block to chain
                    resolve(result);
                }else{
                    console.log(`Error adding Block ${newBlock.height} to chain`);
                    reject(undefined);
                }
        }).catch(err => {
                console.log(err);
        });
    });
  }

  // Get block height oflast block in the chain. Returns Promise.
  getBlockHeight(){
        return new Promise((resolve,reject) => {
            //Get the last height in the chain
            this.chain.getLastKey().then(height => {
                resolve(height);
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
   }
    
    
    // get block by height. Returns Promise.
    getBlock(blockHeight){
      // return object as a single string
        return new Promise ((resolve, reject) => {
            this.chain.getLevelDBData(blockHeight).then(curblock => {
                if(curblock == undefined){
                    resolve(curblock);
                }else{
                    resolve(JSON.parse(JSON.stringify(curblock)));
                }
            }).catch(err => {
                console.log(err);
                reject(err);
            });
        });
      
    }

    // get block by hash. Returns Promise.
    getBlockByHash(hash){
        // return object as a single string
          return new Promise ((resolve, reject) => {
              this.chain.getLevelDBDataHash(hash).then(curblock => {
                  if(curblock == undefined){
                      resolve(curblock);
                  }else{
                      resolve(JSON.parse(JSON.stringify(curblock)));
                  }
              }).catch(err => {
                  console.log(err);
                  reject(err);
              });
          });
        
    }

    // get blocks by Wallet Adress . Returns Promise.
    getBlockByWalletAddress(address){
        // return object as a single string
          return new Promise ((resolve, reject) => {
              this.chain.getLevelDBDataWalletAddress(address).then(blockArray => {
                  resolve(blockArray);
            }).catch(err => {
                  console.log(err);
                  reject(err);
            });
          });
        
    }

    // validate block returns Promise
    validateBlock(blockHeight){
        let self = this;
        return new Promise(function(resolve, reject) {
            self.getBlock(blockHeight).then(curBlock => {
                let block = JSON.parse(curBlock);
                
                // get block hash
                let blockHash = block.hash;
                // remove block hash to test block integrity
                block.hash = '';
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                // Compare
                if (blockHash === validBlockHash) {
                    resolve(true);
                } else {
                    console.log(`Block # ${blockHeight} invalid hash:\n ${blockHash} <> ${validBlockHash}`);
                    resolve(false);
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

   // Validate blockchain
    validateChain(){
        let errorLog = [];
        let self = this;
        let chainLength = 0;
        let blockHash = '';
        let i = 0;
                
        return new Promise(function(resolve, reject){
            //Get Length of chain
            self.getBlockHeight().then(height => {
                //check if chain is empty
                if(height == undefined){
                    console.log(`Empty Chain`);
                    resolve(false);
                }else {
                    chainLength = height - 1;
                    console.log(`There are ${height} blocks in this Blockchain.`);
                    (async function loop() {
                    //Loop through all blocks    
                    for (i = 0; i <= (chainLength - 1); i++) {
                        // validate block
                        await self.validateBlock(i).then(result => {
                            if(result){
                                console.log(`Block ${i} successfully validated.`);
                            }else{
                                errorLog.push(i);
                            }
                            return self.getBlock(i);
                        }).then(curBlock => {
                            // compare blocks hash link                        
                            //Get current block hash
                            blockHash = JSON.parse(curBlock).hash;
                            console.log(`Block ${i} hash          : ${blockHash}`);
                            
                            return self.getBlock(i + 1);
                        }).then(nextBlock => {
                            //Get previous block hash from next block
                            let previousHash = JSON.parse(nextBlock).previousBlockHash;
                            console.log(`Block ${i + 1} previous hash : ${previousHash}`);
                            console.log(`---------------------------`);
                            // compare blocks hash link
                            if (blockHash!==previousHash) {
                                errorLog.push(i);
                            }
                        }).catch((err) => {
                            console.log(err);
                        });
                    }
                    
                    //Validate last block in the chain here because it is not validated in the for loop above.
                    self.validateBlock(i).then(result => {
                        if(result){
                            console.log(`Block ${i} successfully validated.`);
                        }else{
                            errorLog.push(i);
                        }
                        //Check for errors
                        if (errorLog.length>0) {
                            console.log(`Block errors = ${errorLog.length}`);
                            console.log(`Blocks: ${errorLog}`);
                            resolve(false);
                        } else {
                        //console.log('No errors detected');
                            resolve(true);
                        }
                    }).catch((err) => {
                        console.log(`Error validating block ${i} :  ${err}`);
                        reject(err);
                    });
                  
                  })();
            }
            }).catch((err) => {
                console.log(`Error in validate chain ${err}`);
                reject(err);
            });
                
    });
      
}
}

// Export the classes
module.exports.Blockchain = Blockchain;