from app import app
from flask import Flask, render_template, request, flash, session, jsonify
from time import gmtime, strftime
import json

groupNum = [0, 0, 0]
id = 0

def saveSession(formData):
    for key in formData:
        session[key] = formData[key]

def saveResults():
    userData={}
    for key in list(session.keys()):
        userData[key] = session[key]
    with open("surveyRes/user"+str(id)+".json", "w") as f:
        json.dump(userData, f, indent=4)

def getCurTime():
    return strftime("%Y-%m-%d %H:%M:%S", gmtime())

@app.route('/')
def index():
    global id
    global groupNum
    # clear session
    for key in list(session.keys()):
        session.pop(key)
    # decide which group
    # session['group'] = groupNum.index(min(groupNum))+1
    session['group'] = 3
    session['readingPeriods'] = []  # the reading periods users spend in the 2 parts ['P1', time, numInteraction], ['P2', time], ['End', time, numInteraction]
    session['revisitPeriods'] = []  # the revisiting material periods; ['mtl', time], ['test', time, numInteraction], ['end', time]
    groupNum[session['group']-1] += 1
    id += 1
    session['start_time'] = getCurTime() # time of starting the survey
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
    session['pretestSTime'] = getCurTime() # time of starting the pretest
    return render_template('pretest.html')

@app.route('/materialIntro', methods=['POST', 'GET'])
def materialIntro():
    saveSession(request.form)   # pretest
    session['pretestETime'] = getCurTime() # time of ending the pretest
    return render_template('materialIntro.html')

# return the first part of material
@app.route('/materialP1', methods=['POST', 'GET'])
def materialP1():
    interactNum = request.form['interactNum'] if 'interactNum' in request.form.keys() else 0
    session['readingPeriods'].append(['P1', getCurTime(), interactNum]) # time of start reading material P1, and num of interact in P2
    return render_template('materialP1.html')

# return the second part of material
@app.route('/materialP2', methods=['POST', 'GET'])
def materialP2():
    session['readingPeriods'].append(['P2', getCurTime()]) # time of start reading material P2
    return render_template('materialP2_'+str(session['group'])+'.html')

@app.route('/posttestIntro', methods=['POST', 'GET'])
def posttestIntro():
    interactNum = request.form['interactNum'] if 'interactNum' in request.form.keys() else 0
    session['readingPeriods'].append(['End', getCurTime(), interactNum]) # time of end reading material
    return render_template('postTestIntro.html')

@app.route('/posttest-1', methods=['POST', 'GET'])
def posttest_1():
    session['post1STime'] = getCurTime() # post test 1 start time
    return render_template('posttest_1.html')

@app.route('/posttest-2', methods=['POST', 'GET'])
def posttest_2():
    # ditinguish this request is from the posttest-1 or revisit
    if 'interactNum' in request.form.keys():
        # ['test', time, numInteraction]
        session['revisitPeriods'].append(['test', getCurTime(), request.form['interactNum']])
    else:
        session['post1ETime'] = getCurTime() # post test 1 end time
        saveSession(request.form)   # post-test1
    return render_template('posttest_2.html')

@app.route('/revisit', methods=['POST', 'GET'])
def revisit():
    # record revisit time
    session['revisitPeriods'].append(['mtl', getCurTime()])
    print('ans collected in the revisit')
    print(request.form)
    saveSession(request.form)   # save post-test2
    return render_template('material'+str(session['group'])+'.html')

# fetch the ans for the posttest-2, and send them to the frontend
@app.route('/getPost2Ans', methods=['POST', 'GET'])
def getPost2Ans():
    nameLst = ['post-sub-female', 'post-sub-male', 'post-ground-truth']
    res = {}
    for name in nameLst:
        res[name] = session.get(name)
    return jsonify(res)

@app.route('/engagement', methods=['POST', 'GET'])
def engagement():
    # save the finish time of posttest-2  ['end', time]
    session['revisitPeriods'].append(['end', getCurTime()])
    print('the revisit pattern', session['revisitPeriods'])
    saveSession(request.form)   # post-test2
    print('the test2 result', request.form)
    return render_template('engage.html')

@app.route('/learnStyle', methods=['POST', 'GET'])
def learnStyle():
    saveSession(request.form)   # engagement 
    return render_template('learnStyle.html')

@app.route('/endStudy', methods=['POST', 'GET'])
def endStudy():
    saveSession(request.form)   # learn style
    session['end_time'] = getCurTime() # time of ending the survey
    saveResults()
    return render_template('endStudy.html')