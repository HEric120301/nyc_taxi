function pattern_plot() {
    var count_each_zone = {},
        lookup_dict = {},
        num_of_patterns = 10,
        pattern_lookup = {},
        patterns = {};

    var draw_all_lines = function(){};
    var pattern_fetched = false;
    var all_pattern_data = [];
    var pattern_drawn = {};
    for(var i=0; i<10; i++){
        pattern_drawn[i.toString()] = false;
    }

    var width = 600,
        height = 500,
        width2 = 800;

    var mouse_in_plot = false,
        pattern_chosed = [];

    // Define color scale
    var color = d3.scaleOrdinal()
        .domain(d3.range(num_of_patterns))
        .range(['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5',
                     '#80cdc1', '#35978f', '#01665e', '#003c30']);

    var projection = d3.geoMercator()
        .scale(40000)
        // Center the Map in Colombia
        .center([-74, 40.7])
        .translate([width / 2, height / 2]);
    var path = d3.geoPath()
        .projection(projection);

    // Set svg width & height
    var svg = d3.select('#time_pattern').append('svg')
        .attr('width', width+width2)
        .attr('height', height)
        .append('g');
    // Add background
    svg.append('rect')
        .attr('class', 'background')
        .attr('width', width)
        .attr('height', height)
        .on('click', clicked);
    var map_svg = svg
        // .call(d3.zoom().on("zoom", function () {
        //   map_svg.attr("transform", d3.event.transform)
        // }))
        .append('g')
    g = map_svg.append('g')
    var mapLayer = g.append('g')
        .classed('map-layer', true);

    //add tip text
    var tip = svg.append('text')
        .attr('x', 170)
        .attr('y', 90)
        .text('')
        .attr('id', 'tip')
        .attr('class', 'tip')

    //legend
    var color_legend_scale = d3.legendColor()
          .labelFormat(d3.format(".0f"))
          .scale(color)
          .shapePadding(1)
          .shapeWidth(25)
          .shapeHeight(10)
          .labelOffset(4);

    var color_legend = svg.append('svg').append("g")
      .attr("transform", "translate(" + (40) + ", 60)")
      .call(color_legend_scale)
    // color_legend.selectAll('text').remove();


    // Load map data
    d3.json('data/name_id_lookDict.json', d=>{

        lookup_dict = d;
        d3.json('data/nyc.geo.json', (error, mapData)=>{
            var features = mapData.features;

            d3.json('data/time_of_zones.json', data=>{
                all_pattern_data = data['time_series_all_pattern'];
                draw_map(features, data, drawlinchart);
                pattern_fetched = true;
            })
        });

    });

    var draw_map = function(features, data, drawlinchart) {
        
        pattern_lookup = data['pattern_lookup']
        patterns = data['patterns']
        // Draw each zone as a path
        mapLayer.selectAll('path').remove()
        mapLayer.selectAll('path').data(features)
            .enter().append('path')
            .attr('d', path)
            .attr('vector-effect', 'non-scaling-stroke')
            .style('fill', d=>{ return color(pattern_lookup[lookup_dict[d.properties.zone]['ID']])})
            .on('mouseover', mouseover)
            .on('mouseout', mouseout)
            // .on('click', clicked)

        //update legend text
        color_legend.selectAll('text').text((d, i)=>{
            return patterns[i].length + " zones";
        })
        color_legend.selectAll('rect')
            .on('click', legendClick)
            .call(d3.drag()
            .on("start", legend_dragstarted)
            .on("drag", legend_dragged)
            .on("end", legend_dragended))
            .on('mouseover', d=>{});
        
        drawlinchart();

    }

    var legend_dragstarted = function() {
        // dragging = true
    }
    var legend_dragged = function() {
        
    }
    var legend_dragended = function(d) {
        if(mouse_in_plot) {
            // var time_ticks = line_data['time_ticks'],
            //     centers = line_data['centers'];

            // var values = centers[d];
            // var arr = []
            // for(var i=0; i<time_ticks.length; i++) {
            //     var ts = time_ticks[i],
            //         val = values[i];

            // }
            if(pattern_fetched) {
                pattern_drawn[d] = true;
                // draw_all_lines(all_pattern_data);
                d3.select('#lines').selectAll('.city').style('visibility', 'hidden')
                d3.select('#lines').select('#pattern'+d).style('visibility', 'visible')
            }
            
        }
        // dragging = false
    }

    var legendClick = function(d) {
    }

    var mouseover = function(d) {
        var pattern_id = pattern_lookup[lookup_dict[d.properties.zone]['ID']]
        mapLayer.selectAll('path')
            .filter(dd=>{
                return pattern_lookup[lookup_dict[dd.properties.zone]['ID']] == pattern_id;
            })
            .classed('highlight', true)
        color_legend.selectAll('rect')
            .filter((d, i)=> { return pattern_id == i; })
            .classed('highlight', true)

        svg.select('#tip').text(d.properties.zone)
            // .attr('x', d3.event.offsetX)
            // .attr('y', d3.event.offsetY)

    }
    var mouseout = function(d) {
        var pattern_id = pattern_lookup[lookup_dict[d.properties.zone]['ID']]
        mapLayer.selectAll('path')
            .filter(dd=>{
                return pattern_lookup[lookup_dict[dd.properties.zone]['ID']] == pattern_id;
            })
            .classed('highlight', false)
        color_legend.selectAll('rect')
            .filter((d, i)=> { return pattern_id == i; })
            .classed('highlight', false)

    }

    var drawlinchart = function() {

        var margin = {top: 0, right: 120, bottom: 30, left: 50},
            g = svg.append('g').attr("transform", "translate(" + (width) + ", 0)");
        
        //background, attach mouseenter event to determin whether any pattern is dragged
        var background = g.append('rect').attr('width', width2).attr('height', height).style('fill', "gray").style('opacity', 0.2)
            .on('mouseenter', (d)=>{ mouse_in_plot = true;})
            .on('mouseout', d=>{ mouse_in_plot = false;})

        var line_svg = g.append('svg').attr('width', width2).attr('height', height).attr('id', 'lines');

        var parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");

        var x = d3.scaleTime().range([margin.left, width2-margin.right]),
            y = d3.scaleLinear().range([height-margin.bottom, 0]),
            z = d3.scaleOrdinal(d3.schemeCategory10);

        var line = d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.temperature); });


        draw_all_lines = function(data) {
          var cities = d3.range(num_of_patterns).map(function(id) {
            return {
              id: id.toString(),
              values: data.map(function(d) {
                return {date: parseTime(d.date), temperature: d[id]};
              })
            };
          });

          // console.log(data)
          // var cities = d3.range(10).map(i=>{
          //   return i.toString()
          // })

          x.domain(d3.extent(data, function(d) { return parseTime(d.date); }));

          y.domain([
            d3.min(cities, function(c) { return d3.min(c.values, function(d) { return d.temperature; }); }),
            d3.max(cities, function(c) { return d3.max(c.values, function(d) { return d.temperature; }); })
          ]);

          z.domain(cities.map(function(c) { return c.id; }));

          line_svg.append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate(0," + (height-margin.bottom) + ")")
              .call(d3.axisBottom(x));

          line_svg.append("g")
              .attr("class", "axis axis--y")
              .call(d3.axisLeft(y))
              .attr("transform", "translate(" + margin.left + ", 0)")
            .append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 6)
              .attr("dy", "0.71em")
              .attr("fill", "#000")
              .text("time consumed");

          var city = line_svg.selectAll(".city")
            .data(cities)
            .enter().append("g")
              .attr("class", "city")
              .attr('id', d=>{
                  return 'pattern'+d.id;
              });

          city.append("path")
              .attr("class", "line")
              .attr("d", function(d) { return line(d.values); })
              .style("stroke", function(d) { return z(d.id); });

          city.append("text")
              .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
              .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
              .attr("x", 3)
              .attr("dy", "0.35em")
              .style("font", "10px sans-serif")
              .text(function(d) { return d.id; });
        }

        draw_all_lines(all_pattern_data);


        function type(d, _, columns) {
          d.date = parseTime(d.date);
          for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
          return d;
        }

    }
}