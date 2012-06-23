/*
* Models
*/

var Feed = Backbone.Model.extend({});

/*
* Collections
*/
var FeedCollection = Backbone.Collection.extend({
	"model": Feed,

	"sync": function (method, model, options) {
		options.timeout = 5000; // 10seg
		options.dataType = "jsonp";
		return Backbone.sync(method, model, options);
	},

	"parse": function (response) {
		this.last_feed = response.next["query-params"]["last-feed-id"];
		return response.docs;
	},

	"url": "http://getprismatic.com/internal-api/news/home"
});

/*
* Views
*/
var FeedView = Backbone.View.extend({
	"tagName": "li",

	"template": _.template($("#tpl-new").html()),

	"render": function () {
		var feed = this.model;

		feed = feed.toJSON();

		$(this.el).html(this.template(feed));

		return this;
	}
});

var AppView = Backbone.View.extend({
	"el": "#news",

	"initialize": function () {
		this.collection = new FeedCollection();
		
		this.$el
			.prepend(this.$list);

		this.$el.removeClass("ch-hide");

		this.fetch();
	},

	"events": {
		"scroll": "more",
		"click .new a": "read"
	},

	"$loginView": _.template($("#tpl-login").html()),

	"$list": $("<ul class=\"ch-slats ch-list ch-hide\">"),

	"$loading": $(".ch-loading"),

	"render": function () {
		var that = this;
		_.each(this.collection.models, function (feed) {
			var feed = new FeedView({"model": feed});
			that.$list.append(feed.render().el);
		}, this);

		this.$list.removeClass("ch-hide");

		return this;
	},

	"fetch":  function () {
		var that  = this;
		this.$loading.removeClass("ch-hide");
		this.collection.fetch({
			"data": {
				"last-article-idx": 4,
				"last-feed-id": that.collection.last_feed
			},
			"success": function () {
				that.$loading.addClass("ch-hide");
				that.render();
			},

			"error": function () {
				that.loginView();
			}
		});
	},

	"more": function () {
		var height = this.$list.height() - this.$el.height(),
			bottom = this.el.scrollTop;
		if (height === bottom) {
			this.fetch();
		};

		return;
	},

	"loginView": function () {
		this.$loading.addClass("ch-hide");
		this.$el.append(this.$loginView);
	},

	"read": function (event) {
		chrome.tabs.create({"url": event.currentTarget.href});
		return false;
	},

	"reset": function () {
		this.last_feed = undefined;
		this.collection.reset();
		this.$list.html("");
	}

});

var prismatic;
setTimeout(function () {
	prismatic = new AppView();
}, 1000);