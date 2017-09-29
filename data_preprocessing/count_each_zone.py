import sqlite3
import csv, json
import os
folder_path = os.path.dirname(os.path.abspath(__file__))

db = 'taxi.db'
tb_name = 'yellow_tripdata_JanApr'

number_of_zones = 265
zones = {}

with open('../data/taxi+_zone_lookup.csv', newline='') as csvfile:
	k=0
	spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
	for row in spamreader:
		if k==0:
			k+=1
			continue
		if row!=[]:
			zones[row[2].strip('\"')] = {'pick_up': 0, 'drop_off': 0}
			# lookup_tb[row[0]] = {'Borough': row[1].strip('\"'), 'Zone': row[2].strip('\"')}


def count_each_zone(tb_name, cur, conn):
	cur.execute('SELECT PULocation, DOLocation FROM ' + tb_name)
	rows = cur.fetchall()
	k=0
	for row in rows:
		if not k%100000:
			print(k/100000)
		k+=1
		try:
			zones[row[0]]['pick_up'] += 1
			zones[row[1]]['drop_off'] += 1
		except:
			pass


	with open('count_each_zone.json', 'w') as jsonfile:
		json.dump(zones, jsonfile)



if __name__ == "__main__":
	conn = sqlite3.connect(db)
	cur = conn.cursor()
	count_each_zone(tb_name, cur, conn)
	conn.commit()
	conn.close()
