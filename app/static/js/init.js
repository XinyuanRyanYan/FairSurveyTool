/**The global part of the project*/
let globalRatio = document.documentElement.clientWidth<900? document.documentElement.clientWidth/1440 : 1;

// the dimension for the fairness metric panel
let fairMetricDim = {
  margin: {left: 90*globalRatio, right: 20*globalRatio, top: 80*globalRatio, bottom: 30*globalRatio},
  wid: 310*globalRatio,
  itemHei: 35*globalRatio,    // the height of each fairness metric item
}
fairMetricDim.innerWid = fairMetricDim.wid - fairMetricDim.margin.left - fairMetricDim.margin.right;

let fairMetricInfo = {
  'SPD': {fullName: 'Statistical Parity Difference', range: [-1, 1], fair: 0},
  'DI': {fullName: 'Disparate Impact', range: [-0.5, 2.5], fair: 1},
  'EOD': {fullName: 'Equal Opportunity Difference', range: [-1, 1], fair: 0},
  'AOD': {fullName: 'Average Odds Difference', range: [-1, 1], fair: 0}
};


/**
 * visualize different kinds of fairness metrics 
 * @param {*} divSelector the fairness metric div
 * @param {*} metricName 
 * @param {*} metricData [{'original': 0.1}, {'mitigate': 0.2}...]
 */
