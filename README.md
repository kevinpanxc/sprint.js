# SprintJS

Sprint is a simple JavaScript module that assists in developing websites for Ajax navigation. Sprint manipulates the browser history stack and keeps track of url parameters to keep the back and forward buttons functional. A demo of a website built using Sprint can be found [here](https://github.com/kevinpanxc/sprintjs-rails-demo).

## Getting Started

### API

Sprint provides a very simple API via the Sprint JavaScript object. The public functions of the object are:

* `addPage`
* `addTransition`
* `navigate`
* `getUserData`

### Adding Pages

Sprint needs to be aware of the website's pages. Sprint uses this information to run the right functions on page load for each page.

```js
Sprint.addPage('HOME',
	{ pageUrl : '/',
		pageHandler : function () { console.log('This is executed on HOME page load') } });

Sprint.addPage('MOVIEINFO',
	{ pageUrl : '/movieInfo',
		pageHandler : function () { console.log('This is executed on MOVIEINFO page load') }, 
		dataHandler : function () { console.log('This function will be explained later!') }});
```

The `pageUrl` property is the URL of the webpage relative to the root path of the site. Add page functions should only be run once on entry to the website.

### Adding transitions

Transitions tell Sprint which areas of the page to replace with new content from the server after a Sprint navigation.

```js
Sprint.addTransition('partialpageload', 2);
```

The second parameter to the `addTransition` function indicates which div's contents should be replaced. The div is identified by the id with format `ajaxContent_{#}` where `{#}` is an integar and the second parameter of the transition function. I'm going to call this ({#}) the **transition number**.

### Default transition

Sprint has a built-in default transition called `default` corresponding to the contents of this div:

```HTML
<div id="ajaxContent_1">
  ...
</div>
```

### Navigation

```js
Sprint.navigate('HOME', 'default',
					{ backButtonPress : false, 
						publicParams : 'test=urlparam1&page=2',
						hiddenParams : 'dontshowonpageurl=its-a-secret'});
```

The first parameter is the page name, the second parameter is the transition name, the third parameter is an options object. The options object specifies the public and hidden URL parameters for the request. It also specifies whether this request was launched from a browser back/forward button click.

THe page name parameter tells Sprint which page onload function to run. These onload functions should have been specified in the `addPage` functions.

### Public URL Parameters

Public URL parameters are shown in the URL of the page after an Ajax navigation.

### Hidden URL Parameters

Hidden URL parameters are not shown in the URL of the page after an Ajax navigation. Sprint has a default hidden parameter called `ajax` which is set to true for each page request sent through Sprint. Another default hidden parameter is called `partial` which is only present when the transition number is greater than 1. The value of the `partial` parameter is the value of the transition number.

### On the Server

The developer is responsible for using all the different URL parameters sent with each Sprint request to return the right data to the browser. 

For example, when a request is received with the URL parameter `ajax=true` and without the URL parameter `partial`, the response should include appropriate HTML to be placed under the `ajaxContent_1` div. If the response is received with the URL parameters `ajax=true&partial=2`, the response should include appropriate HTML to be placed under the `ajaxContent_2` div.

## Directly Loading Sprint Pages

On each load of a Sprint page without using the Sprint navigate function (i.e. typing the page's URL directly into the browser's URL bar), Sprint expects a div with classes `pageInfo` and `infoContainer` and with a data attribute `pagename` that contains the corresponding page's name. Sprint will remove the div and execute the page's onload JavaScript function.

## Custom Data from Server

You can send custom user data from the server to Sprint by passing a `dataHandler` function as a parameter to the `addPage` function. The `dataHandler` function should return the server information. Sprint calls this function and picks this information up in a private variable called `userData`. You can access this variable through the function `getUserData`.

## Basic Sprint HTML page structure

```HTML
<html>
  <head>
    ...
  </head>
  <body>
    <div id="ajaxContent_1">
      ...
        <div id="ajaxContent_2">
          ...
        </div>
      ...
    </div>
  </body>
</html>
```
