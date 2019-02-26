//Require hapi
const Hapi = require('hapi');

/**
 * Class Definition for the REST API
 */
class BlockAPI {

    /**
     * Constructor that allows initialize the class 
     */
    constructor() {
        //Runs on port 8000
		this.server = Hapi.Server({
            port: 8000,
            host: 'localhost'
        });
        this.initControllers();
        this.start();
    }

    /**
     * Initilization of all the controllers
     */
	initControllers() {
		require("./BlockController.js")(this.server);
	}
    
    //Start Server
    async start() {
        await this.server.start();
        console.log(`Server running at: ${this.server.info.uri}`);
    }

}

new BlockAPI();