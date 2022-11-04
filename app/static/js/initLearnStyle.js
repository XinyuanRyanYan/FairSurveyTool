/**
 * This script is used to generate the survey of the learning style
 */

function addQuestion(description, id, name, istitle){
  let selector = d3.select('form')
    .append('div')
    .classed('likerBox', true)
    .attr('id', id)
    .style('border', 'none');

  // add description
  // selector.append('p').text(description).style('margin-bottom', '0.3em');

  // add the likertdiv
  let likertSelector = selector.append('div')
    .classed('likertScale_7', true)
    .classed('likertBG', true);

  // add the title  
  if(istitle){
    let divSelector = likertSelector.append('div')
      .classed('likert-item', true); 
    divSelector.append('p')
      .style('font-weight', '700')
      .text('Most of the time, I …');
    
    let addText=(tText)=>{
      let divSelector = likertSelector.append('div')
        .classed('likert-item', true); 
      divSelector.append('p')
        .text(tText);
    }
    let nameLst = ['strongly disagree', 'moderately disagree', 'disagree a little', 'agree a little', 'moderately agree', 'strongly agree'];
    for(let i=0; i<nameLst.length; i++){
      addText(nameLst[i]);
    }
    return;
  }
  

  for(let i = 0; i < 7; i++){
    let divSelector = likertSelector.append('div')
      .classed('likert-item', true);
     
    if(i==0){
      divSelector.append('span').text(description);
      continue;
    }
    
    divSelector.append('input')  
      .classed('form-check-input', true)
      .attr('type', 'radio')
      .attr('name', name)
      .attr('value', i+1)
      .style('margin-right', '6px');
  
    divSelector.append('span')
      .text(`${i}`);
  }
}

let Questions = [
  ['…prefer to study alone.'],
  ['…enjoy competing.'],
  ['…create a mental picture of what I study.'],
  ['…prefer to study with other students.'],
  ['…compete to get the highest grade.'],
  ['…create a mental picture of what I see.'],
  ['…learn better when someone represents information in a pictorial (e.g., picture, flowchart) way.'],
  ['…learn practical tasks better than theoretical ones.'],
  ['…learn better when I study with other students.'],
  ['…compete with other students.'],
  ['…create a mental picture of what I read.'],
  ['…learn better when someone uses visual aids (e.g., whiteboard, power point) to represent a subject.'],
  ['…learn better when I am involved in a task.'],
  ['…focus more on the details of a subject.'],
  ['…consider the details of a subject more than its whole.'],
  ['…learn better when I watch an educational program.'],
  ['…learn better when I watch a demonstration.'],
  ['…create a mental picture of what I hear.'],
  ['…remember the details of a subject.'],
  ['…learn better when I study alone.'],
  ['…remember specific details of subjects.'],
  ['…learn better when studying practical, job-related, subjects.']
]
addQuestion('', '', '', true);
for(let i = 0; i < Questions.length; i++){
  let question = Questions[i];
  let name = `Q${i+1}`;
  let id = `Q${i+1}Q`;
  addQuestion(question, id, name, false);
}