$(document).ready(function() {	
	$('#button').click(function() {
		var key = $('#search').val();
		var searchstring = 'https://api.github.com/legacy/repos/search/'+key;
		$.get( searchstring, function( data ) {	
			var numResults = data.repositories.length;		
			$( "#results" ).empty();
			for(var count=0;count<numResults;count++){			
				var resultName = data.repositories[count].username + "/" + data
				.repositories[count].name;
				var iLang = "Language: " + data.repositories[count].language + "<br />";
				var iFol = "Followers: " + data.repositories[count].followers + "<br />";
				var iUrl = "URL: " + data.repositories[count].url + "<br />";
				var iDes = "Description: " + data.repositories[count].description + "<br />";
				$( "#results" ).append("<p class=\"res\">" + resultName + "</p>");
				$( "#results" ).append("<p class=\"mor\">" + iLang + iFol + iUrl + iDes + "</p>");
				$('.mor').hide();
			}
		});	
	});		
	

	$('body').on('click','p.res',function() {
		$(this).next().slideToggle(300);
	});
});