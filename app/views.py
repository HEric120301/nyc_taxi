from app import app
from flask import Flask, redirect, jsonify, request, render_template

import csv
import os
import json

folder_path = os.path.dirname(os.path.abspath(__file__))

import pymongo
from pymongo import MongoClient

lookup_tb = {}
def lookup_dict():
	with open('/Users/qingfenghan/Documents/GitHub/nyc_taxi/app/static/data/taxi+_zone_lookup.csv', newline='') as csvfile:
		k=0
		spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
		for row in spamreader:
			if k==0:
				k+=1
				continue
			if row!=[]:
				lookup_tb[row[2].strip('\"')] = {'Borough': row[1].strip('\"'), 'ID': row[0]}


@app.route('/')
@app.route('/index')
def index():
	return redirect('/static/index.html')



@app.route('/hello', methods=['POST'])
def hello():
	pickup = request.json['pick_up']
	dropoff = request.json['drop_off']
	lookup_dict()
	travel = lookup_tb[pickup]['ID'] + '+' + lookup_tb[dropoff]['ID']


	client = MongoClient('localhost', 27017)
	time_gap_collection = client.timegap.timeGap
	values = (time_gap_collection.find_one({'travel': travel}))['values']

	result_val = []
	for t in values:
		val = values[t]
		result_val.append({'date': t, 'value': val})
	
	return jsonify({'travel': travel, 'values': result_val})