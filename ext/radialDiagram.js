// TODO:
// 0. Get the radial lines drawn
// 1. Reorder the emotions on the pentagon so they make intuitive sense
// 2. Add animations for when the psychogram first draws
// 3. Figure out whether blending the colors makes any sense


var mockJSON = { anger: '0.79',
  disgust: '0.30',
  fear: '0.23',
  joy: '0.43',
  sadness: '0.85' };
var weights = Object.keys(mockJSON).map(key => parseFloat(mockJSON[key]));
// console.log(weights);
var emotions = Object.keys(mockJSON);
var polyData = getPolyPoints(5,60)
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
  .attr("d", lineFunction(lineData))
  .attr("stroke", "grey")
  .attr("fill","lightgrey");


var weightedLineData = getPolyPoints(5,60,20,weights).perimeter;
var svgContainer = d3.select('svg')
svgContainer.append("path")
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

console.log(JSON.stringify(radialData));


function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function getPolyPoints(n, radius, offset, weights) {
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
