from app import app
from flask import Flask, redirect, jsonify, request, render_template

import csv
import os
import json
import operator

folder_path = os.path.dirname(os.path.abspath(__file__))

import pymongo
from pymongo import MongoClient

from sklearn.cluster import KMeans
import numpy as np

from datetime import datetime, timedelta

lookup_tb = {}
num_of_zones = 265

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



@app.route('/travel_timegap', methods=['POST'])
def travel_timegap():
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

@app.route('/traffic', methods=['POST'])
def traffic():

	client = MongoClient('localhost', 27017)
	traffic_collection = client.timegap.traffic_travel
	docs = traffic_collection.find()

	traffics = []
	for i in range(0, num_of_zones):
		arr = []
		for j in range(0, num_of_zones):
			arr.append(0)
		traffics.append(arr)

	for doc in docs:
		travel = doc['travel']
		num = doc['traffic']
		ids = (travel.split('+'))
		start = int(ids[0])-1
		end = int(ids[1])-1
		traffics[start][end] = num

	max_rows = request.json['max_length']
	min_mat, row_ids = minimize_matrix(traffics, max_rows)
	return jsonify({'matrix': min_mat, 'row_ids': row_ids})


def minimize_matrix(matrix, max_rows):

	if len(matrix)>max_rows:
		row_dict = {}
		for i in range(num_of_zones):
			row_dict[i] = 0
			for j in range(num_of_zones):
				row_dict[i] += matrix[i][j]
		rs = sorted(row_dict.items(), key=operator.itemgetter(1))[-max_rows:]
		mat_minrow, rows = [], []
		for r in rs:
			row = r[0]
			mat_minrow.append(matrix[row])
			rows.append(row+1)

		col_dict = {}
		for j in range(num_of_zones):
			col_dict[j] = 0
			for i in range(num_of_zones):
				col_dict[j] += matrix[i][j]

		cs = sorted(col_dict.items(), key=operator.itemgetter(1))[-max_rows:]
		mat_minrowcol = []
		for row in mat_minrow:
			arr = []
			for c in cs:
				arr.append(row[c[0]])
			mat_minrowcol.append(arr)
		
		return sort_matrix(mat_minrowcol, rows)

	else:
		return sort_matrix(mat_minrowcol, rows)

# get group id for chord_graph
def sort_matrix(matrix, rows):
	row_idx = sorted(range(len(matrix)), key=lambda k: sum(matrix[k]))
	mat_01 = [matrix[idx] for idx in row_idx]
	mat = []
	for row in mat_01:
		col_idx = sorted(range(len(row)), key=lambda k: row[k])
		row_arranged = [row[idx] for idx in col_idx]
		mat.append(row_arranged)

	return mat, [rows[idx] for idx in row_idx]


@app.route('/time_pattern',  methods = ['POST'])
def time_pattern():
	start_time = "2017-02-06 00:00:00"
	gap = 5


	client = MongoClient('localhost', 27017)
	time_series_collection = client.timegap.traffic_of_zone
	docs = time_series_collection.find()

	km_arr = []
	for doc in docs:
		km_arr.append(doc['traffic'])

	num_cltrs = request.json['num_of_patterns']
	X = np.array(km_arr)
	kmeans = KMeans(n_clusters=num_cltrs, random_state=0).fit(X)
	labels = kmeans.labels_
	patterns = {} #{0: [262, 2], 1: [], 2: [], ... , 9: []} 
	for i in range(num_cltrs):
	    patterns[i] = []
	for idx, i in enumerate(labels):
	    patterns[i].append(idx+1)
    
	centers = kmeans.cluster_centers_.tolist()

    # get x axis data
	num_days = int(35/gap)
	num_of_gap = int(num_days*24*60/gap)
	time_points = []
	t_point = datetime.strptime(start_time, '%Y-%m-%d %H:%M:%S')
	for j in range(num_of_gap):
	    time_points.append(t_point.strftime('%Y-%m-%d %H:%M:%S'))
	    t_point += timedelta(minutes = gap)

	# pattern look up dictionary, aka key as zoneid and value as pattern id
	pattern_lookup = {}
	for idx, i in enumerate(labels):
	    idd = str(idx+1)
	    pattern_lookup[idd] = int(i)

	# 
	time_series_all_pattern = []
	for t in time_points:
		time_series_all_pattern.append({'date': t})

	for pattern_id, value_series in enumerate(centers):
		# print(value_series)
		for idx, val in enumerate(value_series):
			time_series_all_pattern[idx][str(pattern_id)] = val



	# print(centers)

	return jsonify({'time_ticks': time_points, 'patterns': patterns,
					 'centers': centers, 'pattern_lookup': pattern_lookup, 'time_series_all_pattern': time_series_all_pattern})





