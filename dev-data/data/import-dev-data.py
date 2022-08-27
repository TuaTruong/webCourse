from array import array
import json
from textwrap import indent
import requests

list_tour = json.loads(open("tours-simple.json","r").read())
print(list_tour[0])
# for i in list_tour:
#     data = requests.post("http://127.0.0.1:3000/api/v1/tours",data=i).json()
#     print(data)