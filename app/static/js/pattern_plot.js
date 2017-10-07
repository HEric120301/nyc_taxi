function pattern_plot() {
    var count_each_zone = {},
        lookup_dict = {},
        num_of_patterns = 10,
        pattern_lookup = {},
        patterns = {};

    var width = 600,
        height = 500,
        centered;

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
        .attr('width', width)
        .attr('height', height);
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
        .attr('x', 140)
        .attr('y', 50)
        .text('jk')
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
          .call(color_legend_scale);
        // color_legend.selectAll('text').remove();


    // Load map data
    d3.json('data/name_id_lookDict.json', d=>{

        lookup_dict = d;
        console.log(lookup_dict)
        d3.json('data/nyc.geo.json', (error, mapData)=>{
            var features = mapData.features;
            $.ajax({
                type: 'POST',
                url: '/time_pattern',
                data: JSON.stringify({'num_of_patterns': num_of_patterns}),
                contentType: 'application/json;charset=UTF-8',
                success: function(data) {
                    console.log('Success!');
                    draw_map(features, data, drawlinchart);

                },
            });

            
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


    }

    var legendClick = function(d) {
        console.log(32);
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

        map_svg.select('#tip').text(dd=>{
            return dd.properties.zone;
        })
        .attr('x', dd=>{return d3.event.offsetX;})
        .attr('y', dd=>{return d3.event.offsetY;})

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
        var margin = {top: 20, right: 20, bottom: 110, left: 50},
            margin2 = {top: 430, right: 20, bottom: 30, left: 40},
            width = 820 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom,
            height2 = 500 - margin2.top - margin2.bottom;

        var line_svg = d3.select("#pattern_line_plot").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

        var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");

        var x = d3.scaleTime().range([0, width-margin.right]),
            x2 = d3.scaleTime().range([0, width-margin.right]),
            y = d3.scaleLinear().range([height, 0]),
            y2 = d3.scaleLinear().range([height2, 0]),
            x3 = d3.scaleTime().range([0, width-margin.right]),
            y3 = d3.scaleLinear().range([height, 0]);

        var xAxis = d3.axisBottom(x),
            xAxis2 = d3.axisBottom(x2),
            yAxis = d3.axisLeft(y),
            xAxis3 = d3.axisTop(x3),
            yAxis3 = d3.axisRight(y3);

        var focus = line_svg.append("g")
            .attr("class", "focus")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var context = line_svg.append("g")
            .attr("class", "context")
            .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

        context.append("rect")
            .attr("class", "grid-background")
            .attr("width", width)
            .attr("height", height);

        context.append('rect')
            .attr('class', 'align-pad')
            .attr('width', width)
            .attr('height', height2)
            .attr("transform", "translate(0," + height2 + ")")
            .attr('fill', 'lightblue')
            .on('click', align_brush)
    }

}