function visFairMetricPanel(divSelector, metricName, metricData){
    // set the class
    divSelector.selectAll('*').remove();
    divSelector.style('height', null);
    divSelector.classed('fairMetricDiv', true);    // reset the name here
    // reset the height
    let barLen = 50*globalRatio;
    let heightTemp = globalRatio*230;
    divSelector.style('height', `${metricData.length==1? heightTemp-barLen:heightTemp}px`);

    divSelector.property('name', metricName);   // the name of this div selector

    // basic info
    let fairValue = fairMetricInfo[metricName].fair;
    let range = fairMetricInfo[metricName].range;
    let fontColor = '#213547';
    let gap = 10*globalRatio;       // the gap between two elements
    let baisAreaColor = '#EDEDED';          // '#FCF0F0'


    // init the div and the svg 
    // let margin_x = parseInt(divSelector.style("margin-left"));
    let margin_y = 10*globalRatio;
    let svg_width = parseInt(divSelector.style("width"));
    let svg_height = parseInt(divSelector.style("height"));
    let innerWid = svg_width - fairMetricDim.margin.left - fairMetricDim.margin.right;
    let itemHei = (svg_height - fairMetricDim.margin.top - fairMetricDim.margin.bottom)/metricData.length;
    // let barLen = itemHei;

    let divSvg = divSelector.append('svg')
        .attr('width', svg_width)
        .attr('height', svg_height);
    
    // visualization part
    let XScale = d3.scaleLinear()       // the scale for the metric value 
        .domain(fairMetricInfo[metricName].range)
        .range([fairMetricDim.margin.left, fairMetricDim.margin.left+innerWid]);

    // visualize the title
    divSvg.append('text').attr('x', svg_width/2).attr('y', 25*globalRatio)
        .attr('font-size', 15*Math.pow(globalRatio, 1/1.2))
        .attr('font-weight', 500)
        .attr('fill', fontColor)
        .attr('text-anchor', 'middle')
        .text(fairMetricInfo[metricName].fullName);
    
    // visualize the bais part
    divSvg.append('rect')
        .attr('x', XScale(range[0])).attr('y', fairMetricDim.margin.top)
        .attr('width', XScale(fairValue)-XScale(range[0])).attr('height', metricData.length*barLen)
        .attr('fill', baisAreaColor)
        .attr('fill-opacity', '0.5');

    // viusualize the axis
    let tickSize = 5*globalRatio;
    let xAxis = d3.axisBottom(XScale).ticks(5).tickSize(tickSize);
    let axisG = divSvg.append('g')
        .attr('transform', `translate(0, ${fairMetricDim.margin.top})`)
        .call(xAxis);
    axisG.selectAll('g').style('font-size', `${10*globalRatio}px`)  // change the size of text
    axisG.selectAll('line').attr('y2', -tickSize);      // reverse the ticks
    axisG.selectAll('text').attr('y', -15*globalRatio);         // change the y text
    axisG.select('path').remove();      // remove the previous one
    axisG.selectAll('line').attr('stroke', fontColor);
    axisG.selectAll('text').attr('fill', fontColor);
    axisG.append('line')
        .attr('x1', fairMetricDim.margin.left).attr('y1', 0)
        .attr('x2', fairMetricDim.margin.left+innerWid).attr('y2', 0)
        .attr('stroke', fontColor);

    // visualize the fair text & Line
    divSvg.append('text').attr('x', fairMetricDim.margin.left+innerWid/2).attr('y', 50*globalRatio)
        .attr('font-size', 12*globalRatio)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ED7D32')
        .attr('font-weight', 500)
        .text('Fair');
    divSvg.append('line')
        .attr('x1', XScale(fairValue)).attr('y1', (50+5)*globalRatio)
        .attr('x2', XScale(fairValue)).attr('y2', svg_height-fairMetricDim.margin.bottom)
        .attr('stroke-width', 2*globalRatio)
        .attr('stroke-dasharray', `${3*globalRatio} ${3*globalRatio}`) 
        .attr('stroke', '#ED7D32');

    // visualize each part
    divSvg.selectAll('metric').data(metricData).enter().append('g')
        .each(function(d, i){
            let yCenter = fairMetricDim.margin.top + barLen*i+barLen/2;
            let key = Object.keys(d)[0]

            let curColor = fontColor;
            if(i == metricData.length -1){
                curColor = '#5B9BD5';
            }

            // visualize the text
            d3.select(this).append('text')
                .attr('x', fairMetricDim.margin.left-gap/2).attr('y', yCenter)
                .attr('dy', '0.5em')
                .attr('text-anchor', 'end')
                .text(key)
                .attr('font-size', 12*globalRatio)
                .attr('font-weight', ()=>i == metricData.length-1 ? 600 : 'none')
                .attr('fill', curColor)
                .attr('stroke-width', 0)
                .classed('lastMetric',  i == metricData.length -1? true:false);

            // visualize separate line
            d3.select(this).append('line')
                .attr('x1', XScale(range[0])).attr('y1', yCenter+barLen/2)
                .attr('x2', XScale(range[1])).attr('y2', yCenter+barLen/2)
                .attr('stroke', 'grey')
                .attr('stroke-width', 0.2);
                
            // visualize the bars
            d3.select(this).append('line')
                .attr('x1', XScale(d[key])).attr('y1', yCenter-barLen/2+5*globalRatio)
                .attr('x2', XScale(d[key])).attr('y2', yCenter+barLen/2-5*globalRatio)
                .attr('stroke', curColor)
                .attr('stroke-width', `${3*globalRatio}px`)
                .classed('lastMetric',  i == metricData.length -1? true:false);

            // visualize the value
            d3.select(this).append('text')
                .attr('x', ()=>{
                    if(d[key]<fairValue && XScale(d[key])-XScale(fairValue)<30){
                        return  XScale(d[key])-5;
                    }
                    else{
                        return  XScale(d[key])+5;
                    }
                })
                .attr('y', yCenter)
                .attr('dy', '0.5em')
                .attr('text-anchor', ()=>{
                    if(d[key]<fairValue && XScale(d[key])-XScale(fairValue)<30){
                        return 'end';
                    }
                    else{
                        return  'start';
                    }
                })
                .text(d[key])
                .attr('fill', curColor)
                .attr('fill-opacity', 0.6)
                .attr('font-size', 10*Math.sqrt(globalRatio))
                .attr('stroke-width', 0)
                .classed('lastMetric',  i == metricData.length -1? true:false);

        });
    
    // visualize the bias square
    divSvg.append('rect')
        .attr('x', XScale(range[0])).attr('y', svg_height-2*margin_y-fairMetricDim.margin.bottom + 23*globalRatio)
        .attr('width', 15*globalRatio).attr('height', 15*globalRatio)
        .attr('fill', baisAreaColor);
    
    // text
    divSvg.append('text').attr('x', XScale(range[0])+20*globalRatio)
        .attr('y', svg_height-2*margin_y-fairMetricDim.margin.bottom + 23*globalRatio)
        .attr('font-size', 10*globalRatio)
        .attr('dy', '1em')
        .attr('text-anchor', 'start')
        .text('Bias against female')
        .attr('fill', fontColor);
}

