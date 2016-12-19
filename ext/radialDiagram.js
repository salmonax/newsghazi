/*** Radial Graph Code ***/

function getSlopedEmotions(docEmotions,weightEquation) {
  // Uses default color-weighting equation if no function is passed
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
    // Make sure to clamp value to within 0 and 1:
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
  const EMOTION_COLORS = {
    anger: '#E80521',
    disgust: '#592684',
    fear: '#325E2B',
    joy: '#FFD629',
    sadness: '#086DB2'
  };

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

// This updates the graph after it has already been rendered
// With a basic animation
function updateRadialGraph(docEmotions) {
  // Aesthetically massage the graphical output a tiny amount
  docEmotions = getSlopedEmotions(docEmotions, i => (-0.04*i+1)*1.4);
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

// This initializes the graph, before any data has come in
function initRadialGraph(docEmotions) {
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

  var svgContainer = d3.select('#radial-graph')
  .append('svg')
  .attr({ width: 280, height: 130 });

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