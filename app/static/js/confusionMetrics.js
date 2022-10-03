/* visualize the color legend for the confunsion matrix 
 * @param {*} id: the id of gradient
 * horizontal: the direction of the color map
*/
let CFScale = '';
let opacityScale = '';

function addColorLegend(svgSelector, gradId, horizontal=true){
    let legendG = svgSelector.append('g');
    let domain = CFScale.domain();  // the domain of the scale
    let startColor = CFScale(domain[0]);
    let endColor = CFScale(domain[1]);

    let svg_width = parseInt(svgSelector.style("width"));
    let svg_height = parseInt(svgSelector.style("height"));
    let margin_x = svg_width/3;
    let margin_y = 20;
    let legend_width = Math.min(10, svg_width - 2*margin_x)
    let legend_height = svg_height-2*margin_y;
    let dim = {
        wid: legend_width,
        hei: legend_height
    };
    // gradient generator
    let graGenerator = svgSelector.append('linearGradient').attr('id', gradId)
        .attr('x1', '0').attr('x2', '0').attr('y1', '1').attr('y2', '0');
    graGenerator.append('stop').attr('offset', '0').attr('stop-color', startColor);
    graGenerator.append('stop').attr('offset', '1').attr('stop-color', endColor);

    // rect
    legendG.append('rect').attr('x', margin_x).attr('y', margin_y).attr('width', dim.wid).attr('height', dim.hei).attr('fill', `url(#${gradId})`);

    // only add the minimum number and the maximum number
    legendG.append('text')
        .attr('x', margin_x+dim.wid/2).attr('y', margin_y)
        .attr('dy', '-0.2em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .text(domain[1]);
    legendG.append('text')
        .attr('x', margin_x+dim.wid/2).attr('y', margin_y+dim.hei)
        .attr('dy', '1.1em')
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .text(domain[0]);
    
    return legendG;
}   



/**
 * This class is used to genarate the fairness metrics container to display the four firness metrics and accuracy
 */
class FairMetricsPanel{
    /**
     * new a panel
     * @param {*} containerId the div id of the mostout div
     * @param {*} metricsData the values of different fairness metrics
     * {'SPD': [{'original': 0.95}, {'mitigate': 0.2}...], 'DI': [{'original': 0.95}, {'mitigate': 0.2}...], 
     * 'EOD': , 'AOD': , 'accuracy': [{'original': 0.95}, {'mitigate': 0.2}]}
     * type: 'Original', 'Reweighing'....
     */
    constructor(containerSelector, type, setPosition, VCSet){
        this.name = 'FairMetrics';
        this.setPosition = setPosition;
        this.VCSet = VCSet;
        this.type = type;
        this.containerSelector = containerSelector
            .style('display', 'block')
            .classed("placeHolder", true)
            .classed("container", true);
        this.containerId = containerSelector.attr("id"); 
        // data in this VC
        this.confusionMatrixData = '';
        // fairness metrics to be shown in this modular
        // this.shownMetrics = ['SPD', 'DI', 'EOD', 'AOD'];
        this.shownMetrics = ['DI'];
        this.focusMetric = '';    // the focused metric
        // if the fairness metric is single, we directly activate
        if(this.setPosition==-1){this.activate();}
    }
    /**
     * when the prediction data is avaliable, activate the corresponding fairness metrics
     */
    async activate(){
        this.reset();
        this.confusionMatrixData = [[[62, 1], [22, 1]], [[24, 3],[11, 4]]];
        this.initCFScale(this.confusionMatrixData);

        this.containerSelector
            .style('height', 'auto')  // 760
            .classed("placeHolder", false);

        // init the confusion matrix div
        this.CMDiv = this.containerSelector.append('div')
            .classed("row", true)
            .classed('no-gutters', true)
            .classed('justify-content-center', true)
           
        this.formulaContainer = this.containerSelector.append('div')
            .classed("formula-container", true)
            .classed("row", true)
            .classed('no-gutters', true)
            .classed('justify-content-center', true)
            .style("height", "0px")
            .style("visibility", "hidden");

        // the div clicked last time
        this.lastClickDiv = '';
        // the div containing the fomula
        this.feFormulaDiv = '';     // the female group
        this.maleFormulaDiv = '';   // male group
        this.minusDiv = '';         //minus
        this.equalDiv = '';         // equal to
        this.initCMDiv();

        // add and visualize different metric panels
        let fairMetricContainer = this.containerSelector.append('div')
            .classed("row", true)
            .classed('no-gutters', true)
            .classed('justify-content-center', true);
        this.shownMetrics.forEach((metricName)=>{
            this.addFairMetricDiv(metricName, fairMetricContainer);
        });
    }

    // init the confusion matrix div
    initCMDiv(){
        let ratio = 2.9;
        let initCMDivs = (className)=>{
            return this.CMDiv.append('div').classed(className, true);
        }
        let legendDiv = initCMDivs("col-1");
        let rowHei = parseInt(legendDiv.style('width'))*ratio;
        this.CMDiv1 = initCMDivs("col-4").append('div').style('height', `${rowHei}px`);
        initCMDivs("col-1");
        this.CMDiv0 = initCMDivs("col-4").append('div').style('height', `${rowHei}px`);
        initCMDivs("col-1");

        let legendDivSvg = legendDiv.append('svg')
            .style('width', legendDiv.style('width'))
            .style('height', `${rowHei}px`);
        addColorLegend(legendDivSvg, parseInt(Math.random()*10000)+'c', false);

        this.addCMDiv(this.CMDiv1, 1);
        this.addCMDiv(this.CMDiv0, 0);

        // init the formula divs
        let initFomulaDivs = (className, justifyStyle)=>{
            return this.formulaContainer.append('div')
                        .classed(className, true)
                        .classed('d-flex', true)    // center the text vertically and horizontally
                        .classed(justifyStyle, true)
                        .classed("align-items-center", true)
                        .classed('formulaText', true);
        }
        initFomulaDivs("col-1", "justify-content-center");
        this.feFormulaDiv = initFomulaDivs("col-4", "justify-content-center");
        this.minusDiv = initFomulaDivs("col-1", "justify-content-center");
        this.maleFormulaDiv = initFomulaDivs("col-4", "justify-content-center");
        this.equalDiv = initFomulaDivs("col-1", "justify-content-left");
    }

    addFairMetricDiv(metricName, containerDiv){
        let divSelector = containerDiv.append('div').classed("col-6", true)
            .style('overflow', 'hidden')
            .classed('px-2', true)
            .classed('py-2', true)
            .append('div')
            .classed(metricName+'Panel', true)
            .style('overflow', 'hidden');
        visFairMetricPanel(divSelector, metricName, this.metricsData[metricName]);
        divSelector.on('click', ()=>{
            this.clickEvent(divSelector);
        });
        return divSelector;
    }

    addAccuracyDiv(){
        let divSelector = this.containerSelector.append('div');
        visAccuracyPanel(divSelector, this.metricsData['accuracy']);
    }

    // add confusion matrix div
    addCMDiv(divSelector, idx){
        divSelector = visConfusionMatrixPanel(divSelector, this.confusionMatrixData, idx, true, this);
    }
    
    /**
     * click on this specific metric div
     * @param {*} divSelector 
     */
    clickEvent(divSelector){
        let red = '#E06666';
        let metricName = divSelector.property('name');
        let color = red;
        let clear = false;
        this.focusMetric = metricName;

        // function for adding the area border
        let addAreaBorder = (x, y, width, height) => {
            let group = this.containerSelector.selectAll('.rects');
            group.append('rect').classed('areaBorder', true).attr('x', x).attr('y', y)
                .attr('width', width)
                .attr('height', height)
                .attr('stroke', red)
                .attr('fill', 'none');
        }

        if(this.lastClickDiv){
            if(metricName != this.lastClickDiv.property('name')){
                this.clickEvent(this.lastClickDiv);
                this.lastClickDiv = divSelector;
                divSelector.style("border", `solid 2px ${red}`);
                divSelector.selectAll('.lastMetric').style('fill', red).style('stroke', red);
            }
            else{
                this.focusMetric = '';
                this.lastClickDiv = '';
                divSelector.style("border", 'solid 1px grey');  
                divSelector.selectAll('.lastMetric').style('fill', null).style('stroke', null);
                color = null;
                clear = true;
            }
        }
        else{
            this.lastClickDiv = divSelector;
            divSelector.style("border", `solid 2px ${red}`);
            divSelector.selectAll('.lastMetric').style('fill', red).style('stroke', red);
        }
        
        if(metricName == 'SPD' || metricName == 'DI'){
            this.containerSelector.selectAll('.TP').style('fill', color);
            this.containerSelector.selectAll('.FP').style('fill', color);
            addAreaBorder(0, 0, CMDim.width, CMDim.height);
        }
        else if(metricName == 'EOD'){
            this.containerSelector.selectAll('.TP').style('fill', color);
            addAreaBorder(0, 0, CMDim.width, CMDim.height/2);
        }
        else if(metricName == 'AOD'){
            this.containerSelector.selectAll('.TP').style('fill', color);
            this.containerSelector.selectAll('.FP').style('fill', color);
            addAreaBorder(0, 0, CMDim.width, CMDim.height/2);
            addAreaBorder(0, CMDim.height/2, CMDim.width, CMDim.height/2);
        }
        this.addFomula(metricName);
        this.formulaContainer
            .style("visibility", "visible")
            .style("height", "50px");

        if(clear){
            this.containerSelector.selectAll('.areaBorder').remove();
            this.formulaContainer
                .style("visibility", "hidden")
                .style("height", "0px");
            this.removeFomula();
            this.focusMetric = '';
        }
        else{
            this.addFomula(metricName);
            this.formulaContainer
                .style("visibility", "visible")
                .style("height", "50px");
        }

    }
 
    // add the formula part 
    /*[ [[true_positive, False_negative], [False_positive, true_negative]],
        [[true_positive, False_negative], [False_positive, true_negative]] ], */
    addFomula(metricName){
        let metricValue = Object.values(this.metricsData[metricName][this.metricsData[metricName].length-1])[0];
        let mTP = this.confusionMatrixData[0][0][0];
        let mFP = this.confusionMatrixData[0][1][0];
        let mFN = this.confusionMatrixData[0][0][1];
        let mTN = this.confusionMatrixData[0][1][1];
        let fTP = this.confusionMatrixData[1][0][0];
        let fFP = this.confusionMatrixData[1][1][0];
        let fFN = this.confusionMatrixData[1][0][1];
        let fTN = this.confusionMatrixData[1][1][1];
        
        if(metricName == 'SPD' || metricName == 'DI'){
            this.feFormulaDiv.text(`$\\frac{${fTP}+${fFP}}{${fTP}+${fFP}+${fFN}+${fTN}}$`);
            this.maleFormulaDiv.text(`$\\frac{${mTP}+${mFP}}{${mTP}+${mFP}+${mFN}+${mTN}}$`);
            if(metricName == 'SPD'){
                this.minusDiv.text('$-$');
            }
            else{
                this.minusDiv.text('$/$');
            }
        }
        else if(metricName == 'EOD'){
            this.feFormulaDiv.text(`$\\frac{${fTP}}{${fTP}+${fFN}}$`);
            this.maleFormulaDiv.text(`$\\frac{${mTP}}{${mTP}+${mFN}}$`);
            this.minusDiv.text('$-$');
        }
        else if(metricName == 'AOD'){
            this.minusDiv.text('$-$');
            this.feFormulaDiv.text(`$\\frac{\\frac{${fTP}}{${fTP}+${fFN}}+\\frac{${fFP}}{${fFP}+${fTN}}}{2}$`);
            this.maleFormulaDiv.text(`$\\frac{\\frac{${mTP}}{${mTP}+${mFN}}+\\frac{${mFP}}{${mFP}+${mTN}}}{2}$`);
        }
        this.equalDiv.text(`$=${metricValue}$`).classed('formulaText', true);  
        MathJax.typeset();
    }

    // remove the formula part
    removeFomula(){
        this.feFormulaDiv.selectAll('*').remove();
        this.minusDiv.selectAll('*').remove();
        this.maleFormulaDiv.selectAll('*').remove();
        this.equalDiv.selectAll('*').remove();
    }

    // reset
    reset(){
        this.containerSelector.style('display', 'block').style('height', '110px');
        this.containerSelector.selectAll('*').remove();
    }

    /**
     * update the confusion matrix
     * @param {*} confusion new confusion matrix
     * @param {*} idx the idx, 0 or 1
     */
    update(CM, idx){
        this.confusionMatrixData[idx] = CM;     // new confusion matrix
        // update the metricsData
        let metricsData = {}
        this.shownMetrics.forEach(metricName=>{
            metricsData[metricName] = [];
            let lastVal = Object.values(this.metricsData[metricName][this.metricsData[metricName].length-1])[0];
            let currentVal = this.calcuteMetrics(metricName);
            metricsData[metricName].push({'Previous': lastVal});
            metricsData[metricName].push({'Current': currentVal});
            if(metricName == 'DI'){
                // check the result
                let gap = d3.max([Math.abs(lastVal-1), Math.abs(currentVal-1)]);
                let currentGap = fairMetricInfo['DI'].range[1]-1;
                let newGap = currentGap;
                if(gap>currentGap){newGap=parseInt(gap)+1;}
                else if(gap < 1.5){newGap=1.5}
                fairMetricInfo['DI'].range = [1-newGap, 1+newGap];
            }
            // update the visualization
            visFairMetricPanel(this.containerSelector.select('.'+metricName+'Panel'), metricName, metricsData[metricName]);
        });
        //hilight the focused click  
        this.metricsData = metricsData;
        // update formula
        if(this.focusMetric){this.addFomula(this.focusMetric);}
    }

    calcuteMetrics(metricName){
        let val = '';
        let mTP = this.confusionMatrixData[0][0][0];
        let mFP = this.confusionMatrixData[0][1][0];
        let mFN = this.confusionMatrixData[0][0][1];
        let mTN = this.confusionMatrixData[0][1][1];
        let fTP = this.confusionMatrixData[1][0][0];
        let fFP = this.confusionMatrixData[1][1][0];
        let fFN = this.confusionMatrixData[1][0][1];
        let fTN = this.confusionMatrixData[1][1][1];
        
        if(metricName == 'SPD' || metricName == 'DI'){
            let femaleVal = (fTP+fFP)/(fTP+fFP+fFN+fTN);
            let maleVal = (mTP+mFP)/(mTP+mFP+mFN+mTN);
            val = metricName == 'SPD'? femaleVal-maleVal:femaleVal/maleVal;
        }
        else if(metricName == 'EOD'){
            val = fTP/(fTP+fFN) - mTP/(mTP+mFN)
        }
        else if(metricName == 'AOD'){
            val = (fTP/(fTP+fFN)+fFP/(fFP+fTN))/2 - (mTP/(mTP+mFN)+mFP/(mFP+mTN))/2
        }
        return val.toFixed(2);
    }

    initCFScale(confusionMatrixData){
        // get the domain of the confusion matrix
        let min = 0, max = 0
        confusionMatrixData.forEach(ele=>{
            ele.forEach(e=>{
                max = d3.max(e)>max? d3.max(e): max;
            })
        })
        max = (parseInt(max/10)+1)*10;
        
        CFScale = d3.scaleLinear().domain([min,max])
            .range(['rgba(91, 155, 213, 0.2)', 'rgba(91, 155, 213, 1)'])
            // .range(['#DAE3F2', '#5B9BD5']);
        
        opacityScale = d3.scaleLinear().domain([min,max])
            .range([0.2, 1]);
        
    }
}

let fairObj = new FairMetricsPanel();