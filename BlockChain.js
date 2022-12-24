const Block = require('./Block.js')

class Blockchain{
    constructor(){
        this.blockchain = [this.createGenesisBlock()];
    }
    createGenesisBlock(){
        const genesisData = {name:"Genesis_Name", brand:"Genesis_Brand", date:"30/10/2022"};
        return new Block(0, "30/10/2022", genesisData, "0");
    }

    getTheLatestBlock(){
        return this.blockchain[this.blockchain.length - 1];
    }
    addNewBlock(newBlock){
        newBlock.index = this.getTheLatestBlock().index + 1;
        newBlock.previousHash = this.getTheLatestBlock().hash;
        newBlock.hash = newBlock.generateHash();
        this.blockchain.push(newBlock);
    }

    // testing the integrity of the chain
    validateChainIntegrity(){
        for(let i = 1; i<this.blockchain.length; i++){
            const currentBlock = this.blockchain[i];
            const previousBlock = this.blockchain[i-1];
            if(currentBlock.hash !== currentBlock.generateHash()){
                return false;
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
            return true;

        }
    }

    getBlockChainData(){
        return JSON.stringify(blockChain, null, 5);
    }
} 

module.exports = Blockchain;