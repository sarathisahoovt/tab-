 var port = chrome.extension.connect({
      name: "Tabs"
 });
 var json=null;
 var newjson=null;
 var index=-1;
 var selectedrow=null;
 var event1=null;
 var status=false;

$("#SeeAllEvents").hide();
$("#optionpane").hide();
var timeoutId;
var activetab=0;


// If the document is clicked somewhere
$(document).bind("mousedown", function (e) {
    
    // If the clicked element is not the menu
    if (!$(e.target).parents(".custom-menu").length > 0) {
        
        // Hide it
        $(".custom-menu").hide(100);
    }
});

$(".custom-menu li").click(function(){
    
    // This is the triggered action name
    switch($(this).attr("data-action")) {
		
    }
	$('body').append('<textarea id="test" style="width:0px;height:0px;"/>');
    var $test = $('#test');
    $test.text(selectedrow);
    $test.select();
    document.execCommand('copy');
	$('#test').remove();
    // Hide it AFTER the action was triggered
    $(".custom-menu").hide(100);
  });

 document.getElementById('searchbox').addEventListener('keyup', function (e) {
	var inp = String.fromCharCode(e.keyCode);
	if (/[a-zA-Z0-9-_ ]/.test(inp))
	{
		filterdata();
	}
	if(e.keyCode==8)
	{
		filterdata();
	}
});

$('#tblemp').on('click', '.clickable-row', function(event) {
	//$(this).addClass('active').siblings().removeClass('active');
	var id = $(this).closest('tr').attr('id');
	port.postMessage("search="+document.getElementById('searchbox').value);
	port.postMessage("changetab"+id);
});

$('#tblemp').on('click', '.closeicon', function(event) {
	event.stopPropagation();
	var id = $(this).attr('id');
	port.postMessage("closetab"+id);
	$('#'+id).remove();
	$('#trurl'+id).remove();
	for(var i=0;i<json.length;i++)
	{
		if(json[i].id==id)
		{
			json.splice(i, 1);
			break;
		}
	}
});

$('#option').on('click',function(event) {
	event.stopPropagation();
	if($("#optionpane").is(":visible"))
	{
		$("#optionpane").slideUp('fast');
	}
	else
	{
		
		chrome.storage.local.get('tabplusplus', function (result) {
        var str = result.tabplusplus;
		$("#optionpane").slideDown('fast');
		if(str==undefined)
		{
			return;
		}
		var res = str.split("##mysplit##");
        var chk1 = res[0];
		var chk2=res[1];
		var chk3=res[2];
        document.getElementById('chk1').checked=JSON.parse(chk1);
		document.getElementById('chk2').checked=JSON.parse(chk2);
		document.getElementById('chk3').checked=JSON.parse(chk3);
    });
	}
	
});

$('#optionpane').on('click',function(event) {
	event.stopPropagation();	
});

$(document).on('click',function(event) {
	$("#optionpane").slideUp('fast');	
});

$("#chk1").change(function() {
		var v1 = 'tabplusplus';
		var obj= {};
		obj[v1] = document.getElementById('chk1').checked+"##mysplit##"+document.getElementById('chk2').checked+"##mysplit##"+document.getElementById('chk3').checked;
		chrome.storage.local.set(obj);
		if(document.getElementById('chk1').checked)
		{
			port.postMessage("orderurl");
		}
		else if(document.getElementById('chk2').checked)
		{
			port.postMessage("ordertitle");
		}
});

$("#chk2").change(function() {
		var v1 = 'tabplusplus';
		var obj= {};
		obj[v1] = document.getElementById('chk1').checked+"##mysplit##"+document.getElementById('chk2').checked+"##mysplit##"+document.getElementById('chk3').checked;
		chrome.storage.local.set(obj);
		if(document.getElementById('chk2').checked)
		{
			port.postMessage("ordertitle");
		}
		else if(document.getElementById('chk1').checked)
		{
			port.postMessage("orderurl");
		}
		
});

$("#chk3").change(function() {
		var v1 = 'tabplusplus';
		var obj= {};
		obj[v1] = document.getElementById('chk1').checked+"##mysplit##"+document.getElementById('chk2').checked+"##mysplit##"+document.getElementById('chk3').checked;
		chrome.storage.local.set(obj);
});

