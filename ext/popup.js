$(function() {
  
  var initEmotions = {
    'anger': '0.00',
    'disgust': '0.00',
    'fear': '0.00',
    'joy': '0.00',
    'sadness': '0.00'
  };

  $('.emotion.component').load('emotion.html', function() {
    updateEmotions(initEmotions);
    initRadialGraph(initEmotions);
  });

  function makeRandomEmotions() {
    return {
      'anger': Math.random().toFixed(2),
      'disgust': Math.random().toFixed(2),
      'fear': Math.random().toFixed(2),
      'joy': Math.random().toFixed(2),
      'sadness': Math.random().toFixed(2)
    }
  }

  function updateEmotions(emotions) {
    var values = Object.keys(emotions).map(key => 
      parseFloat(emotions[key]));

    $('.summary-emotion-graph--row').each(function(index) {
      var $this = $(this);
      var val = values[index];
      var barWidth = (val*100).toFixed(2)+'%';
      var labelValue = val.toFixed(2);
      var likelihood = (val > 0.5) ? 'LIKELY' : 'UNLIKELY';
      $this.find('.summary-emotion-graph--bar-value').css('width',barWidth);
      var labels = $this.find('.summary-emotion-graph--percentage-label').find('span');
      $(labels[0]).text(labelValue);
      $(labels[1]).text(likelihood);
    });
  }

  function updatePolitics(politics) {
    var libPercent = politics.Liberal + politics.Green;
    var conPercent = politics.Conservative;
    var randPercent = politics.Libertarian;

    applyTag(libPercent, 'Liberal');
    applyTag(conPercent, 'Conservative');
    applyTag(randPercent, 'Libertarian');
  }

  function applyTag(percent, tag){
    var text;

    if (percent >= .34 && percent < .5) {
      text = 'Maybe ' + tag;
    } else if (percent >= .5 && percent < .8) {
      text = 'Somewhat ' + tag;
    } else if (percent >= .8) {
      text = 'Strongly ' + tag;
    }

    if (text !== undefined) {
      $tag = $('<div></div>');
      $tag.text(text);
      $tag.addClass(tag, 'tag');
      $('.politicsDisplay').append($tag);
    }
  }

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
    var emotions = json.emotion ? 
      json.emotion.docEmotions :  
      makeRandomEmotions();
    updateEmotions(emotions);
    updateRadialGraph(emotions);

    var sentences = json.sentiment ?
      json.sentiment.sentences :
      dummySentences;

    renderSentimentGraph(sentences);

    console.log('politics', json.politics);
    updatePolitics(json.politics);

    if ((json.fake.rating.score + '') === '0') {
      rating = 'This page does not exist in our Fake News blacklist.';
    } else if ((json.fake.rating.score + '') === '100') {
      rating = 'WARNING: This page is hosted on a domain that has been blacklisted because of fake news.';
    } 
    $('.reliability.component').append(rating);
    $('.flesch.component').append(json.flesch);
    $
  }

  function failToPopulate(xhr, status, errorThrown) {
    alert('fail');
    console.log( 'Error: ' + errorThrown );
    console.log( 'Status: ' + status );
    console.dir(xhr);
  }

  function postToServer(msg) {
    return $.ajax({
      url: 'http://localhost:8000/api/ext',
      type: 'POST',
      data: msg.data,
      dataType: 'json'
    });
  };
  
});