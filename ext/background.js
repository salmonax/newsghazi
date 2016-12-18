
// The following waits for a connection from the 
// extension in order to make a reverse connection. 

chrome.runtime.onConnect.addListener(function(portToBackground) {
  var portToExtension = chrome.runtime.connect({name:"newsgate"});
  portToExtension.postMessage({"method":'getContentAndUrl', "data": actions.getContentAndUrl()});
  portToBackground.onMessage.addListener(function(message) {
    portToExtension.postMessage({"method": message.method, "data": actions[message.method]()});
  });
});

function handleMessage(msg, port) {
  var data = actions[msg.method]();
  port.postMessage({"method":msg.method, "data": data});
};

//add extension -- background.js communication methods here:
const actions = {
  getContentAndUrl: function(){
    return { scraped: $('p').toArray().map(item => item.innerText).join(' ').replace(/[\r\n]/g, ''), 
              url: window.location.href };
  },
  getUserSelectedText: function() {
    return window.getSelection().toString();
  },
  getUrl: function() {
    return window.location.href;
  },
  scrapePlain: function(){
    return $('p').toArray().map(p => p.innerText).join(' ');
  },
  highlight: function(mode) {

  }
};


// Sends url and scraped text:
function scrapeAndSend(port) {
  var url = window.location.href;
  var scrapedText = $('p').toArray().map(item => item.innerText).join(' ').replace(/[\r\n]/g, '');
  port.postMessage({"scraped": scrapedText, "url": url});
};



//returns an array of regex testeres to test against 
var regexConstructor = function(mode){
  const quantifiers = '(\\d+|a|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)';
  const binders = '(-| |)'; //dash, empty or none
  const multipliers = '(m|b|thousand|hundred|dozen|fold|times|x|X|percent|%)';
  const significant = '\\d+[.|,]\\d+';
  const numbers = '\\d+';
  const quotations = '"';
  const repetition = '(double|triple|quadruple)';
  const frequency = '(once|twice|thrice)+(?= a|-)';

  if (mode === 'business') {
    var r1 = new RegExp( quantifiers +'(?=' + binders + multipliers  + ')', 'g');
    var r2 = new RegExp(significant, 'g');
    var r3 = new RegExp(repetition);
    var r4 = new RegExp(frequency);
    return [r1, r2, r3, r4];
  } else if (mode === 'numbers') {
    return [new RegExp(numbers)];
  } else if (mode === 'quotations') {
    return [new RegExp(quotations)];
  }
};

//Assumptions:
//1 - all the content is in paragraphs
//2 - paragraph elements have no incomplete sentences (a sentence can not be in two paragrahs)

//interface: string | regex, string, string
//Ex: first argument could be /\d+/ for testing numbers. 

//parerga: textContent or innerText ? 

const styleStringInContent = function(str, cssProperty, cssValue) {
  const beginMarker = '~';
  const endMarker ='`';

  //mark text and inject html tags:
  const markerFunction = function(tag, str, startIndex) {   
    tag.textContent = tag.textContent.slice(0,startIndex) +
    beginMarker + str + endMarker + tag.textContent.slice(startIndex + str.length);
  };

  //process the content:
  $('p').toArray().forEach((paragraph, i) => {
    // if(i === 5) {debugger;}
    var text = paragraph.textContent;    
    if(typeof str ==='string') {
      var startIndex = text.indexOf(str);
      if(startIndex !== -1) {
        markerFunction(paragraph, str, startIndex);
      }
    } else {
      var facts = text.split('.').filter(sentence => str.test(sentence));
      facts.forEach(fact => markerFunction(paragraph, fact, paragraph.textContent.indexOf(fact)));
    }
    //inject html to the paragraph:
    var htmlElementToInjectBegin = '<span class="highlightItem">';
    var htmlElementToInjectEnd = '</span>';
    paragraph.innerHTML = paragraph.innerHTML.replace(/~/gi, htmlElementToInjectBegin);
    paragraph.innerHTML = paragraph.innerHTML.replace(/`/gi, htmlElementToInjectEnd); 
  });
  $('.highlightItem').css(cssProperty,cssValue);
};
