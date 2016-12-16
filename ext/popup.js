$(function() {
  $('.emotion.component').load('_emotion.html');
});


// The following will open a connection with the active tab
// when the extension is open
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.connect(tabs[0].id, {name: "background"});
});

chrome.extension.onConnect.addListener(function(reversePort){
  reversePort.onMessage.addListener(handleMessage);
});

function handleMessage(msg) {
  // Handle any message posted from the background tab
  if (msg.scraped && msg.url) {
    postTextAndUrl(msg)
    .done(populatePanel)
    .fail(failToPopulate);
  }
}

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
  alert('fail');
  console.log( "Error: " + errorThrown );
  console.log( "Status: " + status );
  console.log()
  console.dir(xhr);
}

function postTextAndUrl(data) {
  // alert(data);
  return $.ajax({
    url: 'http://localhost:8000/api/ext',
    type: 'POST',
    data: data,
    dataType: 'json'
  });
};

