/**
 * Defines Controller Class
 */

//Require the hex2ascii library
const hex2ascii = require('hex2ascii');

//Require the Crpto-js library
const SHA256 = require('crypto-js/sha256');

//Require the bitcoinjs-message library
const bitcoinMessage = require('bitcoinjs-message'); 

//Require the Block and Blockchain classes
const BlockClass = require('./Block.js');
const BlockChainClass = require('./Blockchain.js');

//Require the Request class
const RequestClass = require('./Request.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} server 
     */
    constructor(server) {
        this.server = server;
        this.blockchain = new BlockChainClass.Blockchain();
        this.mempool = [];
        this.timeoutRequests = [];
        this.mempoolValid = [];
        this.TimeoutRequestsWindowTime = 5*60*1000; //set timeout to five minutes
        this.validationRequest();
        this.validateMessageSignature();
        this.postNewBlock();
        this.getBlockByHash();
        this.getBlockByAddress();
        this.getBlockByIndex();
    }

    /**
     * Implement a POST Endpoint for a validation request, url: "/requestValidation"
     */
    validationRequest() {     
        //Set Default response   
        let response = {
                        success: "false",
                        message: "Address required"
                    };
        this.server.route({
            method: 'POST',
            path: '/requestValidation',
            handler: (request, h) => {
                if(!(request.payload === null)){
                    //Check to see if data specified in payload.
                    if(request.payload.address) {
                        //Get request from mempool
                        let req = this.checkRepeatRequest(request.payload.address, '');

                        //Format response
                        response = {
                            walletAddress: request.payload.address,
                            requestTimestamp: req[0],
                            message: request.payload.address + ":" + req[0] + ":starRegistry",
                            validationWindow: req[1]
                        };
                    }
               }
                return response;
            }
        });
    }

    /**
     * Implement a POST Endpoint to validate message signature, url: "/message-signature/validate"
     */
    validateMessageSignature() {
         //Set Default response  
        let response = {
                        success: "false",
                        message: "Address and signature required"
                    };
        this.server.route({
            method: 'POST',
            path: '/message-signature/validate',
            handler: (request, h) => {
                if(!(request.payload === null)){
                    //Check to see if data specified in payload.
                    if(request.payload.address && request.payload.signature) {
                        //Get request from mempool and validate
                        response = this.validateRequestbyWallet(request.payload.address, request.payload.signature);                        
                    }
                }
                return response;
            }
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/block"
     */
    postNewBlock() {
         //Set Default response  
        let response = {
            success: "false",
            message: "Address and star are required"
        };
        let registerFlag = false;
        let id = 0;
        this.server.route({
            method: 'POST',
            path: '/block',
            handler: async(request, h) => {
                if(!(request.payload === null)){
                    //Check to see if necessary data specified in payload.
                    if(request.payload.address && request.payload.star) {
                        if(this.mempoolValid.length > 0){
                            //check if address is present in the mempoolvalid array
                            let i = 0;
                            this.mempoolValid.forEach(element => {
                                if((element.status.address == request.payload.address)  && !registerFlag){
                                    registerFlag = true;
                                    //get index of element to remove from mempoolValid after block is added.
                                    id = i;
                                }
                                i++;
                            }); 
                            //If Address is verified
                            if(registerFlag){
                                let bc = this.blockchain;
                                let star = request.payload.star;
                                //Encode the star story
                                star.story = Buffer.from(star.story).toString('hex');
                                //Create the body of the block
                                let body = {
                                    address: request.payload.address,
                                    star: {
                                            ra: star.ra,
                                            dec: star.dec,
                                            story: star.story
                                    }
                                };
                                //Add new block
                                let block = new BlockClass.Block(body);
                                await bc.addBlock(block).then((result) => {
                                    //check if block successfully added
                                    if(result){
                                        //return block
                                        response = block;

                                        //Remove from mempoolValid 
                                        this.mempoolValid.splice(id, 1);
                                    }else{
                                        response = {
                                            success: "false",
                                            message: "Error adding block to the blockchain"
                                        };
                                    }
                                }).catch(err => {
                                    response = {
                                        success: "false",
                                        message: "Error adding block to the blockchain"
                                    };
                                });
                            }else{
                                //Address could not be verified
                                response = {
                                    success: "false",
                                    message: "Your address cannot be verified."
                                };
                            }
                        } else {
                            //if mempoolValid is empty
                            response = {
                                success: "false",
                                message: "No validations available."
                            };
                        }               
                    }
                }
                return response;
            }
        });
    }

    /**
     * Implement a GET Endpoint to retrieve a block by hash, url: "/stars/hash:hash"
     */
    getBlockByHash() {
        let bc = this.blockchain;
        let response;
        this.server.route({
            method: 'GET',
            path: '/stars/hash:{hash}',
            handler: async (request, h) => {
                let hash = encodeURIComponent(request.params.hash);
                
                //Use getBlockByHash method of Blockchain class
                await bc.getBlockByHash(hash).then(curBlock => {
                    let block = JSON.parse(curBlock); 
                    //Decode the star story
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    response = block;
                }).catch(err => {
                   response = {
                                success: "false",
                                message: "Error retrieving block. ",
                              };
                });    
                return (response);   
            }
        });
    }

    /**
     * Implement a GET Endpoint to retrieve a block by Wallet Address, url: "/stars/address:address"
     */
    getBlockByAddress() {
        let bc = this.blockchain;
        let response;
        this.server.route({
            method: 'GET',
            path: '/stars/address:{address}',
            handler: async (request, h) => {
                
                let address = encodeURIComponent(request.params.address);
                
                //Use getBlockByWallet method of Blockchain class
                await bc.getBlockByWalletAddress(address).then(blockArray => {
                    let responseArray = [];
                    blockArray.forEach( element => {
                        let block = JSON.parse(JSON.stringify(element));
                        //Decode the star story
                        block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                        responseArray.push(block);
                    });
                    response = responseArray;
                }).catch(err => {
                   response = {
                                success: "false",
                                message: "Error retrieving block. ",
                                err
                    }
                });    
                return (response);   
            }
        });
    }

    /**
     * Implement a GET Endpoint to retrieve a block by height, url: "/block/:height"
     */
    getBlockByIndex() {
        let bc = this.blockchain;
        let response;
        this.server.route({
            method: 'GET',
            path: '/block/{height}',
            handler: async (request, h) => {
                let height = encodeURIComponent(request.params.height);
                
                //Use getBlock method of Blockchain class
                await bc.getBlock(height).then(curBlock => {
                    let block = JSON.parse(curBlock); 
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    response = block;
                }).catch(err => {
                   response = {
                                success: "false",
                                message: "Error retrieving block. ",
                                err
                    }
                });    
               return (response);   
            }
        });
    }

    //Function ValidateRequestbyWallet
    async validateRequestbyWallet(address, signature){
        //Check to see if time window has expired        
        let req = this.checkRepeatRequest(address, signature);
                                                
        let message = address + ":" + req[0] + ":starRegistry";

        //validate request with bitcoinjs-message
        let verified = (async (message, address, signature) => {
                            return await(bitcoinMessage.verify(message, address, signature));
                        });

        let isValid = await verified(message, address, signature);
        
        //Create the Request Object
        let requestObject = new RequestClass.Request(address);
        requestObject.status.requestTimeStamp = req[0];
        requestObject.status.message = message;
        requestObject.status.validationWindow = req[1];
        requestObject.status.messageSignature = isValid;
        requestObject.registerStar = isValid;

        //If Request has been successfully validated push the object to the mempoolvalid array
        if(isValid){
            this.mempoolValid.push(requestObject);
        }

        this.timeoutRequests = [];

        //remove request from mempool
        let tempArray = [address, signature, req[0]];
        this.mempool.splice(this.mempool.indexOf(tempArray),1);
        
        return(requestObject);
    }

    //Checks if its a repeat request within the time window
    checkRepeatRequest(address, signature){
        let validationWindow = 0;
        let reqTimestamp;

        //Get record from memory pool with the wallet address
        let validationReq = this.returnValidationRequest(address);

        //If match found
        if(validationReq.length > 0){
            //get request timestamp
            reqTimestamp = validationReq[2];
            //get validation window left
            let timeElapse = (new Date().getTime().toString().slice(0,-3)) - reqTimestamp;                            
            validationWindow = (this.TimeoutRequestsWindowTime/1000) - timeElapse;
        }

        //check if validation window has expired or new request
        if (validationWindow <= 0){
            //Add request to the mempool
            this.addValidationRequest(address, signature); 
                            
            //get current timestamp
            reqTimestamp = new Date().getTime().toString().slice(0,-3);
            validationWindow = 300;
        }
        return ([reqTimestamp, validationWindow]);
    }

    //Function to add request to the mempool and start timer
    addValidationRequest(address, signature){
        let self = this;
        let reqTimestamp = new Date().getTime().toString().slice(0,-3);
        //Add request to mempool
        self.mempool.push([address, signature, reqTimestamp]);
        self.timeoutRequests[address]=setTimeout(function(){ 
            //self.removeValidationRequest(address); 
            let i = 0;
            let id = 0;
            self.mempool.forEach(element => {
                if(element[0] == address){
                    id = i;
                }
                i++;
            });
            self.mempool.splice(id,1);
        }, self.TimeoutRequestsWindowTime );
    }

    //Function to return validation request from mempool
    returnValidationRequest(address){
        let flag = false;
        let req;
        //loop through mempool to find request for the addess
        this.mempool.forEach(element => {
            if(element[0] === address){
                flag = true;
                req = element;
            }
        });
        if( !flag ){
            return([]);        
        }else{
            return(req);
        }
    }

}

/**
 * Exporting the BlockController class
 * @param {*} server 
 */
module.exports = (server) => { return new BlockController(server);}