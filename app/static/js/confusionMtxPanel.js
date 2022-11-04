// the dimension of the confusion matrix div
let CMDim = {       // dimension for the confusion matrix div
    margin: {left: 30, right: 10, top: 35, bottom: 10},
    width: 180,
    height: 140
}
CMDim.wrapperWid = CMDim.width + CMDim.margin.left + CMDim.margin.right;
CMDim.wrapperHei = CMDim.height + CMDim.margin.top + CMDim.margin.bottom;

let outputLabel = ['p ', 'n', 'p\'', 'n\''];
let attrVs = ['Male', 'Female'];

/**
 * visualize the confusion matrix inside the divSelector
 * @param {*} divSelector 
 * @param {*} idx visualize which confusion matrix we should use  either 1 or 0
 */
 function visConfusionMatrixPanel(divSelector, confusionMatrixData, idx, interactive = false, FairMetricsPanelObj){
    let globalRatio = document.documentElement.clientWidth<900? document.documentElement.clientWidth/1440 : 1;
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

    let margin = 10*globalRatio;
    let text_width = (10 + 14)*globalRatio + margin; // text and bigText width
    let plotTitle_height = 10*globalRatio + margin;
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
            .style('font-size', `${12*globalRatio}px`)
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
            interactNum += 1;
            // when a number change, then send the new confusion matrix to the fairness object
            let tpV = divSelector.select('.TPval').node().value;
            let fnV = divSelector.select('.FNval').node().value;
            let fpV = divSelector.select('.FPval').node().value;
            let tnV = divSelector.select('.TNval').node().value;
            if(isNaN(tpV)||isNaN(fnV)||isNaN(fpV)||isNaN(tnV)){
                return;
            }
            if(parseInt(tpV)+parseInt(fpV)==0){return;}
            let newCM = [[parseInt(tpV), parseInt(fnV)],[parseInt(fpV), parseInt(tnV)]];
            FairMetricsPanelObj.update(newCM, idx);
            // rerender the color of confusion matrix
            let className = d3.select(this).attr('class').substring(0, 2);
            let newVal = d3.select(this).node().value;
            console.log('value', newVal)
            divSelector.select('.'+className).style('opacity', opacityScale(newVal));
        }
        // IOS not support the such input https://stackoverflow.com/questions/62300321/mobile-ios-input-type-date-min-and-max-not-working-on-chrome-and-safari
        let addInputs = (x, y, className, value)=>{
            let offset = text_width + margin/2;
            divSelector.append('input')   
                // .attr("type", "number")
                .classed(className, true)
                // .attr("min", "1")
                // .attr("max", "100")
                .attr("value", value)
                .style('font-size', `${15*Math.sqrt(globalRatio, 2)}px`)
                // .attr("step", "1")
                .attr("inputMode", 'numeric')
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
    let visText = (GSelector, x, y, text, angle, pos)=>{
        return GSelector.append('text').attr('x', 0).attr('y', 0).text(text).attr('text-anchor', pos)
            .attr('font-size', `${10*Math.sqrt(globalRatio,2)}px`) // 
            .style('transform', `rotate(${angle}deg)  translate(${x}px, ${y}px)`);
    }
    let gap = 5*globalRatio;
    visText(CFGroup, 0, gap+rectHei/2-1, outputLabel[0], 0, 'end');
    visText(CFGroup, 0, gap+3*rectHei/2-1, outputLabel[1], 0, 'end');
    visText(CFGroup, rectWid/2, 0-gap, outputLabel[2], 0, 'middle');
    visText(CFGroup, rectWid/2*3, 0-gap, outputLabel[3], 0, 'middle');
    // visualize the title: Actual / Predicted
    let visBigText = (GSelector, x, y, text, angle)=>{
        return GSelector.append('text').attr('x', 0).attr('y', 0).text(text).attr('text-anchor', 'middle')
            .attr('font-size', `${14*Math.sqrt(globalRatio,2)}px`)
            .style('transform', `rotate(${angle}deg) translate(${x}px, ${y}px)`);
    }
    visBigText(CFGroup, rectWid, 0-gap*4, 'Predicted', 0);
    visBigText(CFGroup, 0-rectHei, 0-gap*4, 'Actual', -90);

    // visualize the title of the group
    let title = idx==0? attrVs[0]:attrVs[1];
    divSelector.append('span').classed('plotTitle', true).text(`${title}`)
        .style('bottom', `${-16*Math.sqrt(globalRatio,2)}px`)
        .style("top", `${svg_height}px`)
        .style("font-size", `${12*Math.sqrt(globalRatio,2)}px`)
        .style("padding-bottom","0px").style("padding-top","0px");

    return divSelector;
}
