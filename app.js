/**
** Author: jianmin
** Date: 2014-10-22
** RemarkS: Not working in IE, cross domain problem
**/
var app = {};

//bind events
app.initEventHandlers = function(){

   $('#search-btn').on('click',app.search);  
   $('.back-btn').on('click', app.displaySearchResults);

  
  $( "#search" ).keypress(function( event ) {
    if ( event.which == 13 ) {
       event.preventDefault();
        app.search();
    }
  });

};
//search button
app.search = function (){
  
  var keyword = $('#search').val();

  if( keyword == null || keyword.trim().length === 0){
    var html = '<h3><span style="color:red;">Please enter valid keyword</span></h3>';
    app.displayMessage(html);
    return;
  }
  
  var url = 'https://api.github.com/search/repositories?q=' + keyword + '&sort=stars&order=desc';
  
  var param = {url:url,type:'repo'};
  
      app.fetchGitHubDataByUrl(param);
  
};

//param: url, type(repo,follower)
app.fetchGitHubDataByUrl = function (param){
  var url = param.url,
      type = param.type;

   $.ajax({
          crossdomain: true,
          url:url

    }).done(function(res, status, xhr){

        var link = xhr.getResponseHeader('Link');

        var pass = {data:res,link:link,url:url,type:type};

        app.fetchGitHubAjaxDone(pass);
      
            
    }).fail(function(xhr,error){

         //console.log(xhr);
         //CHECK IE ACCESS DENIED
         //var xdr = new XDomainRequest(); 
        //xdr.onload = function(){
          //     console.log(xdr.responseText);
        //};
         //xdr.open("get", url);
         //xdr.send();

        app.fetchGitHubAjaxFail({error:error,type:type});
    
    });

};

//param: data, type
app.fetchGitHubAjaxDone = function (param){
     var data = param.data,
         link = param.link,
         url = param.url,
         type = param.type;

     if (type == 'repo'){

       app.searchGithubDone(data);

     }else {
        app.fetchFollowersDone(data);
     }

     var pass = {link:link,url:url,type:type};

     app.buildPageButtons(pass);   
       
};
 
//search repo done
app.searchGithubDone = function (data){
   var total = data.total_count;
   var results = data.items;

  app.clearSearchResults();
 
  app.displayTotalResults (total);
  
   results.forEach(function(result,index){

        var name = result.full_name,
            language = result.language,
            follower = result.stargazers_url,//url ajax
            url = result.url,
            description = result.description;

        var li = new app.CreateResultItem(name,language,follower,url,description);   
            li.createItem(); 
   });

};

//create li element for search result
app.CreateResultItem = function (name,language,follower,url,description){
    this.name = name;
    this.language = language;
    this.url = url;
    this.follower = follower;
    this.description = description;
  
    this.createItem = function(){
        var that = this;
        var li = document.createElement('li');
        li.className = 'search-result-item';
        
        li.onclick = function(){         

           var param = {name: ''+that.name,language:''+that.language,follower:''+that.follower, url: ''+that.url, description:''+that.description};
               
               app.displayRepoDetails(param);
        };

        $(li).html(that.name);

        $('#search-result').append(li);
    };
};



app.displayRepoDetails = function (param){

  app.displaySingleRepo();
    
    var name = param.name,
        url =  param.url,
        language = param.language,
        follower =  param.follower,
        description = param.description;
       
       $('.repo-name').html(name);
       $('.repo-lang').html(language);
       $('.repo-desc').html(description);
       $('.repo-url').html(url);

    var pass = {url:follower,type:'follower'};
        
        app.fetchGitHubDataByUrl(pass);
       
};

//fetch repo followers 
app.fetchFollowersDone =  function(res){

  app.clearFollowers();

  var l = res.length;

  if(l == 0){
    $('#follower-result').html('No follower yet.');
    return;
  }

  res.forEach(function(f,i){

      var follower = new app.CreateFollower(f.avatar_url,f.login);
          follower.createItem();
  });


};

app.CreateFollower = function(img,follower){

    this.img = img;
    this.follower = follower;

    this.createItem = function(){
        var that = this;
        var li = document.createElement('li');
        li.className = 'follower-item';

        var html = '<div class="user-img"><img width="90" height="90" src="' + that.img + '"> </div>';
            html += '<div class="user-name">'+ that.follower +'</div>';

        $(li).html(html);
        $('#follower-result').append(li);
    };


};


