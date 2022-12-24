//import that secure hash algorithm from the crypto-js package
const SHA256 = require('crypto-js/sha256');

//create a JavaScript class to represent a Block
class Block{
  constructor(index, timestamp, data, previousHash){
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.generateHash();
  }

  generateHash(){
    return SHA256(this.index + this.timestamp + this.previousHash + JSON.stringify(this.data)).toString()
  }
}

module.exports = Block;