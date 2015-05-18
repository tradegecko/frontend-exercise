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
(function ($) {

    var App = {ui : {}};

    App.settings = {
        GITHUB_API: 'https://api.github.com/legacy/repos/search/'
    }

    App.api = {
        searchRepoByName : function (queries) {
            return $.ajax({
                url : App.settings.GITHUB_API+queries,
                type : 'GET'
            });
        }
    }


    /**
     * @property {string} template
     * @property {Object} context
     * Context :
     * {
         *   template {handlebars-template},
         *   target : {Object},
         *   context : {Object} Data
         * }
     * */
    App.ui['renderHtml'] = function() {
        var self = this,
            $template = $(self.template),
            render = Handlebars.compile($template.html());
        var result = render(self.context);
        if(typeof self.target != 'undefined') {
            $(self.target).html(result);
        } else {
            $template.get(0).outerHTML = result;
        }
    }

    App.ui['result-list'] = function () {
        this.$element = $('.result-list');
        this.classEnum = {
            ACTIVE : 'active',
            DETAIL : '.detail'
        }
        this.listTemplate = {
            template : '#x-list',
            target : '#result-list',
            data : {
                results : [
                    {
                        name : '',
                        owner : '',
                        description : '',
                        url : '',
                        language : '',
                        followers : 0
                    }
                ]
            }
        }
        this._init();
    }
    App.ui['result-list'].prototype = {
        _init : function () {
            var self = this;

            self.$element.delegate('li', 'click', function (e) {
                var $this = $(this);
                if (!$this.hasClass('active')) {
                    $(this).addClass(self.classEnum.ACTIVE);
                } else {
                    $(this).removeClass('active');
                }
            });
            self.$element.delegate(self.classEnum.DETAIL, 'click', function (e) {
                e.stopPropagation();
            });
        },
        renderList : function (data) {
            if(data.repositories.length == 0 ) {
                this.setToNoResultFoundMode();
                return;
            }
            var cleanData = data.repositories.map(function (repository) {
                return {
                    name : repository.name,
                    owner : repository.owner,
                    description : repository.description,
                    url : repository.url,
                    followers : repository.followers,
                    language : repository.language
                }
            });
            this.listTemplate['context'] = {
                repositories : cleanData
            }
            App.ui['renderHtml'].call(this.listTemplate);
        },
        setToLoadingMode : function () {
            var self = this;
            self.loaderTemplate = {
                template : '#x-loader',
                target : '#result-list',
                context : {}
            }
            App.ui['renderHtml'].call(self.loaderTemplate);
            setTimeout(function () {
                $(self.loaderTemplate.target).find('.fade').addClass('in');
            },100);
        },
        setToNoResultFoundMode : function () {
            $('#result-list').html('<p class="not-found">Sorry, No Results Found. Please try another keywords.</p>');
        }
    }


    App.ui['searchGithub'] = function () {
        var self = this,
            resultList = new App.ui['result-list'];
        self.$form = $('#githubSearchControl');

        self.$form.on('submit',function (e) {
            var $searchInput = self.$form.find('.search');

            e.preventDefault();

            resultList.setToLoadingMode();
            App.api.searchRepoByName($searchInput.val()).then(function(data){
                resultList.renderList(data);
            });
        });
    }

    $(function () {
        new App.ui['searchGithub'];
    });

}(jQuery));




