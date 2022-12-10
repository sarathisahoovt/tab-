var from="";
var to="";
var url="";
var country="";
var multiply="1";
var conv=0.0;
var alltabs;
var myport=null;
var chk1=false;
var chk2=false;
var chk3=false;
var term="";
var mybookmarks;
var tabmove=false;

chrome.extension.onConnect.addListener(function(port) {
      port.onMessage.addListener(function(msg) {
           if(msg=="GetTabs")
		   {
			   myport=port;
			   chrome.storage.local.get('tabplusplus', function (result) {
					var str = result.tabplusplus;
					if(str==undefined)
					{
						getTabs();
						return;
					}
					var res = str.split("##mysplit##");
					var chkk1 = res[0];
					var chkk2=res[1];
					var chkk3=res[2];
					chk1=JSON.parse(chkk1);
					chk2=JSON.parse(chkk2);
					getTabs();
				});
			   
		   }
		   if(msg.indexOf("search=")!=-1)
		   {
			   msg=msg.replace("search=","");
			   term=msg;
		   }
		   if(msg.indexOf("closetab")!=-1)
		   {
			   msg=msg.replace("closetab","");
			   chrome.tabs.remove(parseInt(msg), function() { });
		   }
		   if(msg.indexOf("updatetabs")!=-1)
		   {
			   msg=msg.replace("updatetabs","");
			   var arr=msg.split(",");
			   var newtabs=[];
			   var v1 = 'tabplusplus';
				var obj= {};
				obj[v1] = "false##mysplit##false##mysplit##false";
				chrome.storage.local.set(obj);
				tabmove=true;
			   for(var i=0;i<arr.length-1;i++)
			   {
				  chrome.tabs.move(parseInt(arr[i]), {index: i});
				  for(var j=0;j<alltabs.length;j++)
				  {
					  if(arr[i]==alltabs[j].id)
					  {
						  newtabs.push(alltabs[j]);						  
						  break;
					  }
				  }
			   }
			   setTimeout(function(){ 
			   tabmove=false;
			   }, 200);
			   alltabs=newtabs;
			   //myport.postMessage(alltabs);
		   }
		   if(msg=="ordertitle")
		   {
			   getTabs();
			   setTimeout(function(){ 
			   alltabs.sort(sortOn("title"));
			   tabmove=true;
			   for(var i=0;i<alltabs.length;i++)
			   {
				   chrome.tabs.move(alltabs[i].id, {index: i});
			   }
			   setTimeout(function(){ 
			   tabmove=false;
			   }, 200);
			   myport.postMessage(alltabs);
			   }, 100);
			   
		   }
		   if(msg=="orderurl")
		   {
			   getTabs();
			   setTimeout(function(){ 
			   alltabs.sort(sortOn("url"));
			   tabmove=true;
			   for(var i=0;i<alltabs.length;i++)
			   {
				   chrome.tabs.move(alltabs[i].id, {index: i});
			   }
			   setTimeout(function(){ 
			   tabmove=false;
			   }, 200);
			   myport.postMessage(alltabs);
			   }, 100);
			   
		   }
		   if(msg.indexOf("changetab")!=-1)
		   {
			   msg=msg.replace("changetab","");
			   chrome.tabs.update(parseInt(msg), {active: true});
			   if(term!="")
			   {
				   chrome.tabs.query({
					   windowId: chrome.windows.WINDOW_ID_CURRENT
					}, function (tabs) {
						chrome.tabs.sendMessage(parseInt(msg), {
							"functiontoInvoke": "highlight",
							"val":term
						});
					}); 
			   }
		   }
           
      });
});
function getTabs()
{
	alltabs=[];	
	//alert(JSON.stringify(mybookmarks));
	chrome.tabs.query({
		windowId: chrome.windows.WINDOW_ID_CURRENT
	}, function (tabs) {
		for(var i=0;i<tabs.length;i++)
		{
			var tab = new Object();
			tab.id=tabs[i].id;
			tab.img=tabs[i].favIconUrl;
			tab.url=tabs[i].url;
			tab.title=tabs[i].title;
			tab.data="";
			chrome.tabs.sendMessage(tabs[i].id, {
				"functiontoInvoke": "getcontent",
				"index":i,
			});
			alltabs.push(tab);
		}
		setTimeout(function(){ senddata(); }, 100);
	}); 
}

function sortOn(property){
    return function(a, b){
        if(a[property].toLowerCase() < b[property].toLowerCase()){
            return -1;
        }else if(a[property].toLowerCase() > b[property].toLowerCase()){
            return 1;
        }else{
            return 0;   
        }
    }
}

function senddata()
{
	if(chk1)
	{
		alltabs.sort(sortOn("url"));
	}
	if(chk2)
	{
		alltabs.sort(sortOn("title"));
	}
	chrome.tabs.query({
	  active: true,
	  currentWindow: true
	}, function(tabs) {
	  var tab = tabs[0];
	  var id = tab.id;
	  myport.postMessage("activetab="+id);
	  myport.postMessage(alltabs);
	});
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	if(msg.text == "takecontent")
	{
		var tabid=sender.tab.id;
		var data=msg.val;
		var index=msg.index;
		alltabs[index].data=data.toLowerCase();
	}
});

updateTabCount();

function updateTabCount()
{
	chrome.tabs.query({
		windowId: chrome.windows.WINDOW_ID_CURRENT
	}, function (tabs) {
		chrome.browserAction.setBadgeText({text: ''+tabs.length});
	}); 
}

chrome.tabs.onMoved.addListener(function() {
	if(!tabmove)
	{
		getTabs();
		var v1 = 'tabplusplus';
		var obj= {};
		obj[v1] = "false##mysplit##false##mysplit##false";
		chrome.storage.local.set(obj);
	}

});


chrome.tabs.onRemoved.addListener(function(tabid, removed) {
 updateTabCount();
 //getTabs();
});

chrome.tabs.onCreated.addListener(function() {
 updateTabCount();
 //getTabs();
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
 updateTabCount();
 //getTabs();
});

getTabs();

chrome.commands.onCommand.addListener( function(command) {	
    if(command === "ordertitle")
	{
		getTabs();
		setTimeout(function(){
		tabmove=true;
		alltabs.sort(sortOn("title"));
	   for(var i=0;i<alltabs.length;i++)
	   {
		   chrome.tabs.move(alltabs[i].id, {index: i});
	   }
		var v1 = 'tabplusplus';
		var obj= {};
		obj[v1] = "false##mysplit##true##mysplit##false";
		chrome.storage.local.set(obj);
		setTimeout(function(){ 
	   tabmove=false;
	   }, 200);
		myport.postMessage(alltabs);

		}, 100);
       
    }
	if(command === "orderurl")
	{
		getTabs();
		setTimeout(function(){
		tabmove=true;
		alltabs.sort(sortOn("url"));
	   for(var i=0;i<alltabs.length;i++)
	   {
		   chrome.tabs.move(alltabs[i].id, {index: i});
	   }
		var v1 = 'tabplusplus';
		var obj= {};
		obj[v1] = "true##mysplit##false##mysplit##false";
		chrome.storage.local.set(obj);
		setTimeout(function(){ 
	   tabmove=false;
	   }, 200);
		myport.postMessage(alltabs);

		}, 100);
        
    }
});


