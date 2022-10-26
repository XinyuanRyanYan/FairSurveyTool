# convert all survey into a csv file
import json
import os
import csv

KEYS = ['group', 'start_time', 'degree', 'major', 'pretestSTime', 'pre-Calculation', 'pre-Value', 'pre-Accuracy', 'pretestETime', 'materialSTime', 'materialETime', 'post1STime', 'post1ETime', 'post-Calculation', 'post-Value', 'post-Accuracy', 'post2ETime', 'post-sub-female', 'post-sub-male', 'post-ground-truth', 'effective', 'engagement', 'recommend', 'feedback', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'Q13', 'Q14', 'Q15', 'Q16', 'Q17', 'Q18', 'Q19', 'Q20', 'Q21', 'Q22', 'end_time', 'interactNum']

file_name_lst = os.listdir('surveyRes')

userAns = []

for file_name in file_name_lst:
  if file_name[0:4] != 'user':
    continue
  with open('surveyRes/'+file_name, 'r') as f:
    userAnsObj = json.load(f)
    userAnsS = []
    for key in KEYS:
      if key in userAnsObj.keys():
        userAnsS.append(userAnsObj[key])
      else:
        userAnsS.append('null')
    userAns.append(userAnsS)
print(userAns)
with open('userAns.csv', 'w') as f:
  writer = csv.writer(f)
  writer.writerow(KEYS)
  writer.writerows(userAns)


