
/**
 * get the preserved answers of the first part of the post test
 * ['post-Calculation', 'post-Value', 'post-Accuracy']
 */
 function getPost1Ans(){
  axios.post('/getPost1Ans', {
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

getPost1Ans();