from app import app
from flask import Flask, render_template, request, flash

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/background', methods=['POST', 'GET'])
def backgroundTest():
    return render_template('bg.html')

@app.route('/pretestIntro', methods=['POST', 'GET'])
def pretestIntro():
    return render_template('pretestIntro.html')

@app.route('/pretest', methods=['POST', 'GET'])
def pretest():
    return render_template('pretest.html')

@app.route('/materialIntro', methods=['POST', 'GET'])
def materialIntro():
    return render_template('materialIntro.html')

@app.route('/material', methods=['POST', 'GET'])
def material():
    # print(request.form)
    # return flash("you are successfuly logged in")
    return render_template('material2.html')

@app.route('/posttestIntro', methods=['POST', 'GET'])
def posttestIntro():
    return render_template('posttestIntro.html')

@app.route('/posttest-1', methods=['POST', 'GET'])
def posttest_1():
    return render_template('posttest_1.html')

@app.route('/posttest-2', methods=['POST', 'GET'])
def posttest_2():
    return render_template('posttest_2.html')

@app.route('/engagement', methods=['POST', 'GET'])
def engagement():
    return render_template('engage.html')

@app.route('/learnStyle', methods=['POST', 'GET'])
def learnStyle():
    return render_template('learnStyle.html')

@app.route('/endStudy', methods=['POST', 'GET'])
def endStudy():
    return render_template('endStudy.html')