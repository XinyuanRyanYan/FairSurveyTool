# convert all survey into a csv file
import json
import os

file_name_lst = os.listdir('surveyRes')
print(file_name_lst)

for file_name in file_name_lst:
  if file_name[0:4] != 'user':
    continue  
  with open('surveyRes/'+file_name, 'r') as f:
    print(json.loads(f))
  
  


