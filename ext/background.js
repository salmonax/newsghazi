// The following waits for a connection from the 
// extension in order to make a reverse connection.

chrome.extension.onConnect.addListener(function(port){
  var reversePort = chrome.extension.connect({name: "newsgate"});
  port.onMessage.addListener(handleMessage);
  scrapeAndSend(reversePort);
});


function handleMessage(msg) {
  // Handle any message posted from the extension
  // alert(msg);
};

// Sends url and scraped text:
function scrapeAndSend(port) {
  var url = window.location.href;
  var scrapedText = $('p').toArray().map(item => item.innerText).join(' ').replace(/[\r\n]/g, '');
  port.postMessage({"scraped": scrapedText, "url": url});
};

//Content Scraper
const scrapeContent = function() {
  return $('p').toArray().map(p => p.innerText).join(' ');
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