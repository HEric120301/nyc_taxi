import sqlite3
import csv, json
import os
folder_path = os.path.dirname(os.path.abspath(__file__))


lookup_tb = {}

def create_tb():
	with open('../data/taxi+_zone_lookup.csv', newline='') as csvfile:
		k=0
		spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
		for row in spamreader:
			if row!=[]:
				lookup_tb[row[2].strip('\"')] = {'Borough': row[1].strip('\"'), 'ID': row[0]}
				k+=1
		print(k)
		with open('name_id_lookDict.json', 'w') as jsonfile:
			json.dump(lookup_tb, jsonfile)



if __name__ == "__main__":
	create_tb()