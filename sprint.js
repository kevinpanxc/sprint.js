Sprint = (function() {

	if (!jQuery) throw new Error("SprintJS requires jQuery!");

	var pages = {};

	var transitions = { default : 1 };

	$(function() {
		$(window).on("popstate", function(e) {
			if (e.originalEvent.state !== null) {
				Sprint.navigate(e.originalEvent.state.page, 'default', true);
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

	function checkTypes(functionName, checkValues, types) {
		for (var i = 0; i < checkValues.length; i++) {
			var checkValueType = typeof checkValues[i];
			if (checkValueType !== types[i]) {
				throw new Error(functionName + "() : expected type "
					+ types[i] + " but was type "
					+ checkValueType + " in function parameters");
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

	function ajaxNavigate(pageName, transitionName, backButtonPress) {

		var request = null;

		var page = pages[pageName];

		if ( page ) {
			request = $.ajax({
				url: page.pageUrl,
				type: "get",
				data: formatUrlParameters(page.publicParams, page.hiddenParams, transitionName)
			});

			request.done(function (response, textStatus, jqXHR) {
				var ajaxContent = document.getElementById('ajaxContent_' + transitions[transitionName]);
				ajaxContent.innerHTML = response;
				ajaxContent.style.display = 'block';
				$('#spring_spinner').remove();

				pages[pageName].pageHandler();
				if (!backButtonPress) {
					if (page.publicParams !== '') page.publicParams = '?' + page.publicParams;
					window.history.pushState({
						page:pageName}, '', page.pageUrl + page.publicParams);
				}
			});
		} else {
			throw new Error("ajaxNavigate() : page passed in is not a key in pageMappings");
		}
	}

	return {

		addPage : function (pageName, options) {
			// options = { pageUrl : '', publicParams : '', hiddenParams : '' }

			checkTypes('addPage', 
				[pageName, options.pageUrl, options.publicParams, options.hiddenParams, options.pageHandler], 
				['string', 'string', 'string', 'string', 'function']);

			pages[pageName] = options;

		},

		addTransition : function (transitionName, contentNumber) {

			if (!isInt(contentNumber)) throw new Error("addTransition() : ");

			transitions[transitionName] = contentNumber;

		},

		navigate : function (pageName, transitionName, backButtonPress) {

			checkTypes('navigate', 
				[pageName, transitionName, backButtonPress, transitions[transitionName]], 
				['string', 'string', 'boolean', 'number']);

			$( '#ajaxContent_' + transitions[transitionName] ).fadeOut( 120, function() {
				ajaxNavigate(pageName, transitionName, backButtonPress);
			});

		}
	}
})();