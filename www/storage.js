// This is a JavaScript file


var storage = {
    entry: [],
    situation: {}
};

storage.init=function(){
  this.entry=JSON.parse(localStorage.getItem('list') || '[]');
  this.situation=JSON.parse(localStorage.getItem('jyoukyou') || '{"bank": 0,"cash": 0,"suica": 0,"currency": "yen"}');
};

storage.save = function(){
  localStorage.setItem('list',JSON.stringify(this.entry));
  localStorage.setItem('jyoukyou',JSON.stringify(this.situation));
};

storage.add = function(item){
    this.entry.push(item);
    this.save();
};

storage.remove = function(id){
    this.entry.splice(id,1); 
    this.save();
}

storage.monthReport = function(month, type){
    
}


