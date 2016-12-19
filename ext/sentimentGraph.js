/*** Sentiment Graph Code ***/

function renderSentimentGraph(sentences) {
  var scores = sentences.map(sentence => 
    sentence.sentiment.score*sentence.sentiment.magnitude*50);

  var graphWidth = 335;
  var offsetX = 0;
  var offsetY = 40;

  var widthFactor = graphWidth/scores.length;

  var sentimentFunction = d3.svg.line()
    .x((d, i) => i*widthFactor)
    .y((d, i) => -d+offsetY)
    .interpolate('linear');

  var secondSvg = d3.select('.sentiment.component').append('svg')
    .attr({ width: graphWidth, height: 80 })
    .attr('class', 'sentiment-svg');

  secondSvg.append('path')
    .attr('d', sentimentFunction(scores))
    .attr('stroke', 'black')
    .attr('fill', 'none')
    .on('mouseover', () => {
      var x = d3.event.offsetX;
      var y = d3.event.offsetY;
      var index = Math.round(x/graphWidth*scores.length);
      console.log(sentences[index].text.content);
      d3.select('.emotion-graph-handle')
        .attr({
          cx: x,
          cy: y
        });
    });

  secondSvg.append('circle')
    .attr({
      cx: 3,
      cy: offsetY,
      r: 4,
      fill: 'blue',
      // visibility: 'hidden'
    })
    .attr('class','emotion-graph-handle');
}