/**
 * This script exclusively serves the posttest-2 page
 * 1. when revisit material, submit the ans to the backend
 * 2. when open this script, ask the backend for the stored ans last time 
 * the three questions in the post test: 
 * ('post-sub-female', 'Increase'), ('post-sub-male', 'Increase'), ('post-ground-truth', 'Yes') 
 */

/**
 * sumbit the current ans to the backend for caching
 * set all three attributes, if no ans, set it to ''
 * {'post-sub-female': '', ...}
 * @param {*} dataNameLst ['post-sub-female', 'post-sub-male', 'post-ground-truth']
 */
function revisitSubmit(dataNameLst){
    let form = d3.select('.revisitFormAns').node();
    // console.log(Object.fromEntries(new FormData(form)));
    form.submit();
    // var formData = Object.fromEntries(new FormData(form)); 
    // for(let i = 0; i < dataNameLst.length; i++){
    //     if(!(dataNameLst[i] in formData)){
    //         formData[dataNameLst[i]]='';
    //     }
    // }
    // console.log(formData)
}

/**
 * get the preserved answers of the second part of the post test
 */
function getPost2Ans(){
    axios.post('/getPost2Ans', {
      })
      .then(function (response) {
        let data = response.data; // {'post-sub-female': 'Decrease', 'post-sub-male': None, 'post-ground-truth': None}
        // change the status the selection on the page
        for(key in data){
            if(data[key]){
                d3.selectAll('input')
                    .filter((function(_, _){
                        if(d3.select(this).attr('name')==key&&d3.select(this).attr('value')==data[key]){
                            this.checked = true;
                        }
                    }));
            }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
}

getPost2Ans();