//get Link data for paging  param: link, url, type
app.buildPageButtons = function (param){

   var link = param.link,
       url = param.url,
       type = param.type;

   var paging = $('.search-result-paging');
      
   if (type == 'follower'){
    
       paging = $('.repo-follower-paging');
   }

   paging.empty();

   
   if(link == null || link == undefined ){
      //hide paging
      return;     
   }

   var links = app.getGitHubResponseLinks(link);

   var first = links.first,
         last = links.last,
         prev = links.prev,
         next = links.next;
    
    if(first != 0){
        var firstPage = new app.CreatePageButton('First', first);
        firstPage.createButton(paging,type);

    }
 
    if(prev != 0){
        var  prevPage = new app.CreatePageButton('Previous', prev);
        prevPage.createButton(paging,type);

    }

    if(next != 0){
        var nextPage = new app.CreatePageButton('Next', next);
        nextPage.createButton(paging,type);

    }


    if(last != 0){
        var lastPage = new app.CreatePageButton('Last', last);
        lastPage.createButton(paging,type);

    }

    paging.show();


};

app.CreatePageButton = function(page, src){
    this.page = page;
    this.src = src;
     
    this.createButton = function(paging,type){
          var that = this;
          
          var a = document.createElement('a');
          a.className = 'paging-button';
        
          a.onclick = function(){
        
              var param = {url:that.src,type:type};
  
              app.fetchGitHubDataByUrl(param);
              
          };

          $(a).html(that.page);

          paging.append(a);
    };

};


//display total found results
app.displayTotalResults = function (total){

  var numstr =  '0 result';  

  (+total) > 0 ?  numstr = total + ' results' : numstr = '0 result';

  var html = '<h3>We have found ' + numstr +'</h3>';

  app.displayMessage(html);
  
};

//param: error, type
app.fetchGitHubAjaxFail = function(param){
   var error = param.error,
       type = param.type;
  if(type == 'repo'){
    app.displayMessage('<h3 style="color:red;">Search error: ' + error + ' </h3>'); 
  } else{

     $('#follower-result').html('<h3 style="color:red;">Search followers error: ' + error + ' </h3>');
  }
   
};
 
//clear search 
app.clearSearchResults = function(){
     $('#search-result').empty();
};
//clear followers
app.clearFollowers = function(){
    $('#follower-result').empty();
};

//display message for search
app.displayMessage = function(html){
  var repo = $('#repo-total');
      repo.html(html).show();

      app.displaySearchResults();
};

app.displaySearchResults = function(){
  var repo = $('#repo-results'),
      details = $('#repo-details');

  $('.search-header').css({'padding-top':0,'margin-left':'0'});
    
    repo.show();       
    details.hide();
};


app.displaySingleRepo = function(){

  var repo = $('#repo-results'),
      details = $('#repo-details');
    
    repo.hide();       
    details.show();

};

//method to get Link from response data for pagination
app.getGitHubResponseLinks = function(link){

  var links = {first:0,last:0,prev:0,next:0};//return url if has

  var firstIndex = link.indexOf('rel="first"');  
  var nextIndex = link.indexOf('rel="next"');
  var prevIndex = link.indexOf('rel="prev"');  
  var lastIndex = link.indexOf('rel="last"');
    
  
  function getPage(type,index){

      var next = link.substring(0,index);
      var i = index - 2;
        while (next[i]!='<'){
            i--;
        }
        var page =  link.substring(i+1,index-3);
          //console.log(pageFirst);
        
        links[type] = page;

  }

  if(firstIndex > -1 ){
     getPage('first',firstIndex);
  }
    
  if(lastIndex > -1 ){
      getPage('last',lastIndex);
  }
    
  if(nextIndex > -1 ){
    getPage('next',nextIndex);
  }

  if(prevIndex > -1 ){
    getPage('prev',prevIndex);
  }
    
    return links;
};



$(document).ready(function(){
   app.initEventHandlers();
});


/*
    # Endpoint URL #

    https://api.github.com/legacy/repos/search/{query}

    Note: Github imposes a rate limit of 60 request per minute. Documentation can be found at http://developer.github.com/v3/.

    # Example Response JSON #

    {
      "repositories": [
        {
          "created_at": "2014-01-13T02:37:26Z",
          "description": "A Ruby interface to the TradeGecko API.",
          "followers": 1,
          "fork": false,
          "forks": 2,
          "has_downloads": true,
          "has_issues": true,
          "has_wiki": true,
          "homepage": null,
          "language": "Ruby",
          "name": "gecko",
          "open_issues": 3,
          "owner": "tradegecko",
          "private": false,
          "pushed": "2014-07-29T08:18:51Z",
          "pushed_at": "2014-07-29T08:18:51Z",
          "score": 16.24838,
          "size": 1617,
          "type": "repo",
          "url": "https://github.com/tradegecko/gecko",
          "username": "tradegecko",
          "watchers": 1
        }
      ]
    }
*/


