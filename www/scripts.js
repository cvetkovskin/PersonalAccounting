// This is a JavaScript file
var account ={
    dag1: {},
    dag2: {},
    date: {},
    month: ["January","February","March","April","May","June","July","August","September","October","November","December"]
    };

document.addEventListener('init', function(event) {
    account.date=new Date();
    var view = event.target;
    
    if(view.id === 'current' || view.id === 'add_expense' || view.id === 'add_income' || view.id === 'menu' || view.id === "report" || view.id === 'edit') {
        account[view.id + 'Init'](event.target);
    }  
},false);

account.currentInit = function(view){
    this.list = document.querySelector('#list');
    
    view.querySelector('#add').addEventListener('click',function(){
            
        ons.createDialog('choise').then(function(dialog) {
            account.dag1=dialog;
            dialog.show();
        });
    });
          
    view.querySelector('#options').addEventListener('click',function(){
        document.querySelector('#splitter-menu').open();
    });
    
    storage.init();
    this.refresh();
};

account.add_expenseInit = function(view){
    var dd = account.date.getDate();
    var mm = account.date.getMonth()+1; //January is 0!
    var yyyy = account.date.getFullYear();
    
    if(dd<10) {
        dd='0'+dd
    } 
    
    if(mm<10) {
        mm='0'+mm
    } 
    
    var today = yyyy+'-'+mm+'-'+dd;
    
    document.querySelector('#myDate').value=today;
    
    view.querySelector('#add-button').addEventListener('click',function(){
        
        var state=storage.situation;
        var new_entry= {};
        
        new_entry.ammount=document.querySelector('#val').value;
        if(new_entry.ammount==='' || new_entry.ammount=== null){
            ons.notification.alert("No ammount specified");
            return;
        }
        new_entry.target=document.querySelector('#target').value;
        new_entry.date=document.querySelector('#myDate').value;
        new_entry.src=$('input[name="type"]:checked').val();
        new_entry.type="expense";
        
        // window.alert("YOu inputed "+new_entry.ammount+" "+new_entry.target+" "+new_entry.date+" "+new_entry.src+" "+new_entry.type)
        
        if(state[new_entry.src]<new_entry.ammount){
            ons.notification.alert('Expense ammount exceeds funds in '+new_entry.src);
            return;
        }else{
            storage.situation[new_entry.src]-=new_entry.ammount;
            storage.add(new_entry);
        }
        
        document.querySelector('#navigator').popPage();
        this.refresh();
    }.bind(this));
}

account.add_incomeInit = function(view){
    var dd = account.date.getDate();
    var mm = account.date.getMonth()+1; //January is 0!
    var yyyy = account.date.getFullYear();
    
    if(dd<10) {
        dd='0'+dd
    } 
    
    if(mm<10) {
        mm='0'+mm
    } 
    
    var today = yyyy+'-'+mm+'-'+dd;
    
    document.querySelector('#myDate').value=today;
    
    view.querySelector('#add-button').addEventListener('click',function(){
        
        var new_entry= {};
            
        new_entry.ammount=document.querySelector('#val').value;
        if(new_entry.ammount==='' || new_entry.ammount=== null){
            ons.notification.alert("No ammount specified");
            return;
        }
        new_entry.target=document.querySelector('#source').value;
        new_entry.date=document.querySelector('#myDate').value;
        new_entry.src=$('input[name="type"]:checked').val();
        new_entry.type="income";
        
        storage.situation[new_entry.src]=parseInt(storage.situation[new_entry.src])+parseInt(new_entry.ammount);
        storage.add(new_entry);
        
        document.querySelector('#navigator').popPage();
        this.refresh();
    }.bind(this));
}

account.menuInit = function(view){
    view.querySelector('ons-list').addEventListener('click',this.action.bind(this));
}

account.action = function(evt){
    
    if(evt.target.parentElement.getAttribute('data-filter') === "clear"){
        ons.notification.confirm('Are you sure you would like to clear the LocalStorage?', {
           title: 'Clear LocalStorage?',
           
           callback: function(answer){
               if(answer === 1){
                   localStorage.clear();
                   document.querySelector('#splitter-menu').close();
                    account.refresh();
                    location.reload();
               }
           }
        });
        
    }else{
        document.querySelector('#navigator').pushPage('report.html');
        this.type=evt.target.parentElement.getAttribute('data-filter');
    }
}

account.reportInit = function(view){
    view.querySelector('#month').addEventListener('change',function(){
       this.generate($('#month option:selected').val());
    }.bind(this));
}

function tapHandler( event ){

          $( event.target ).toggleClass( "tapped" );
         if($(".tapped").size() > 0){
            ons.createDialog('actions').then(function(dialog) {
                account.target=event.target.parentElement.id;
                account.dag2=dialog;
                dialog.show();
            }); 
             // ons.notification.alert(event.target.parentElement.id);
         }

}

