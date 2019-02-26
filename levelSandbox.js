//Defines the LevelDB Sandbox Class

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');
const chainDB = './chaindata';


class LevelSandbox {
	// Declaring the class constructor
    constructor() {
    	this.db = level(chainDB);
    }
  
  	// Get data from levelDB with a key (Promise)
  	getLevelDBData(key){
        let self = this; 
        return new Promise((resolve, reject) => {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log(`Failed to get data for Block ${key}`, err);
                        reject(err);
                    }
                }else {
                    resolve(value);
                }
            });
        });
    }

    // Get data from levelDB with a hash (Promise)
  	getLevelDBDataHash(hash){
        let self = this;
        let block = null;
        
        return new Promise((resolve, reject) => {
           self.db.createReadStream()
           .on('data', function (data) {
               //Get the block and compare hashes
               let tempBlock = JSON.parse(data.value);
               if(tempBlock.hash == hash){
                   block = data.value;
               }
           })
           .on('error', function (err) {
               reject(err)
           })
           .on('close', function () {
               resolve(block);
           });
        });        
    }

    // Get data from levelDB with a wallet address (Promise)
  	getLevelDBDataWalletAddress(address){
        let self = this;
        let block = [];
        return new Promise((resolve, reject) => {
           self.db.createReadStream()
           .on('data', function (data) {
               //Get the block and compare addresses only if the block is not the Genesis block
               let tempBlock = JSON.parse(data.value);
               if(tempBlock.height > 0){
                if(tempBlock.body.address == address){
                   block.push(tempBlock);
                }
               }
           })
           .on('error', function (err) {
               reject(err)
           })
           .on('close', function () {
               resolve(block);
           });
        });        
    }
  
  	// Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log(`Failed to submit Block ${key}`, err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }
    
    // Add data to levelDB with value (Promise)
    addDataToLevelDB(key, value) {
        let self = this;
        let key = 0;
   
      	return new Promise((resolve, reject) => {
           self.db.createReadStream()
            .on('data', function(data) {
                key = data.key;
        	})
            .on('error', function(err) {
                return console.log('Unable to read data stream!', err);
                reject(err);
            }).on('close', function() {
               key++;
               addLevelDBData(key, value).then((value) => {
                    console.log(`Block # : ${key} Added to chain.`);
                    resolve(value);
                });
                
            });
        })
    }
  
  	// Gets last key. In this case it returns the height of the last block. (Promise)
    getLastKey() {
        let self = this;        
        let key = 0;
        let i = 0;
   
      	return new Promise((resolve, reject) => {
           self.db.createReadStream()
            .on('data', function(data) {
               i++;
        	})
            .on('error', function(err) {
            	console.log('Unable to read data stream!', err);
             	reject(err);
        	})
            .on('close', function() {
          		resolve(i);
           	});
         });
    }
    
    //Reads the chain (for testing purpose)
   readChain() {
       let self = this;
       console.log("---Start of Chain----");
        self.db.createReadStream()
            .on('data', function(data) {
                console.log(data);
        	})
            .on('error', function(err) {
            	console.log('Unable to read data stream!', err);
             	
        	})
            .on('close', function() {
          		console.log("---End of Chain----");
           	});
        
    }
     
}

// Export the class
module.exports.LevelSandbox = LevelSandbox;


