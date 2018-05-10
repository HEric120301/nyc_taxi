function draw_circos() {
    var max_num_of_chord = 10;
    d3.json('data/chord_data.json', d=>{
        draw_chord(d);
    })



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

        var width = 650,
            height = 550,
            width2 = 30,
            height2 = 40,
            outerRadius = Math.min(width, height) * 0.5 - 40,
            innerRadius = outerRadius - 13,
            chord_svg = d3.select("#chord_graph").append('svg')
              .attr('width', width+width2)
              .attr('height', height+height2+60).append('g');
        
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
            .range(['white', '#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b']);

        
        var maxs = [],
            mins = [];
        for(i in data['matrix']) {
            maxs.push(d3.max(data['matrix'][i]));
            mins.push(d3.min(data['matrix'][i]));
        }
        var ext = [2*d3.min(mins), 2*d3.max(maxs)];

        var ribbon_color_l = d3.scaleLog()
            .domain(ext)
            .range([0.7, 0.2]);

        var g = chord_svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + (height / 2 + height2 + 40)+ ")")
            .datum(chord(matrix));
       
        var chord_tip = chord_svg.append('text').text('').attr('x', 10)
        .attr('y', 20).attr('class', 'tip')

        var group = g.append("g")
            .attr("class", "groups")
          .selectAll("g")
          .data(function(chords) { return chords.groups; })
          .enter().append("g");

        group.append("path")
            .style("fill", "#cbd5e8")
            .style("stroke", function(d) { return d3.rgb("#cbd5e8").darker(); })
            .attr("d", arc)
            .attr("id", d=>{ return "wavy"+d.index})
            .on("click", (d)=>{
                var start_zone = lookup_dict[data['row_ids'][d.index]].Zone;
                chord_tip.selectAll('tspan').remove()
                chord_tip.append('tspan').text("All traffic starting from "+start_zone+": "+d.value);
                fade(0.1, d)})
            .on("dblclick", (d)=>{ fade(1, d)})

        group.append('g')
            .attr("transform", d=> {
                if((d.startAngle + d.endAngle)/2>1.57 && (d.startAngle + d.endAngle)/2<4.71) {
                    return "rotate(" + ((d.endAngle) * 180 / Math.PI-90) + ") translate(" + (outerRadius*2 -innerRadius)  + ",0)"; 
                }
                else {
                    return "rotate(" + ((d.startAngle) * 180 / Math.PI-90) + ") translate(" + outerRadius + ",0)"; 
                }
            })

            .append('text')
            .text(d=>{
                return lookup_dict[row_ids[d.index]+1].Zone
                // return "sdssdss"
            })
            .style('fill', 'steelblue')
            .attr("transform", function(d) { 
                if((d.startAngle + d.endAngle)/2>1.57 && (d.startAngle + d.endAngle)/2<4.71) {
                    return "rotate(-90)"
                }
                else {
                    return "rotate(90)"; 
                }
            })

        g.append("g")
            .attr("class", "ribbons")
            .selectAll("path")
            .data(function(chords) { return chords; })
            .enter().append("path")
            .attr("d", ribbon)
            .style("fill", function(d) { 
                var sumvalue = d.source.value + d.target.value;
                return d3.hsl(152, 0.44, ribbon_color_l(sumvalue));
            })
            .style("stroke", function(d) { return d3.rgb(chord_color(d.target.index)).darker(); })
            .on('mouseover', d=>{ 
                var start_id = row_ids[d.source.index]+1,
                    end_id = row_ids[d.target.index]+1,
                    start_val = d.source.value,
                    end_val = d.target.value;

                var start_zone = lookup_dict[start_id].Zone,
                  end_zone = lookup_dict[end_id].Zone;

                chord_tip.selectAll('tspan').remove()
                chord_tip.append('tspan')
                    .text(formatSuffixDecimal(start_val)+" taxis started from "+start_zone+" and ended in "+end_zone)
                chord_tip.append('tspan')
                    .text(formatSuffixDecimal(end_val)+" taxis started from "+end_zone+" and ended in "+start_zone).attr('x', 10).attr('dy', '1.2em')


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