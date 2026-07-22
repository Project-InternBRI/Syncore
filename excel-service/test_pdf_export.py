import json
import requests

with open('/tmp/snapshot.json', 'r') as f:
    snapshot_data = json.load(f)
    
payload = {
    'data': snapshot_data,
    'period_name': 'Desember 2025',
    'selected_periods': ['Des-25'],
    'selected_components': ['DANA PIHAK KETIGA', 'PINJAMAN', 'SML %', 'NPL %'],
    'selected_rka': []
}

try:
    res = requests.post('http://127.0.0.1:8003/api/export-pdf/kc', json=payload)
    if res.status_code == 200:
        print("Success! PDF generated. Length:", len(res.content))
        with open('test_output.pdf', 'wb') as f:
            f.write(res.content)
    else:
        print("Failed! Status code:", res.status_code)
        print(res.text)
except Exception as e:
    print("Error:", e)
