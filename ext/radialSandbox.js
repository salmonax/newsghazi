// TODO:
// 0. Get the radial lines drawn
// 1. Reorder the emotions on the pentagon so they make intuitive sense
// 2. Add animations for when the psychogram first draws
// 3. Figure out whether blending the colors makes any sense


var initJSON = { 
  anger: '0.00',
  disgust: '0.00',
  fear: '0.00',
  joy: '0.00',
  sadness: '0.00' };

var updateJSON = { 
  anger: '0.44',
  disgust: '0.52',
  fear: '0.12',
  joy: '0.21',
  sadness: '0.50' 
};

const EMOTION_COLORS = {
  anger: '#E80521',
  disgust: '#592684',
  fear: '#325E2B',
  joy: '#FFD629',
  sadness: '#086DB2'
};

// 44 52 12 21 50

renderRadialGraph(initJSON);
renderSentimentGraph(dummySentences);
getBlendedColor(updateJSON);

setTimeout(() => updateRadialGraph(updateJSON), 20);
setTimeout(() => updateRadialGraph(getSlopedEmotions(updateJSON, (i) => {
  return (-0.1*i+1)*1.4;
})), 500);

function getSlopedEmotions(docEmotions,weightEquation) {
  // Uses my default color-weighting equation if no function is passed
  weightEquation = (typeof weightEquation === 'function') ?
    weightEquation :
    i => -0.40*i+1.2;
  var emotionKeys = Object.keys(docEmotions);
  var emotionCount = docEmotions.length;

  var weights = emotionKeys.map(key => parseFloat(docEmotions[key]));
  var sortedTuples = weights
              .map((weight, i) => [emotionKeys[i], weight])
              .sort((a,b) => b[1] - a[1]);
  var slopedTuples = sortedTuples.map((tuple,i) => {
    tuple[1] = Math.min(Math.max(tuple[1]*weightEquation(i),0),1);
    return tuple;
  });

  return slopedTuples.reduce((obj, tuple) => {
    obj[tuple[0]] = tuple[1];
    return obj;
  },Object.assign({},docEmotions));
}

// This does a bit of bespoke magic and blends the colors together
// naively but semi-acceptably
function getBlendedColor(docEmotions) {
  var emotionKeys = Object.keys(docEmotions);
  docEmotions = getSlopedEmotions(docEmotions, i => -0.40*i+1.2);

  var emotionSum = emotionKeys.reduce((sum, emotion) => { 
    return sum += parseFloat(docEmotions[emotion]); 
  },0);

  emotionSum = Math.round(emotionSum*100)/100;
  var normWeights = emotionKeys.map(emotion => (emotionSum) ? Math.round(docEmotions[emotion]/emotionSum*100)/100 : 0);

  var blendedColor = emotionKeys.reduce((blendRGB, emotion, i) => {
    var weight = normWeights[i];
    var emotionRGB = d3.rgb(EMOTION_COLORS[emotion]);
    blendRGB.r += weight * emotionRGB.r
    blendRGB.g += weight * emotionRGB.g
    blendRGB.b += weight * emotionRGB.b
    return blendRGB;
  },d3.rgb(0,0,0));
  blendedColor.r = Math.round(blendedColor.r);
  blendedColor.g = Math.round(blendedColor.g);
  blendedColor.b = Math.round(blendedColor.b);
  return blendedColor;
}

function updateRadialGraph(docEmotions) {
  // Calculates top two colors and blends them by weight
  var keys = Object.keys(docEmotions);
  var weights = keys.map(key => parseFloat(docEmotions[key]));
  var perimeterPath = d3.select('.radial-values');
  var lineData = getPolyPoints(5,60,weights).perimeter;
  var lineFunction = d3.svg.line()
       .x(d => d.x)
       .y(d => d.y)
       .interpolate("linear");

  perimeterPath.transition()
    .attr("d", lineFunction(lineData))
    .attr('fill', getBlendedColor(docEmotions));
;
}

function renderRadialGraph(docEmotions) {
  var weights = Object.keys(docEmotions).map(key => parseFloat(docEmotions[key]));
  // console.log(weights);
  var emotions = Object.keys(docEmotions);
  var n = 5
  var polyData = getPolyPoints(5,60);
  var lineData = polyData.perimeter;
  lineData.forEach(function(point,i) {
    point.text = emotions[i];
  });
  // console.log(JSON.stringify(lineData));

  var svgContainer = d3.select('#pentagon').append('svg');

  var lineFunction = d3.svg.line()
       .x(function(d) { return d.x; })
       .y(function(d) { return d.y; })
       .interpolate("linear");

  svgContainer.append("path")
    .attr('class','radial-perimeter')
    .attr("d", lineFunction(lineData))
    .attr("stroke", "grey")
    .attr("fill","lightgrey");


  var weightedLineData = getPolyPoints(5,60,weights).perimeter;
  var svgContainer = d3.select('svg')
  svgContainer.append("path")
    .attr('class', 'radial-values')
    .attr("d", lineFunction(weightedLineData))
    .attr("stroke", "grey")
    .attr("fill","red");

  svgContainer.selectAll('.emotion-label')
    .data(lineData)
    .enter()
    .append('text')
    .attr('text-anchor', 'middle')
    .text(d => d.text)
    .attr('x', d => d.x)
    .attr('y', d => d.y)
    .attr('class','.emotion-label');

  d3.selectAll('.emotion-label')
    .each(d => {
      console.log(this);
    });

  var radialData = polyData.radials;
  svgContainer.selectAll('.emotion-radials')
    .data(radialData)
    .enter()
    .append('line')
    .attr('x1', d => d.x1)
    .attr('y1', d => d.y1)
    .attr('x2', d => d.x2)
    .attr('y2', d => d.y2)
    .attr('class', '.emotion-radials')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('opacity', 0.2);
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function getPolyPoints(n, radius, weights) {
  var center = { x: radius*1.4, y: radius*1.2 };
  var angle = 0;
  var delta = 360/n;
  var perimeter = [];
  var radials = [];
  var radians, x , y;
  var index;
  while (angle <= 360) {
    index = angle/delta % n;
    // console.log(index);
    radians = toRadians(angle+180);
    x = center.x + (weights ? weights[index]:1)*radius*Math.sin(radians);
    y = center.y + (weights ? weights[index]:1)*radius*Math.cos(radians);
    var point = {
      x: Math.round(x*100)/100,
      y: Math.round(y*100)/100
    };
    var radial = {
      x1: center.x,
      y1: center.y,
      x2: point.x,
      y2: point.y
    };
    radials.push(radial)
    perimeter.push(point);
    angle += delta;
  }
  return { perimeter, radials };
};

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

  var secondSvg = d3.select('#pentagon').append('svg')
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