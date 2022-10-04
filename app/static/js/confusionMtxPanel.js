// the dimension of the confusion matrix div
let CMDim = {       // dimension for the confusion matrix div
    margin: {left: 30, right: 10, top: 35, bottom: 10},
    width: 180,
    height: 140
}
CMDim.wrapperWid = CMDim.width + CMDim.margin.left + CMDim.margin.right;
CMDim.wrapperHei = CMDim.height + CMDim.margin.top + CMDim.margin.bottom;

let outputLabel = ['Approve', 'Deny'];
let attrVs = ['Male', 'Female'];

/**
 * visualize the confusion matrix inside the divSelector
 * @param {*} divSelector 
 * @param {*} idx visualize which confusion matrix we should use  either 1 or 0
 */
 function visConfusionMatrixPanel(divSelector, confusionMatrixData, idx, interactive = false, FairMetricsPanelObj){
    // clear the existing elements
    divSelector.selectAll('*').remove();
    divSelector.classed('CF', true);

    // the dataset we use 
    let CFData = confusionMatrixData[idx];
    CFData = {'TP': CFData[0][0], 'FN': CFData[0][1], 'FP': CFData[1][0], 'TN': CFData[1][1]}

    let div_width = parseInt(divSelector.style("width"));
    let div_height = parseInt(divSelector.style("height"));
    if(divSelector.attr("id")){
        let divSelector_dom = document.getElementById(divSelector.attr("id"));
        div_width = divSelector_dom.clientWidth;
        div_height = divSelector_dom.clientHeight;
    }

    let margin = 10;
    let text_width = 10 + 14 + margin; // text and bigText width
    let plotTitle_height = 10 + margin;
    let svg_width = div_width - margin;
    let svg_height = div_height - plotTitle_height;
    let divSvg = divSelector.append('svg').attr('width', svg_width).attr('height', svg_height);

    //-----------------------------------------------------------------------------
    // visualize the content

    let rectWid = (svg_width - text_width - margin)/2;
    let rectHei = (svg_height - text_width - margin)/2; // text + bigText + plottitle

    CMDim.width = rectWid * 2;
    CMDim.height = rectHei * 2;

    let CFGroup = divSvg.append('g');
    
    // visualize the four rects
    let visRect = (GSelector, x, y, className)=>{
        GSelector.append('rect')
            .attr('x', x).attr('y', y)
            .attr('width', rectWid).attr('height', rectHei)
            .classed(className, true)
            .attr('fill', '#5B9BD5')
            .style('opacity', opacityScale(CFData[className]))
            .attr('stroke', 'white')
            .attr('stroke-width', '2.6px');
            
        // append the number text if not interactive
        if(interactive){return;}
        GSelector.append('text')
            .attr('x', x+rectWid/2)
            .attr('y', y+rectHei/2)
            .attr('font-size', '12px')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.5em')
            .text(CFData[className])
            .attr('cursor', 'default');
    }
    let rectGroups = CFGroup.append('g').classed('rects', true);
    visRect(rectGroups, 0, 0, 'TP');
    visRect(rectGroups, rectWid, 0, 'FN');
    visRect(rectGroups, 0, rectHei, 'FP');
    visRect(rectGroups, rectWid, rectHei, 'TN');
    CFGroup.style('transform', `translate(${text_width + margin/2}px, ${text_width + margin/2}px)`);

    // if interactive, append <input> for each number in confusion matrix
    if(interactive){
        function numChange(){
            // when a number change, then send the new confusion matrix to the fairness object
            let newCM = [[parseInt(divSelector.select('.TPval').node().value), parseInt(divSelector.select('.FNval').node().value)],
            [parseInt(divSelector.select('.FPval').node().value), parseInt(divSelector.select('.TNval').node().value)]];
            FairMetricsPanelObj.update(newCM, idx);
            // rerender the color of confusion matrix
            let className = d3.select(this).attr('class').substring(0, 2);
            console.log('name', className)
            let newVal = d3.select(this).node().value;
            console.log('value', newVal)
            divSelector.select('.'+className).style('opacity', opacityScale(newVal));
        }

        let addInputs = (x, y, className, value)=>{
            let offset = text_width + margin/2;
            divSelector.append('input')   
                .attr("type", "number")
                .classed(className, true)
                .attr("min", "1")
                .attr("max", "100")
                .attr("value", value)
                .attr("step", "5")
                .on('change', numChange)
                .style('left', function(){return `${offset + x + rectWid/2 - parseInt(d3.select(this).style('width'))/2}px`})
                .style('top', function(){return `${offset + y + rectHei/2 - parseInt(d3.select(this).style('height'))/2}px`});
        }
        addInputs(0, 0, 'TPval', CFData['TP']);
        addInputs(rectWid, 0, 'FNval', CFData['FN']);
        addInputs(0, rectHei, 'FPval', CFData['FP']);
        addInputs(rectWid, rectHei, 'TNval', CFData['TN']);
    }

    // visualize the two axises
    let visText = (GSelector, x, y, text, angle)=>{
        return GSelector.append('text').attr('x', 0).attr('y', 0).text(text).attr('text-anchor', 'middle')
            .attr('font-size', '10px') // 
            .style('transform', `rotate(${angle}deg)  translate(${x}px, ${y}px)`);
    }
    let gap = 5;
    visText(CFGroup, -rectHei/2, 0-gap, outputLabel[0], -90);
    visText(CFGroup, -rectHei/2*3, 0-gap, outputLabel[1], -90);
    visText(CFGroup, rectWid/2, 0-gap, outputLabel[0], 0);
    visText(CFGroup, rectWid/2*3, 0-gap, outputLabel[1], 0);
    // visualize the title: Actual / Predicted
    let visBigText = (GSelector, x, y, text, angle)=>{
        return GSelector.append('text').attr('x', 0).attr('y', 0).text(text).attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .style('transform', `rotate(${angle}deg) translate(${x}px, ${y}px)`);
    }
    visBigText(CFGroup, rectWid, 0-gap*4, 'Predicted', 0);
    visBigText(CFGroup, 0-rectHei, 0-gap*4, 'Actual', -90);

    // visualize the title of the group
    let title = idx==0? attrVs[0]:attrVs[1];
    divSelector.append('p').classed('plotTitle', true).text(`${title}`)
        .style("top", `${svg_height}px`)
    .style("padding-bottom","0px").style("padding-top","0px");

    return divSelector;
}