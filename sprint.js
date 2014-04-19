Sprint = (function() {

	if (!jQuery) throw new Error("SprintJS requires jQuery!");

	var pages = {};

	var transitions = { default : 1 };

	var userData = null;

	var chromeHistoryAPIBugFix;

	$(function() {
		chromeHistoryAPIBugFix = false; // Chrome and Safari calls onpopstate on page load

		$(window).on("popstate", function(e) {
			var state = e.originalEvent.state;
			if (state !== null && chromeHistoryAPIBugFix) {
				Sprint.navigate(state.page, 'default', 
					{ backButtonPress : true,
						publicParams : state.publicParams,
						hiddenParams : state.hiddenParams });
			}
		} );

		var serverData = retrieveServerData();

		var pageName = serverData.pageName;

		var publicParams = serverData.publicParams;

		var hiddenParams = serverData.hiddenParams;

		window.history.replaceState({
			page:pageName,
			publicParams:publicParams,
			hiddenParams:hiddenParams}, '', getUrlPathAfterDomain());

		callPageHandlers(pageName);
	});

	function isInt(n) {
		// 1E308 is a float and 1E308 % 1 === 0
		// from: http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
	   return typeof n === 'number' && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
	}

	// function isInt(n) {
	//     return n === +n && n === (n|0);
	// }

	function strictCheckTypes(functionName, checkValues, types) {
		for (var i = 0; i < checkValues.length; i++) {
			var checkValueType = typeof checkValues[i];
			if (checkValueType !== types[i]) {
				throw new Error(functionName + "() : expected type "
					+ types[i] + " but was type "
					+ checkValueType + " in function parameters. Index is " + i);
			}
		}
	}

	function looseCheckTypes(functionNames, checkValues, types) {
		for (var i = 0; i < checkValues.length; i++) {
			var checkValueType = typeof checkValues[i];
			if (checkValueType !== types[i] && checkValueType !== 'undefined') {
				throw new Error(functionNames + "() : expected type of "
					+ types[i] + " or undefined, but was type "
					+ checkValueType + " in function parameters. Index is " + i);
			}			
		}
	}
	
	function formatUrlParameters(publicParams, hiddenParams, transitionName) {
		var returnString;

		var defaultParams = 'ajax=true';

		if (transitions[transitionName] > 1) {
			defaultParams += '&partial=' + transitions[transitionName];
		}

		if (hiddenParams) {
			hiddenParams = defaultParams + '&' + hiddenParams;
		} else {
			hiddenParams = defaultParams;
		}

		if (publicParams) {
			returnString = publicParams + '&' + hiddenParams;
		} else {
			returnString = hiddenParams;
		}
		return returnString;
	}

	function getUrlPathAfterDomain () {
		var a = document.createElement('a');
		a.href = document.URL;

		// solution for IE returning a different string for a.pathname
		if (a.pathname.charAt(0) === '/') {
			return a.pathname + a.search;	
		} else {
			return '/' + a.pathname + a.search;
		}
	}

	function retrieveServerData() {
		var userDefinedData = null;
		var pageName = $('.pageInfo').data('pagename');
		var publicParams = $('.publicParams').data('publicparams');
		var hiddenParams = $('.hiddenParams').data('hiddenparams');
		if (!pages.hasOwnProperty(pageName)) {
			throw new Error('retrieveServerData() : page name, ' 
				+ pageName
				+ ', retrieved from server does not correspond to an existing page');
		}

		if (typeof publicParams === 'undefined'
				|| publicParams === null) publicParams = '';
		if (typeof hiddenParams === 'undefined' 
				|| hiddenParams === null) hiddenParams = '';

		$( '.infoContainer' ).remove();

		return {
			pageName : pageName,
			publicParams : publicParams,
			hiddenParams : hiddenParams
		};
	}

	function callPageHandlers(pageName) {
		// dataHandler must always be called before page handler since page handler
		// often needs data retrieved from data handler to work
		userData = pages[pageName].dataHandler();
		pages[pageName].pageHandler();
	}

	function ajaxNavigate(pageName, transitionName, options) {

		var request = null;

		var page = pages[pageName];

		userData = null;

		if ( page ) {
			request = $.ajax({
				url: page.pageUrl,
				type: "get",
				data: formatUrlParameters(options.publicParams, options.hiddenParams, transitionName)
			});

			request.done(function (response, textStatus, jqXHR) {
				var ajaxContent = document.getElementById('ajaxContent_' + transitions[transitionName]);
				ajaxContent.innerHTML = response;
				ajaxContent.style.display = 'block';
				$('#spring_spinner').remove();

				callPageHandlers(pageName);

				if (!options.backButtonPress) {
					var pageUrl = page.pageUrl;
					if (options.publicParams !== '') pageUrl = page.pageUrl + '?' + options.publicParams;
					window.history.pushState({
						page:pageName,
						publicParams:options.publicParams,
						hiddenParams:options.hiddenParams }, '', pageUrl);
				}
			});
		} else {
			throw new Error("ajaxNavigate() : page passed in is not a key in pageMappings");
		}
	}

	return {

		getUserData : function () {
			return userData;
		},

		addPage : function (pageName, options) {
			// options = { pageUrl : '', publicParams : '', hiddenParams : '' }

			strictCheckTypes('addPage', 
				[pageName, options.pageUrl], 
				['string', 'string']);

			looseCheckTypes('addPage',
				[options.pageHandler, options.dataHandler],
				['function', 'function']);

			if (typeof options.pageHandler === 'undefined') options.pageHandler = function() {};
			if (typeof options.dataHandler === 'undefined') options.dataHandler = function() { return null; };

			pages[pageName] = options;

		},

		addTransition : function (transitionName, contentNumber) {

			if (!isInt(contentNumber)) throw new Error("addTransition() : ");

			transitions[transitionName] = contentNumber;

		},

		navigate : function (pageName, transitionName, options) {

			strictCheckTypes('navigate', 
				[pageName, transitionName, options, options.backButtonPress, 
					transitions[transitionName]], 
				['string', 'string', 'object', 'boolean', 'number']);

			looseCheckTypes('navigate',
				[options.publicParams, options.hiddenParams],
				['string', 'string']);

			if (typeof options.publicParams === 'undefined') options.publicParams = '';
			if (typeof options.hiddenParams === 'undefined') options.hiddenParams = '';

			$( '#ajaxContent_' + transitions[transitionName] ).fadeOut( 120, function() {
				ajaxNavigate(pageName, transitionName, options);
			});

			chromeHistoryAPIBugFix = true;
		}
	}
})();