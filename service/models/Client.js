function Client(fname, lname, id){
    this.firstName = fname;
    this.lastName = lname;
    this.id = id || null;
}
//add static method
Client.toClient = function(jsonObj){
    if(jsonObj.firstName && jsonObj.lastName){
        return new Client(jsonObj.firstName, jsonObj.lastName, jsonObj.id);
    }
    return null;
};
//add proto instance method
Client.prototype.chat = function(client){
    if(client instanceof Client){
        return "I'm chatting with " + client.firstName;
    }
    return "Not allowed to chat with non-clients!";
}
module.exports = Client;