$(document).bind('keyup', function(e) {
	if(e.keyCode!=38 && e.keyCode!=40 && e.keyCode!=13)
	{
		return;
	}
    if(e.keyCode==38)
	{
		index--;
	}
	if(e.keyCode==40)
	{
		index++;
	}
	var arr=document.getElementsByClassName('clickable-row');
	if(index>=arr.length)
	{
		index=0;
	}
	if(index<0)
	{
		index=arr.length-1;
	}
	if(e.keyCode==13)
	{
		var cls=$(document.getElementsByClassName('clickable-row')[index]).hasClass('active');
		if(!cls)
		{
			return;
		}
		var id=$(document.getElementsByClassName('clickable-row')[index]).attr('id');
		port.postMessage("search="+document.getElementById('searchbox').value);
		port.postMessage("changetab"+id);
		return;
	}
	//alert(document.getElementsByClassName('clickable-row').length);
	$(document.getElementsByClassName('clickable-row')[index]).addClass('active').siblings().removeClass('active');
	if($(document.getElementsByClassName('clickable-row')[index-1]))
	{
		$(document.getElementsByClassName('clickable-row')[index-1]).removeClass('active');
	}
	if($(document.getElementsByClassName('clickable-row')[index+1]))
	{
		$(document.getElementsByClassName('clickable-row')[index+1]).removeClass('active');
	}
	
});
 
 port.postMessage("GetTabs");
 port.onMessage.addListener(function(alltabs) {
	 if(alltabs.indexOf('activetab=')!=-1)
	 {
		 alltabs=alltabs.replace("activetab=","");
		 activetab=parseInt(alltabs);
		 return;
	 }
	 json=alltabs;
	 filterdata();
 });
 
 function populatedata(json)
 {
	 var str="";
	 $( "tbody" ).each( function(){
	  this.parentNode.removeChild(this); 
	});
	 for(var i=0;i<json.length;i++)
	 {
		 str=str+"<tbody><tr class='clickable-row' id='"+json[i].id+"' data-toggle='tooltip'>";
		 if(json[i].img!="" && json[i].img!=undefined)
		 {
			 str=str+"<td class='first'><img class='favicon' src='"+json[i].img+"'></td>";
		 }
		 else
		 {
			 str=str+"<td class='first'><img class='favicon' src='no-photo.png'></td>";
		 }
		 if(activetab==json[i].id)
		 {
			 str=str+"<td style='font-weight:bold;color:blue;' id='"+json[i].id+"' class='title"+i+"' data-toggle='tooltip'>"+json[i].title+"</td>";
		 }
		 else
		 {
			 str=str+"<td id='"+json[i].id+"' class='title"+i+"' data-toggle='tooltip'>"+json[i].title+"</td>";
		 }	 
		 str=str+"<td><img id='"+json[i].id+"' class='closeicon' src='close.png'></td></tr>";
		 str=str+'<tr id="trurl'+json[i].id+'" style="height:0px;"><td style="padding: 0px;line-height:0px;background: moccasin;"></td><td style="padding: 0px;line-height:0px;"><div class="SeeAllEvents" id="popup'+json[i].id+'">'+json[i].url+'<span class="copyurl" data-action="'+json[i].url+'">Copy</span></div></td><td style="padding: 0px;line-height:0px;background: moccasin;"></td></tr></tbody>';
	 }
	 if(json.length==0)
	 {
		str="";
		$("<tbody><tr><td>No match found</td></tr></tbody>").insertAfter("#tblhead");
	 }
	 else
	 {
		 $(str).insertAfter("#tblhead");
	 }
	 
	 $(".copyurl").click(function(){
		$('body').append('<textarea id="test" style="width:0px;height:0px;"/>');
		var $test = $('#test');
		$test.text($(this).attr("data-action"));
		$test.select();
		document.execCommand('copy');
		$('#test').remove();
		$(this).text("Copied");
	  });
	 
	 $(".SeeAllEvents").hide();
	$(".clickable-row").hover(function(event) {
		$(".SeeAllEvents").hide();
        if (!timeoutId) {
            timeoutId = window.setTimeout(function() {
                timeoutId = null;
				var id=event.target.id;
				$(".SeeAllEvents").hide();
                $("#popup"+id).slideDown('slow');
           }, 2000);
        }
    },
    function () {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
        else {
			event1=event;
			setTimeout(function(){if(status){return;} var id=event1.target.id;$("#popup"+id).slideUp('slow'); }, 100);
        }
    });
	
	$(".SeeAllEvents").hover(function(event) {
		//alert(1);
        status=true;
    },
    function () {
		status=false;
    });
	$(".thclass").hover(function(event) {
		$(".SeeAllEvents").hide();
		status=false;
    },
    function () {
		$(".SeeAllEvents").hide();
		status=false;
    });
	$("#tblemp").hover(function(event) {
    },
    function () {
		$(".SeeAllEvents").hide();
		status=false;
    });
	//$('tbody').sortable();
    var fixHelper = function(e, ui) {  
	  ui.children().children().each(function() { 
		$(this).width($(this).width()); 
	  });  
	  return ui;  
	};

	$("#tblemp").sortable({
			helper: fixHelper,
			update: function() {
				var tabs=document.getElementsByClassName('clickable-row');
				var str="updatetabs";
				for(var i=0;i<tabs.length;i++)
				{
					str=str+tabs[i].id+",";
				}
				port.postMessage(str);
			},
			items: "tbody"
		}).disableSelection();
	 //$('[data-toggle="tooltip"]').tooltip();  
 }
 
 function filterdata()
 {
	 var val=document.getElementById('searchbox').value.toLowerCase();
	 if(val=="")
	 {
		 populatedata(json);
	 }
	 else
	 {
		 newjson=[];
		 for(var i=0;i<json.length;i++)
		 {
			 if(json[i].title.indexOf(val)!=-1)
			 {
				 newjson.push(json[i]);
				 continue;
			 }
			 if(json[i].url.indexOf(val)!=-1)
			 {
				 newjson.push(json[i]);
				 continue;
			 }
			 if(json[i].data.indexOf(val)!=-1)
			 {
				 newjson.push(json[i]);
				 continue;
			 }
		 }
		 populatedata(newjson);
	 }
 }