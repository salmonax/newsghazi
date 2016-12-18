$(function() {
  var mockJSON = {
    "anger": "0.639028",
    "disgust": "0.009711",
    "fear": "0.037295",
    "joy": "4e-05",
    "sadness": "0.002552"
  };
  var values = Object.keys(mockJSON).map(key => 
    parseFloat(mockJSON[key]));

  $('.emotion.component').load('emotion.html', initEmotions);

  function initEmotions() {
    $('.summary-emotion-graph--row').each(function(index) {
      var $this = $(this);
      var val = values[index];
      var barWidth = (val*100).toFixed(2)+'%';
      var labelValue = val.toFixed(2);
      var likelihood = (val > 0.5) ? "LIKELY" : "UNLIKELY";
      $this.find('.summary-emotion-graph--bar-value').css('width',barWidth);
      var labels = $this.find('.summary-emotion-graph--percentage-label').find('span');
      $(labels[0]).text(labelValue);
      $(labels[1]).text(likelihood);
    });
  }

});


// The following will open a connection with the active tab
// when the extension is open
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var portToBackground = chrome.tabs.connect(tabs[0].id, {name: "background"});
  chrome.commands.onCommand.addListener(function(command) {
    if(command === 'getUserSelectedText') {
      portToBackground.postMessage({method: "getUserSelectedText"});
    }
  });
});

chrome.runtime.onConnect.addListener(function(portToExtension) { 
  portToExtension.onMessage.addListener(handleMessage);
});

function handleMessage(msg) {
  console.log(msg);
  popupAction[msg.method](msg);
};

const popupAction = {
  getUserSelectedText: function(msg) {
    postToServer(msg).done(populatePanel).fail(failToPopulate);
  },
  getContentAndUrl: function(msg) {
    postToServer(msg).done(populatePanel).fail(failToPopulate);
  }
};


function populatePanel(json) {
  // Handle all panel population from the extension endpoint here
  // alert('succeed');
  // alert(JSON.stringify(json.sentiment));
  // console.log(json);

  // var scrape = $('p').toArray().length
  // alert(scrape);

  // var articleLength = json.articleLength;
  // var score = json.sentiment.score.toFixed(3);
  // var magnitude = json.sentiment.score.toFixed(3);
  // $('#status').append('<div> Words: '+articleLength+'</div>');
  // $('#status').append('<div> Pos/Neg: '+score+'</div>');
  // $('#status').append('<div> Magnitude: '+magnitude+'</div>');
  // var rating = '';
  // if ((json.fake.rating.score + '') === '0') {
  //   rating = 'This page does not exist in our Fake News blacklist.';
  // } else if ((json.fake.rating.score + '') === '100') {
  //   rating = 'WARNING: This page is hosted on a domain that has been blacklisted because of fake news.';
  // } else {
  //   rating = json.message;
  // }
  // $("<h1>").text(rating).appendTo('body');
}

function failToPopulate(xhr, status, errorThrown) {
  // alert('fail');
  console.log( "Error: " + errorThrown );
  console.log( "Status: " + status );
  console.dir(xhr);
}

function postToServer(data) {
  // alert(data);
  return $.ajax({
    url: 'http://localhost:8000/api/ext',
    type: 'POST',
    data: data,
    dataType: 'json'
  });
};

