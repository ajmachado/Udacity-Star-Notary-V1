# Blockchain Data and RESTFul API

Blockchain has the potential to change the way that the world approaches data. Develop Blockchain skills by understanding the data model behind Blockchain by developing your own simplified private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Installing Node and NPM is pretty straightforward using the installer package available from the (Node.js® web site)[https://nodejs.org/en/].

### Configuring your project

- Use NPM to initialize your project and create package.json to store project dependencies.
```
npm init
```
- Install crypto-js with --save flag to save dependency to our package.json file
```
npm install crypto-js --save
```
- Install level with --save flag
```
npm install level --save
```
- Install hapi with --save flag
```
npm install hapi --save
```
- Install bitcoinjs-message with --save flag
```
npm install bitcoinjs-message --save
```
- Install hex2ascii with --save flag
```
npm install hex2ascii --save
```

## Testing

To test code:

1: Open a command prompt or shell terminal after install node.js.
2: Start the server
```
 node app.js
 
```

## Test endpoints
3: Open the Postman App.

## Testing the POST endpoint using url 'http://localhost:8000/requestValidation'
4: Select the POST method, enter "http://localhost:8000/requestValidation" in the next textbox. Hit the SEND button after completing step 5. 
5: In the section below, select the 'Body' tab, choose the 'raw' option and in the text editor add
    { "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL" }

    The address will be your wallet's receiving adress.
6: You should see a response similar to this:
    {
    "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1544451269",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544451269:starRegistry",
    "validationWindow": 300
    }
7: If you hit the 'Send' button again for this endpoint within five minutes you will see the same response with the time left in the validation window.

## Testing the POST endpoint using url 'http://localhost:8000/message-signature/validate'
8: Select the POST method, enter "http://localhost:8000/message-signature/validate" in the next textbox. Hit the SEND button after completing step 5. 
9: In the section below, select the 'Body' tab, choose the 'raw' option and in the text editor add
    {
        "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
    }

    Use your wallet to sign the message received in step 6 to obtain the signature. Make sure you perform this within five minutes of receiving the response from 'requestValidation'
10: You should see a response similar to this:
    {
        "registerStar": true,
        "status": {
            "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
            "requestTimeStamp": "1544454641",
            "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1544454641:starRegistry",
            "validationWindow": 193,
            "messageSignature": true
        }
    }

## Testing the POST endpoint using url 'http://localhost:8000/block'
11: Select the POST method, enter "http://localhost:8000/block" in the next textbox. Hit the SEND button after completing step 5. 
12: In the section below, select the 'Body' tab, choose the 'raw' option and in the text editor add
    {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
            }
    }
13: You should see a response similar to this:
    {
        "hash": "8098c1d7f44f4513ba1e7e8ba9965e013520e3652e2db5a7d88e51d7b99c3cc8",
        "height": 1,
        "body": {
            "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
            "star": {
                "ra": "16h 29m 1.0s",
                "dec": "68° 52' 56.9",
                "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f"
            }
        },
        "time": "1544455399",
        "previousBlockHash": "639f8e4c4519759f489fc7da607054f50b212b7d8171e7717df244da2f7f2394"
    }

## Testing the GET  endpoint using url '/block/stars/hash:hash'
14: Select the GET method, enter "http://localhost:8000/stars/hash:$hash" in the next textbox. Here replace the '$hash' with the hash received in the previous response. Hit the SEND button. 
15: You should see a response similar to this
    {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
    }

## Testing the GET  endpoint using url '/block/stars/addess:address'
16: Select the GET method, enter "http://localhost:8000/stars/addess:$address" in the next textbox. Here replace the '$address' with your wallet address used in previous steps. Hit the SEND button. 
17: You should see a response similar to this
    [
    {
        "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
        "height": 1,
        "body": {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
            "ra": "16h 29m 1.0s",
            "dec": "-26° 29' 24.9",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
        },
        "time": "1532296234",
        "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
    },
    {
        "hash": "6ef99fc533b9725bf194c18bdf79065d64a971fa41b25f098ff4dff29ee531d0",
        "height": 2,
        "body": {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
            "ra": "17h 22m 13.1s",
            "dec": "-27° 14' 8.2",
            "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
            "storyDecoded": "Found star using https://www.google.com/sky/"
        }
        },
        "time": "1532330848",
        "previousBlockHash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f"
    }
    ]


## Testing the GET  endpoint using url '/block/:height'
18: Select the GET method, enter "http://localhost:8000/block/1" in the next textbox and hit the SEND button. Change the '0' in the URL to any number from 0 to 10 to get other blocks.
19: You should see a response similar to this
    {
    "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
    "height": 1,
    "body": {
        "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
        "star": {
        "ra": "16h 29m 1.0s",
        "dec": "-26° 29' 24.9",
        "story": "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
        "storyDecoded": "Found star using https://www.google.com/sky/"
        }
    },
    "time": "1532296234",
    "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
    }