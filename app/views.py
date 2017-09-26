from app import app
from flask import Flask, redirect, jsonify

import csv
import os
folder_path = os.path.dirname(os.path.abspath(__file__))

with open(folder_path+'/green_tripdata_2017-01.csv', newline='') as csvfile:
	spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
	for row in spamreader:
		print(row)
		break

@app.route('/')
@app.route('/index')
def index():
	return redirect('/static/index.html')

@app.route('/test', methods = ['GET','POST'])
def test():
	return jsonify({'s':'shooting'})

