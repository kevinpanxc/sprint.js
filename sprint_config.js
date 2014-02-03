Sprint.addPage('testpagetwo',
	{ pageUrl : '/SprintJS/testpagetwoajax.html',
		publicParams : '',
		hiddenParams : '',
		pageHandler : testPageTwoHandler });

Sprint.addPage('testpageone',
	{ pageUrl : '/SprintJS/testpageoneajax.html',
		publicParams : '',
		hiddenParams : '',
		pageHandler : testPageOneHandler });

Sprint.addPage('testpagethree',
	{ pageUrl : '/SprintJS/testpagethreeajax.html',
		publicParams : '',
		hiddenParams : '',
		pageHandler : testPageThreeHandler });

Sprint.addPage('typetwo_testpagetwo',
	{ pageUrl : '/SprintJS/typetwo_testpagetwo.html',
		publicParams : '',
		hiddenParams : '',
		pageHandler : function () {}
	});

Sprint.addPage('typetwo_testpageone',
	{ pageUrl : '/SprintJS/typetwo_testpageone.html',
		publicParams : '',
		hiddenParams : '',
		pageHandler : function () {}
	});

Sprint.addTransition('typetwo', 2);

function testPageTwoHandler () {
	alert('test page two handler');
}

function testPageOneHandler() {
	alert('test page one handler');
}

function testPageThreeHandler() {
	alert('test page three handler');
}