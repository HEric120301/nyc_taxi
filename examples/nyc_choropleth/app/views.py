from app import app
from flask import Flask, redirect, jsonify

import csv
import os
folder_path = os.path.dirname(os.path.abspath(__file__))

@app.route('/')
@app.route('/index')
def index():
	return redirect('/static/index.html')

@app.route('/test', methods = ['GET','POST'])
def test():
	return jsonify({'s':'shooting'})

