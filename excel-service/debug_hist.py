import sys
import pandas as pd
import json
from app.services.processor import process_files

payload = []
try:
    with open('/var/folders/_4/k70ymf4s0wj9p4r8f5zp03nw0000gn/T/processed_data_kdcdhivh.json', 'r') as f:
        # this is just the output json, we don't have the input paths easily available
        pass
except:
    pass

# We can just look at the last uploaded files by inspecting the database or storage dir!
