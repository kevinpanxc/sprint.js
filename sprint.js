Sprint = (function() {

	if (!jQuery) throw new Error("SprintJS requires jQuery!");

	var pages = {};

	var transitions = { default : 1 };

	$(function() {
		$(window).on("popstate", function(e) {
			if (e.originalEvent.state !== null) {
				Sprint.navigate(e.originalEvent.state.page, 'default', 
					{ backButtonPress : true });
			}
		} );

		var pageName = getPageData();

		window.history.replaceState({page:pageName}, '', getUrlPathAfterDomain());

		pages[pageName].pageHandler();
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
				throw new Error(functionName + "() : expected type of "
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
		return a.pathname + a.search;
	}

	function getPageData() {
		var pageName = $('.pageInfo').data('pagename');
		$( '.pageInfo' ).remove();
		return pageName;
	}

	function ajaxNavigate(pageName, transitionName, options) {

		var request = null;

		var page = pages[pageName];

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

				pages[pageName].pageHandler();
				if (!options.backButtonPress) {
					if (options.publicParams !== '') options.publicParams = '?' + options.publicParams;
					window.history.pushState({
						page:pageName}, '', page.pageUrl + options.publicParams);
				}
			});
		} else {
			throw new Error("ajaxNavigate() : page passed in is not a key in pageMappings");
		}
	}

	return {

		addPage : function (pageName, options) {
			// options = { pageUrl : '', publicParams : '', hiddenParams : '' }

			strictCheckTypes('addPage', 
				[pageName, options.pageUrl, options.pageHandler], 
				['string', 'string', 'function']);

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

		}
	}
})();