account.generate = function(month){
    var collection=storage.entry;
    
    var table="";
    table=document.querySelector('#table_template').innerHTML
        .replace('{{Month}}',account.month[month])
        .replace('{{Type}}',account.type === 'income' ? 'Income' : 'Expenses');
    
    collection.forEach(function(item, i){
        if(item.type === account.type){
            if((parseInt(item.date.split("-")[0]) == (account.date.getFullYear())) && (parseInt(item.date.split("-")[1]) == (month+1))){
                table+=document.querySelector('#row_template').innerHTML
                .replace('{{id}}',account.type+'-'+i)
                .replace('{{date}}',item.date)
                .replace('{{target}}',item.target)
                .replace('{{value}}',item.ammount+" ¥");
            }
        }
    });
        
    table+="</table>";    
    
    document.querySelector('#table_content').innerHTML=table;
    
    $( "#table tr" ).bind( "tap", tapHandler );
}

account.refresh = function(){
    var state = storage.situation;
    var cur;
    var show;
    switch(state.currency){
        case "dollar": cur= " $"; break;
        case "euro": cur= "  e"; break;
        default: cur= " ¥"; break;
    }
    
    show=state.bank+cur;
    document.querySelector('#ammount1').innerHTML=show;
    
    show=state.cash+cur;
    document.querySelector('#ammount2').innerHTML=show;
    
    show=state.suica+cur;
    document.querySelector('#ammount3').innerHTML=show;
    
    show=this.calculate(account.date);
    document.querySelector('#ammount4').innerHTML=show+cur;
    
    
}
account.calculate = function (date){
    var exp=0;
    var collection=storage.entry;
    
    collection.forEach(function(item){
        if(item.type === 'expense'){
            if((parseInt(item.date.split("-")[0]) == (date.getFullYear())) && (parseInt(item.date.split("-")[1]) == (date.getMonth()+1))){
                exp+=parseInt(item.ammount);
            }
        }
    });
    
    return exp;
}

function next(op){
  // document.querySelector('#dialog_list').hide();
  account.dag1.hide();
  if(op === 'inc'){
      document.querySelector('#navigator').pushPage('add-income.html');
  }else{
      document.querySelector('#navigator').pushPage('add-expense.html');
  }  
};

function edit(){
    
    // document.querySelector('#navigator').popPage();
    account.dag2.hide();
    document.querySelector('#navigator').pushPage('edit.html');
}

account.editInit = function(view){
    var type=account.target.split('-')[0];
    var id=account.target.split('-')[1];
    
    
     document.querySelector('#val').value=storage.entry[id].ammount;
    document.querySelector('#source').value=storage.entry[id].target;
    document.querySelector('#myDate').value=storage.entry[id].date;
    document.querySelector('#'+storage.entry[id].src).checked=true;
    
    view.querySelector('#edit-button').addEventListener('click',function(){
        var type=account.target.split('-')[0];
        var id=account.target.split('-')[1];
        var old=storage.entry[id].ammount;
        var oldsrc=storage.entry[id].src;
         
        storage.entry[id].ammount=document.querySelector('#val').value;
        if(storage.entry[id].ammount==='' || storage.entry[id].ammount=== null){
            ons.notification.alert("No ammount specified");
            return;
        }
        storage.entry[id].target=document.querySelector('#source').value;
        storage.entry[id].date=document.querySelector('#myDate').value;
        storage.entry[id].src=$('input[name="type"]:checked').val();
        
        if(type === 'income'){
            storage.situation[storage.entry[id].src]=parseInt(storage.situation[storage.entry[id].src])+parseInt(storage.entry[id].ammount)
            storage.situation[oldsrc]=parseInt(storage.situation[oldsrc])-parseInt(old);     
        }else{
            if(storage.situation[storage.entry[id].src]<storage.entry[id].ammount){
                ons.notification.alert('Expense ammount exceeds funds in '+storage.entry[id].src);
                return;
            }else{
                storage.situation[storage.entry[id].src]-=storage.entry[id].ammount;
                storage.situation[oldsrc]=parseInt(storage.situation[oldsrc])+parseInt(old); 
            }
        }
        
        storage.save();
        document.querySelector('#navigator').resetToPage("main.html"); 
        account.refresh();
    });
    
}

function del(){
    var type=account.target.split('-')[0];
    var id=account.target.split('-')[1];
    
    // ons.notification.alert("Type is "+type+" id="+id);
    
    if(type === storage.entry[id].type){
        if(type === 'expense'){
            // ons.notification.alert("Before: "+storage.situation[storage.entry[id].src]+" After: "+(parseInt(storage.situation[storage.entry[id].src])+parseInt(storage.entry[id].ammount)));
          storage.situation[storage.entry[id].src]=parseInt(storage.situation[storage.entry[id].src])+parseInt(storage.entry[id].ammount);        
        }else{
            var sum=parseInt(storage.situation[storage.entry[id].src])-parseInt(storage.entry[id].ammount);
            if(sum>0){
                // ons.notification.alert("Before: "+storage.situation[storage.entry[id].src]+" After: "+(parseInt(storage.situation[storage.entry[id].src])-parseInt(storage.entry[id].ammount)));
                storage.situation[storage.entry[id].src]=parseInt(storage.situation[storage.entry[id].src])-parseInt(storage.entry[id].ammount);        
            }else{
                ons.notification.alert("The entry can't be deleted. Balance will go in negative ammount ");
                return;
            }
            
          
        }
        storage.remove(id);
        account.dag2.hide();
        document.querySelector('#navigator').popPage();
        document.querySelector('#splitter-menu').close();
        account.refresh();
    }else{
        ons.notification.alert("An error has occured, the entry can't be deleted");
        return;
    }
}
