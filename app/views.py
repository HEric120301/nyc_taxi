from app import app
from flask import Flask, redirect, jsonify, request, render_template

import csv
import os
import json
import operator

folder_path = os.path.dirname(os.path.abspath(__file__))

import pymongo
from pymongo import MongoClient

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
	min_mat, mat_ids, row_ids = minimize_matrix(traffics, max_rows)
	return jsonify({'matrix': min_mat, 'row_ids': row_ids, 'mat_ids': mat_ids})


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
		mat_minrowcol, cols = [], []
		for c in cs:
			cols.append(c[0]+1)		

		for row in mat_minrow:
			arr = []
			for c in cs:
				arr.append(row[c[0]])
			mat_minrowcol.append(arr)
		
		return sort_matrix(mat_minrowcol, rows, cols)

	else:
		return sort_matrix(mat_minrowcol, rows, cols)

def sort_matrix(matrix, rows, cols):
	row_idx = sorted(range(len(matrix)), key=lambda k: sum(matrix[k]))
	mat_01 = [matrix[idx] for idx in row_idx]
	# rows_arranged = [rows[idx] for idx in row_idx]
	# print(rows_arranged)
	mat = []
	mat_ids = []
	for row in mat_01:
		col_idx = sorted(range(len(row)), key=lambda k: row[k])
		row_arranged = [row[idx] for idx in col_idx]
		mat.append(row_arranged)

		row_id_arranged = [cols[idx] for idx in col_idx]
		mat_ids.append(row_id_arranged)

	# print(mat_ids)
	return mat, mat_ids, row_idx

