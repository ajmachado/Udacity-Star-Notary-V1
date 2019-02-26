/* ===== Request Class ==============================
|  Class with a constructor for Request 			   |
|  ===============================================*/

class Request {
    //Constructor for the request object
	constructor(address){
        this.registerStar = false;
        this.status = {
            address: address,
            requestTimeStamp: new Date().getTime().toString().slice(0,-3),
            message: '',
            validationWindow: 300,
            messageSignature: false
        };
       
    }
    
}

module.exports.Request = Request;