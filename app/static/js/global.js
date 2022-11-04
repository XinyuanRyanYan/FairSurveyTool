/**
 * Process all button click event
 */
let interactNum = 0;

window.history.forward();
function noBack() { window.history.forward(); }



// Button Listener
function btnListener(dataNameLst){
    // let dataNameLst = ['major', 'degree'];
    let form = d3.select('.ansForm').node();
    console.log(d3.select('.ansForm'));
    let formDict = getData(form);
    let completeAll = ansAllQuestion(dataNameLst, formDict);
    console.log('form', formDict);
    if(completeAll){
        form.submit();
    } 
    else{
        alert('Please answer all questions!');
    }
}

function submitInteractNum(className = 'ansForm'){
    console.log('className', className);
    let formD = d3.select(`.${className}`).append('input')
        .attr('name', 'interactNum')
        .attr('type', 'text')
        .attr('value', interactNum)
        .style('visibility', 'hidden');
    let form = d3.select(`.${className}`).node();
    form.submit();
}


function getData(form) {
    var formData = new FormData(form);
    return Object.fromEntries(formData); 
    // iterate through entries...
    // for (var pair of formData.entries()) {
    //   console.log(pair[0] + ": " + pair[1]);
    // }
  
    // ...or output as an object
    // console.log(Object.fromEntries(formData));
}

function ansAllQuestion(nameLst, formDict){
    for(let i = 0; i < nameLst.length; i++){
        if(!(nameLst[i] in formDict)){
            return false;
        }
        if(nameLst[i] == 'feedback'){
            if(!formDict[nameLst[i]]){return false;}
        }
    }
    return true;
}   