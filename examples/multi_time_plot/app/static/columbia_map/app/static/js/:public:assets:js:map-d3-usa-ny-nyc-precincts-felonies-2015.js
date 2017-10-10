function resize(){
	width=parseInt(d3.select("#viz").style("width")),width=width-margin.left-margin.right,height=width*mapRatio,projection.translate([width/2,height/2]).center(nyc_center).scale(width*[mapRatio+mapRatioAdjuster]),svg.style("width",width+"px").style("height",height+"px"),svg.selectAll("path").attr("d",path)
}
function zoomed(){
	features.attr("transform","translate("+d3.event.translate+")scale("+d3.event.scale+")")
}

function ready(e,t,o){if(e)throw e;var a={},r={};
	o.forEach(function(e){a[e.PCT]=e.PCT,e.CRIME===totalFelonies&&(r[e.PCT]=e[felonyYear])}), 

	features.selectAll("path")
		.data(topojson.feature(t,t.objects.nyc_police_precincts).features)
		.enter()
		.append("path")
		.attr("d",path)
		.attr("fill",function(e){return color(r[e.properties.Precinct])})
		.on("mousemove",function(e){
			d3.select("#tooltip").style("top",d3.event.pageY+20+"px").style("left",d3.event.pageX+20+"px").select("#precinct-number-tooltip").text(e.properties.Precinct),d3.select("#felony-number-tooltip").text(function(){return formatComma(r[e.properties.Precinct])}),d3.select("#precinct-number").text(e.properties.Precinct),d3.select("#felony-number").text(function(){return formatComma(r[e.properties.Precinct])}),d3.select("#tooltip").classed("hidden",!1)})
		.on("mouseout",function(){d3.select("#tooltip").classed("hidden",!0)})
}

var margin={top:10,left:10,bottom:10,right:10},
	width=parseInt(d3.select("#viz").style("width")),
	width=width-margin.left-margin.right,mapRatio=.5,
	height=width*mapRatio,
	mapRatioAdjuster=50,
	nyc_center=[-74,40.7],
	formatComma=d3.format(","),
	color=d3.scale.threshold().domain([400,800,1200,1600,2e3,2400]).range(["#cd9a9a","#c18181","#b46767","#a84e4e","#9b3535","#8f1c1c","#830303"]),
	projection=d3.geo.mercator().center(nyc_center).translate([width/2,height/2]).scale(width*[mapRatio+mapRatioAdjuster]),
	zoom=d3.behavior.zoom().translate([0,0]).scale(1).scaleExtent([1,7]).on("zoom",zoomed);

d3.select(window).on("resize",resize);
var svg=d3.select("#viz").append("svg").attr("width",width).attr("height",height).call(zoom),path=d3.geo.path().projection(projection),
features=svg.append("g"),
totalFelonies="TOTAL SEVEN MAJOR FELONY OFFENSES",
felonyYear="2015";
queue().defer(d3.json,"/public/assets/js/json/nyc_police_precincts-topojson.json")
		.defer(d3.csv,"/public/assets/csv/crime/united-states/nyc-seven-major-felony-offenses-by-precinct-2000-2015.csv")
		.await(ready);