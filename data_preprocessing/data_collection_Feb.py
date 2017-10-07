import sqlite3
import csv
import os
folder_path = os.path.dirname(os.path.abspath(__file__))

db = 'taxi.db'
# taxi_data = '../data/green_tripdata_2017-01.csv'
tb_name = 'yellow_tripdata_Feb'
data_files = ['../data/yellow_tripdata_2017-02.csv']

lookup_tb_ads = '../data/taxi+_zone_lookup.csv'
lookup_tb = {}

def get_loop_table(lookup_tb_ads):
	k=0
	with open(lookup_tb_ads, newline='') as csvfile:
		spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
		for row in spamreader:
			if k==0:
				k+=1
				continue
			if row!=[]:
				lookup_tb[row[0]] = {'Borough': row[1].strip('\"'), 'Zone': row[2].strip('\"')}


def create_db(table_name):
	print ("Opened database successfully")
	conn.execute('DROP TABLE IF EXISTS '+table_name)
	conn.execute('CREATE TABLE '+table_name+' (VendorID TEXT, lpep_pickup_datetime TIME, lpep_dropoff_datetime TIME, PULocationID TEXT, PULocation TEXT, PUBorough TEXT, DOLocationID TEXT, DOLocation TEXT, DOBorough TEXT)')
	print ("Table created successfully")

def data_collection(table_name, data_add):
	k=0
	with open(data_add, newline='') as csvfile:
		spamreader = csv.reader(csvfile, delimiter=',', quotechar='|')
		for row in spamreader:
			if k == 0:
				k+=1
				# print(row)
				continue
			if row!=[]:
				k+=1
				if not k%100000:
					print(k/100000)
				cur.execute('insert into '+table_name+' values (?,?,?,?,?,?,?,?,?)', [row[0], row[1], row[2], row[7], lookup_tb[row[7]]['Zone'], lookup_tb[row[7]]['Borough'], row[8], lookup_tb[row[8]]['Zone'], lookup_tb[row[8]]['Borough']])

	print(k)

if __name__ == "__main__":
	get_loop_table(lookup_tb_ads)
	# print(lookup_tb)
	conn = sqlite3.connect(db)
	cur = conn.cursor()
	create_db(tb_name)
	for dt_fl in data_files:
		data_collection(tb_name, dt_fl)
	conn.commit()
	conn.close()
