function draw_pie() {

    var selection=d3.select("#areas");
                    // .append("div")
                    // .style("margin-left","280px")
                    // .text("Choose one zone: ")
                    // .append("select")
                    // .attr("id","areas");

    var areasname=["Midtown Center","Upper East Side South","Upper East Side North","Midtown East","Penn Station/Madison Sq West","Union Sq","Times Sq/Theatre District","Murray Hill","Clinton East","Lincoln Square East"]
    for (var i=0;i<10;i++){
      selection.append("option")
              .attr("value",i)
              .text(areasname[i])
    }

    var format = d3.format(",.5r");

    var svg=d3.select("#piechart")
          .append("svg")
          .attr('width',"640")
          .attr('height',"600")

    var width = 680,
        height = 500,
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + (width / 2 ) + ",300)");

    var color = d3.scaleOrdinal()
        .domain(["MON","TUE","WED","THU","FRI","SAT"])
        .range(["#e41a1c", "#d95f0e", "#e6ab02", "#4daf4a", "#377eb8", "#984ea3", "#fa9fb5"]);

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

    // var time=d3.scaleLinear().domian([0,23]).range([0,radius]);

    // var axis=d3.axisBottom(time);

    // svg.append("g")
    //     .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    //     .attr("class", "axis axis--x3")
    //     .call(axis);


    d3.json("data/json_for_pie.json",function(data){
      var arc = g.selectAll(".arc")
        .data(pie(data.area161))
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
          .attr("fill", "#377eb8")
          .attr('opacity', d=>{ return d[1]})
          .attr("id",function(d,i) {return d[0].data.day+i; })
          // .on('clicked',addLines)
          .on('mouseover',mouseover)
          .on('mouseout',mouseout);


      for (var i=0;i<7;i++){
        // labeltip.push(data.area161[i].day+"  "+data.area161[i].sum);
        console.log(data.area161[i].day+"  "+data.area161[i].sum);
        // p=document.getElementById(data.area161[i].day+"0");
        textPath_data=document.getElementById(data.area161[i].day+"0").getAttribute('d');
        // console.log(p)

        g.append('defs')
        .append('path')
        .attr("d",textPath_data)
        .attr("id",'TextPath'+i)
        .attr("class","defs")
        g.append('text')
          .append('textPath')
          .text(data.area161[i].day+": "+formatSuffixDecimal(data.area161[i].sum)+" trips")
          .attr("startOffset",'10%')
          .attr('xlink:href','#TextPath'+i)
          .attr("class","curvedText")
          // .text(data.area161[i].day+"  "+data.area161[i].sum);
      }

      

      // svg.append("g")
      //   .attr("class", "legendOrdinal")
      //   .attr("transform", "translate(560,30)");

      // var legendOrdinal = d3.legendColor()
      //   .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
      //   // .shape(label)
      //   .shapePadding(10)
      //   //use cellFilter to hide the "e" cell
      //   .labels(data.area161.map(function(d){return d.day+" "+format(d.sum);}))
      //   .scale(color);

      // svg.select(".legendOrdinal")
      //   .call(legendOrdinal);


      var selectarea=document.getElementById("areas")
      selectarea.onchange=function(){ //run some code when "onchange" event fires
        var indexofarea=this.options[this.selectedIndex] //this refers to "selectmenu"
        if (indexofarea.value==0){
          drawpie(data.area161); //open target site (based on option's value attr) in new window
        }
        else if (indexofarea.value==1){
          drawpie(data.area237);
        }
        else if (indexofarea.value==2){
          drawpie(data.area236);
        }
        else if (indexofarea.value==3){
          drawpie(data.area162);
        }
        else if (indexofarea.value==4){
          drawpie(data.area186);
        }
        else if (indexofarea.value==5){
          drawpie(data.area234);
        }
        else if (indexofarea.value==6){
          drawpie(data.area230);
        }
        else if (indexofarea.value==7){
          drawpie(data.area170);
        }
        else if (indexofarea.value==8){
          drawpie(data.area48);
        }
        else{
          drawpie(data.area142);
        }
      }
      

    })

    function addLines(d){
      var day=d[0].data.day;
      svg1=d3.select("svg.linechart")
    }



    function mouseover(d,i){
        div.style("left", d3.event.pageX+10+"px");
        div.style("top", d3.event.pageY-25+"px");
        div.style("display", "inline-block");
        div.html(i+":00 #"+(formatSuffixDecimal(d[0].data.hrs[i])));
    };

    function mouseout(d){
        div.style('display',"none")
    }

    // function resetLinks(id){
    //   d3.select("#area1").attr("checked","false");
    //   d3.select("#area2").attr("checked","false");
    //   d3.select("#area4").attr("checked","false");
    //   d3.select(id).attr("checked","true");
    // }


    function drawpie(data){

      var delay = function (d, i) { return i * 50; };

      svg.selectAll(".arc").remove()
      svg.selectAll(".defs").remove()
      svg.selectAll(".curvedText").remove()
      
      var arc = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + (width / 2 ) + ",300)");

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
          .attr("fill", "#377eb8")
          .attr('opacity', d=>{ return d[1]})
          .attr("id",function(d,i) {return d[0].data.day+i; })
          .on('mouseover',mouseover)
          .on('mouseout',mouseout);

      for (var i=0;i<7;i++){
        // labeltip.push(data.area161[i].day+"  "+data.area161[i].sum);
        // console.log(data[i].day+"  "+data[i].sum);
        // p=document.getElementById(data.area161[i].day+"0");
        textPath_data=document.getElementById(data[i].day+"0").getAttribute('d');
        // console.log(p)

        g.append('defs')
        .append('path')
        .attr("d",textPath_data)
        .attr("id",'TextPath'+i)
        .attr("class","defs")
        g.append('text')
          .append('textPath')
          .text(data[i].day+": "+formatSuffixDecimal(data[i].sum)+" trips")
          .attr("startOffset",'4%')
          .attr('xlink:href','#TextPath'+i)
          .attr("class","curvedText")
          // .text(data.area161[i].day+"  "+data.area161[i].sum);
      }

      // svg.append("g")
      //   .attr("class", "legendOrdinal")
      //   .attr("transform", "translate(560,30)");


      // var legendOrdinal = d3.legendColor()
      //   .shape("path", d3.symbol().type(d3.symbolTriangle).size(150)())
      //   // .shape(label)
      //   .shapePadding(10)
      //   //use cellFilter to hide the "e" cell
      //   .labels(data.map(function(d){return d.day+" "+format(d.sum);}))
      //   .scale(color);

      // svg.select(".legendOrdinal")
      //   .call(legendOrdinal);
    }

}

