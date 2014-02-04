Sprint.addPage('testpagetwo',
	{ pageUrl : '/SprintJS/testpagetwoajax.html',
		pageHandler : testPageTwoHandler });

Sprint.addPage('testpageone',
	{ pageUrl : '/SprintJS/testpageoneajax.html',
		pageHandler : testPageOneHandler });

Sprint.addPage('testpagethree',
	{ pageUrl : '/SprintJS/testpagethreeajax.html',
		pageHandler : testPageThreeHandler });

Sprint.addPage('typetwo_testpagetwo',
	{ pageUrl : '/SprintJS/typetwo_testpagetwo.html',
		pageHandler : function () {}
	});

Sprint.addPage('typetwo_testpageone',
	{ pageUrl : '/SprintJS/typetwo_testpageone.html',
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