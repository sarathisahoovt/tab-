chrome.extension.onMessage.addListener(function (message, sender, callback) {
	if (message.functiontoInvoke == "getcontent") {
		var data="";		
		if(document)
		{
			if(document.getElementsByTagName('body')[0])
			{
				data=document.getElementsByTagName('body')[0].innerText;
			}
		}
		chrome.runtime.sendMessage({text: "takecontent",val:data,index:message.index}, function(response) {
		});
    }
	if (message.functiontoInvoke == "highlight") {
		var term=message.val;
		hightlight(term);
    }
});
var currentIndex = 0;
var $results;
var offsetTop = 50;

function hightlight(term)
{	
	$("body").unmark();
	$("body").mark(term, {
          separateWordSearch: false,
          done: function() {
            $results = $("body").find("mark");
            currentIndex = 0;
            jumpTo();
          }
        });
}

function jumpTo() {
    if ($results.length) {
      var position,
        $current = $results.eq(currentIndex);
      if ($current.length) {
        position = $current.offset().top - offsetTop;
        window.scrollTo(0, position);
      }
    }
  }