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

  secondSvg.append('line')
    .attr({
      x1: 0,
      y1: offsetY,
      x2: graphWidth,
      y2: offsetY
    })
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('opacity', 0.5)
    .style('stroke-dasharray',('1,1'));

  var path = secondSvg.append('path')
    .attr('d', sentimentFunction(scores))
    .attr('stroke', 'black')
    .attr('fill', 'none')
    .attr('pointer-events', 'none');

  pathEl = path.node();
  pathLength = pathEl.getTotalLength();

  var lastNewIndex = 0;
  secondSvg.on('mousemove', () => {
    var x = d3.event.offsetX;
    var beginning = x, end = pathLength, target;
    var index = Math.min(Math.round(x/graphWidth*scores.length),scores.length-1);
    if (index !== lastNewIndex) {
      lastNewIndex = index;
      // Put events that only fire on index change here
      // console.log(sentences[index].text.content);
      // console.log(x);
    }
    while (true) {
      target = Math.floor((beginning + end) / 2);
      pos = pathEl.getPointAtLength(target);
      if ((target === end || target === beginning) && pos.x !== x) {
          break;
      }
      if (pos.x > x)      end = target;
      else if (pos.x < x) beginning = target;
      else                break; //position found
    }
    d3.select('.emotion-graph-handle')
      .attr({
        cx: x,
        cy: pos.y
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
    .attr('class','emotion-graph-handle')
    .attr('pointer-events', 'none');
}