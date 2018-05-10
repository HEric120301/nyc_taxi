var selection=d3.select("#piechart")
                .append("div")
                .style("margin","20px")
                .append("select")
                .attr("id","areas")

var areasname=["Newark Airport","Jamaica Bay","Alphabet City","Astoria","Battery Park City","Bay Ridge","Bayside","Bloomfield/Emerson Hill","Bloomingdale","Borough Park"]
for (var i=0;i<10;i++){
  selection.append("option")
          .attr("value",i)
          .text(areasname[i])
}

var svg=d3.select("#piechart")
      .append("svg")
      .attr('width',"960")
      .attr('height',"500")

var width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 2,
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal()
    .domain(["MON","TUE","WED","THU","FRI","SAT"])
    .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#e6ab02"]);

var div = d3.select("body").append("div").attr("class", "toolTip");


var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.sum; });

var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0);

var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);


d3.json("json_for_pie.json",function(data){
  var arc = g.selectAll(".arc")
    .data(pie(data.area26))
    .enter().append("g")
      .attr("class", "arc");

  arc.selectAll('path')
      .data((d)=>{ 
      
        var arr = [];
        for(var i=0; i<24; i++) {
          arr.push([d, d.data.hrs[i]/d3.max(d.data.hrs)]);
        }
        return arr;
      })
      .enter()
      .append("path")
      .attr("d", (d, i)=> { path.outerRadius(radius - 10*i).innerRadius(radius - 10*i-10); return path(d[0]); })
      .attr("fill", function(d) {return color(d[0].data.day); })
      .attr('opacity', d=>{ return d[1]})
      .on('mouseover',mouseover)
      .on('mouseout',mouseout);

  svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(20,20)");

  var legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
    // .shape(label)
    .shapePadding(10)
    //use cellFilter to hide the "e" cell
    .labels(data.area26.map(function(d){return d.day+" "+d.sum;}))
    .scale(color);

  svg.select(".legendOrdinal")
    .call(legendOrdinal);


  var selectarea=document.getElementById("areas")
  selectarea.onchange=function(){ //run some code when "onchange" event fires
    var indexofarea=this.options[this.selectedIndex] //this refers to "selectmenu"
    if (indexofarea.value==0){
      drawpie(data.area1); //open target site (based on option's value attr) in new window
    }
    else if (indexofarea.value==1){
      drawpie(data.area2);
    }
    else if (indexofarea.value==2){
      drawpie(data.area4);
    }
    else if (indexofarea.value==3){
      drawpie(data.area7);
    }
    else if (indexofarea.value==4){
      drawpie(data.area13);
    }
    else if (indexofarea.value==5){
      drawpie(data.area14);
    }
    else if (indexofarea.value==6){
      drawpie(data.area16);
    }
    else if (indexofarea.value==7){
      drawpie(data.area23);
    }
    else if (indexofarea.value==8){
      drawpie(data.area24);
    }
    else{
      drawpie(data.area26);
    }
  }
  

})



function mouseover(d,i){
    div.style("left", d3.event.pageX+10+"px");
    div.style("top", d3.event.pageY-25+"px");
    div.style("display", "inline-block");
    div.html((d[0].data.day)+" "+i+":00 "+(d[0].data.hrs[i]));
};

function mouseout(d){
    div.style('display',"none")
}

function resetLinks(id){
  d3.select("#area1").attr("checked","false");
  d3.select("#area2").attr("checked","false");
  d3.select("#area4").attr("checked","false");
  d3.select(id).attr("checked","true");
}


function drawpie(data){

  var delay = function (d, i) { return i * 50; };

  svg.selectAll(".arc").remove()
  
  var arc = svg.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
    .attr("class", "arc")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  arc.selectAll('path')
      .data((d)=>{ 
        
        var arr = [];
        for(var i=0; i<24; i++) {
          arr.push([d, d.data.hrs[i]/d3.max(d.data.hrs)]);
        }
        console.log(arr);
        return arr;
      })
      .enter()
      .append("path")
      .attr("d", (d, i)=> { path.outerRadius(radius - 10*i).innerRadius(radius - 10*i-10); return path(d[0]); })
      .attr("fill", function(d) {return color(d[0].data.day); })
      .attr('opacity', d=>{ return d[1]})
      .on('mouseover',mouseover)
      .on('mouseout',mouseout);

  svg.append("g")
    .attr("class", "legendOrdinal")
    .attr("transform", "translate(20,20)");

  var legendOrdinal = d3.legendColor()
    .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
    // .shape(label)
    .shapePadding(10)
    //use cellFilter to hide the "e" cell
    .labels(data.map(function(d){return d.day+" "+d.sum;}))
    .scale(color);

  svg.select(".legendOrdinal")
    .call(legendOrdinal);
}
