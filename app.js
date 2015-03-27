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
Ext.Loader.setConfig({
  enabled: true
});

Ext.require([
    'Ext.form.*',
    'Ext.data.*',
    'Ext.grid.*'
]);

Ext.onReady(function(){
    Ext.define('GithubSearch', {
        extend: 'Ext.data.Model',
        fields: [
            'type', 'username', 'name', 'owner', 'homepage', 'description', 'language', 'watchers', 'followers', 'forks', 'size', 'open_issues', {name: 'score', type: 'float'}, {name: 'has_downloads', type: 'boolean'}, {name: 'has_issues', type: 'boolean'}, {name: 'has_wiki', type: 'boolean'}, {name: 'fork', type: 'boolean'}, {name: 'private', type: 'boolean'}, 'url', {name: 'created', type: 'date'}, {name: 'created_at', type: 'date'}, {name: 'pushed_at', type: 'date'}, {name: 'pushed', type: 'date'}
        ]
    });
     
    var gitHubStore = Ext.create('Ext.data.Store', {
        model: 'GithubSearch',
        autoLoad: false,
        proxy: {
            type:'ajax',					
            reader: {
                type: 'json',
				totalProperty: 'total',
                root: 'repositories'
            }
        },
        listeners: {
			load: function() {
				Ext.getCmp('gitColumn').setText('Owner / Name - <b>'+gitHubStore.getCount()+' repositories found</b>');
			}
		}
    });
    
    var githubSearch = Ext.create('Ext.form.Panel', {
        frame:true,
        title: 'Github Search',
        bodyStyle:'padding:5px 5px 0',
        width: 600,
        items: [{
            xtype:'textfield',
            width:550,
            fieldLabel: 'Enter Keywords',
            allowBlank:false,
            id: 'searchText',
            enableKeyEvents : true,
            listeners: {
                'change': function(){
                    gitHubStore.getProxy().url = 'https://api.github.com/legacy/repos/search/'+this.value;
                    results.store.load();
                }
            }
        }],
        renderTo: 'content'
    });
    
    var results = Ext.create('Ext.grid.Panel', {
        store: gitHubStore,  
        width: 600,
        height: 300,
        forceFit: true,
        viewConfig: {
			loadingText: "Searching.. Please wait..."
		},
		columns: [
            {header: "Owner / Name",  dataIndex: 'owner', id:'gitColumn',
				renderer: function(value, p, r){return r.data['owner'] + '/' + r.data['name']} 
			}
        ],
        plugins: [{
            ptype: 'rowexpander',
            rowBodyTpl : [
                 '<p><b>Language:</b> {language} <b>Followers:</b> {followers} <b>URL:</b> <a href={url}>{url}</a></p><br>',
				'<p>{description}</p>'
            ]
        }],
        renderTo: 'content'
    });
});

