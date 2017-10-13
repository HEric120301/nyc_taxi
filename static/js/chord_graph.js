function draw_circos() {
    var max_num_of_chord = 10;
    $.ajax({
        type: 'POST',
        url: '/traffic',
        data: JSON.stringify({"max_length": max_num_of_chord}),
        contentType: 'application/json;charset=UTF-8',
        // cache: false,
        // processData: false,
        // async: false,
        success: function(data) {
            console.log('Success!');
            draw_chord(data);
        },
    });

    function draw_chord(data) {

        var matrix = data['matrix'],
          // mat_ids = data['mat_ids'],
          row_ids = data['row_ids'];

        matrix.forEach(d=>{
            var sum = 0
            d.forEach(ds=>{
              sum+=ds
            })
        })

        var width = 600,
            height = 600,
            width2 = 200
            outerRadius = Math.min(width, height) * 0.5 - 40,
            innerRadius = outerRadius - 13,
            chord_svg = d3.select("#chord_graph").append('svg')
              .attr('width', width+width2)
              .attr('height', height).append('g');
           

        var formatValue = d3.formatPrefix(",.0", 1e3);

        var chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);

        var arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var ribbon = d3.ribbon()
            .radius(innerRadius-5);

        var chord_color = d3.scaleOrdinal()
            .domain(d3.range(max_num_of_chord))
            .range(['#a50026','#d73027','#f46d43','#fdae61','#fee08b','#d9ef8b','#a6d96a','#66bd63','#1a9850','#006837']);



        //color legend
        var color_legend_scale = d3.legendColor()
          .labelFormat(d3.format(".0f"))
          .scale(chord_color)
          .shapePadding(3)
          .shapeWidth(40)
          .shapeHeight(15)
          .labelOffset(12);

        var color_legend = chord_svg.append('svg').append("g")
          .attr("transform", "translate(" + (width+20) + ", 60)")
          .call(color_legend_scale);
        color_legend.selectAll('text').remove()
        color_legend.append('line').attr('x1', 60).attr('y1', 0).attr('x2', 60).attr('y2', 200)
                  .style('stroke', 'steelblue').style('stroke-width', 4)
        color_legend.append('path').attr('d', "M 53 190 L 60 200 L 67 190 Z").attr('stroke', 'steelblue').attr('stroke-width', 5).attr('fill', 'steelblue')

        var min_max_value = getMinMax(matrix),
           legend_data = [{'x': 55, 'y': 0, 'val': min_max_value[0]}, {'x': 55, 'y': 220, 'val': min_max_value[1]}];
        color_legend.selectAll('text').data(legend_data)
            .enter()
            .append('text')
            .text(d=>{ return d.val})
            .attr('x', d=>{ return d.x})
            .attr('y', d=>{ return d.y})

        var g = chord_svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
            .datum(chord(matrix));
       
        var chord_tip = chord_svg.append('text').text('').attr('x', 10)
        .attr('y', 20).attr('class', 'tip')

        var group = g.append("g")
            .attr("class", "groups")
          .selectAll("g")
          .data(function(chords) { return chords.groups; })
          .enter().append("g");

        group.append("path")
            .style("fill", function(d) { return chord_color(d.index); })
            .style("stroke", function(d) { return d3.rgb(chord_color(d.index)).darker(); })
            .attr("d", arc)
            .on("mouseover", (d)=>{ })
            // .on("mouseout", (d)=> { fade(1, d)})
            .on("click", (d)=>{ fade(0.1, d)})
            .on("dblclick", (d)=>{ fade(1, d)})

        group.append('g')
            .attr("transform", function(d) { return "rotate(" + ((d.startAngle) * 180 / Math.PI-90) + ") translate(" + outerRadius + ",0)"; })

            .append('text')
            .text(d=>{
                return lookup_dict[row_ids[d.index]+1].Zone
                // return "sdssdss"
            })
            .style('fill', 'steelblue')
            .attr("transform", function(d) { return "rotate(90)"; })

        g.append("g")
            .attr("class", "ribbons")
          .selectAll("path")
          .data(function(chords) { return chords; })
          .enter().append("path")
            .attr("d", ribbon)
            .style("fill", function(d) { return chord_color(d.target.index); })
            .style("stroke", function(d) { return d3.rgb(chord_color(d.target.index)).darker(); })
            .on('mouseover', d=>{ 
                var start_id = row_ids[d.source.index]+1,
                    end_id = row_ids[d.target.index]+1,
                    start_val = d.source.value,
                    end_val = d.target.value;

                var start_zone = lookup_dict[start_id].Zone,
                  end_zone = lookup_dict[end_id].Zone;

                chord_tip.selectAll('tspan').remove()
                chord_tip.append('tspan').text(start_zone+": "+start_val)
                chord_tip.append('tspan').text(end_zone+": "+end_val).attr('x', 10).attr('dy', '1.2em')


                chord_svg.selectAll("g.ribbons path")
                    .filter(function(dd) {
                        return dd.source.index != d.source.index || dd.target.index != d.target.index;
                    })
                    .transition()
                    .style("opacity", 0.1);
            })
            .on('mouseout', d=>{
                chord_svg.selectAll("g.ribbons path")
                    .transition()
                    .style("opacity", 1);
            })

        // Returns an array of tick angles and values for a given group and step.
        function groupTicks(d, step) {
          var k = (d.endAngle - d.startAngle) / d.value;
          return d3.range(0, d.value, step).map(function(value) {
            return {value: value, angle: value * k + d.startAngle};
          });
        }

        function fade(opacity, d) {
            var i = d.index
            chord_svg.selectAll("g.ribbons path")
                .transition()
                .style("opacity", 1);

            chord_svg.selectAll("g.groups path")
                .transition()
                .style("opacity", 1);

            chord_svg.selectAll("g.ribbons path")
                .filter(function(d) {
                    return d.source.index != i && d.target.index != i;
                })
                .transition()
                .style("opacity", opacity);

            chord_svg.selectAll("g.groups path")
                .filter(function(d) {
                    return d.index != i;
                })
                .transition()
                .style("opacity", opacity);
        }

        function getMinMax(matrix) {
            var max_arr = [], min_arr = []
            matrix.forEach(d=>{
                max_arr.push(d3.max(d))
                min_arr.push(d3.min(d))
            })
            return [d3.min(min_arr),d3.max(max_arr)]
        }

    }
}