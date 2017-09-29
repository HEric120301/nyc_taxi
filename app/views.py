from app import app
from flask import Flask, redirect, jsonify

import csv
import os

@app.route('/')
@app.route('/index')
def index():
	return redirect('/static/index.html')

