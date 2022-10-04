from app import app
from flask import Flask, render_template, request, flash, session
from time import gmtime, strftime
import json


groupNum = [0, 0, 0]
id = 0

def saveSession(formData):
    for key in formData:
        print(key)
        print(formData[key])
        session[key] = formData[key]

def saveResults():
    userData={}
    for key in list(session.keys()):
        userData[key] = session[key]
    json_object = json.dumps(userData, indent=4)
    with open("surveyRes/user"+str(id)+".txt", "w") as f:
        f.write(json_object)

@app.route('/')
def index():
    print(type(strftime("%Y-%m-%d %H:%M:%S", gmtime())))
    global id
    global groupNum
    # decide which group
    print('current group', groupNum)
    session['group'] = groupNum.index(min(groupNum))+1
    groupNum[session['group']-1] += 1
    id += 1
    return render_template('index.html')

@app.route('/background', methods=['POST', 'GET'])
def backgroundTest():
    return render_template('bg.html')

@app.route('/pretestIntro', methods=['POST', 'GET'])
def pretestIntro():
    saveSession(request.form)   # background
    return render_template('pretestIntro.html')

@app.route('/pretest', methods=['POST', 'GET'])
def pretest():
    session['pretestSTime'] = strftime("%Y-%m-%d %H:%M:%S", gmtime()) # time of starting the pretest
    return render_template('pretest.html')

@app.route('/materialIntro', methods=['POST', 'GET'])
def materialIntro():
    saveSession(request.form)   # pretest
    session['pretestETime'] = strftime("%Y-%m-%d %H:%M:%S", gmtime()) # time of ending the pretest
    return render_template('materialIntro.html')

@app.route('/material', methods=['POST', 'GET'])
def material():
    session['materialSTime'] = strftime("%Y-%m-%d %H:%M:%S", gmtime()) # time of start reading material
    return render_template('material'+str(session['group'])+'.html')

@app.route('/posttestIntro', methods=['POST', 'GET'])
def posttestIntro():
    session['materialETime'] = strftime("%Y-%m-%d %H:%M:%S", gmtime()) # time of end reading material
    saveResults()
    return render_template('posttestIntro.html')

@app.route('/posttest-1', methods=['POST', 'GET'])
def posttest_1():
    session['post1STime'] = strftime("%Y-%m-%d %H:%M:%S", gmtime()) # post test 1 start time
    return render_template('posttest_1.html')

@app.route('/posttest-2', methods=['POST', 'GET'])
def posttest_2():
    session['post1ETime'] = strftime("%Y-%m-%d %H:%M:%S", gmtime()) # post test 1 end time
    saveSession(request.form)   # post-test1
    return render_template('posttest_2.html')

@app.route('/engagement', methods=['POST', 'GET'])
def engagement():
    session['post2ETime'] = strftime("%Y-%m-%d %H:%M:%S", gmtime()) # post test 2 end time
    saveSession(request.form)   # post-test2
    return render_template('engage.html')

@app.route('/learnStyle', methods=['POST', 'GET'])
def learnStyle():
    saveSession(request.form)   # engagement 
    return render_template('learnStyle.html')

@app.route('/endStudy', methods=['POST', 'GET'])
def endStudy():
    saveSession(request.form)   # learn style
    saveResults()
    return render_template('endStudy.html')