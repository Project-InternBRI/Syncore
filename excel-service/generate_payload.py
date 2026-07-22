import json

with open('/tmp/snapshot.json', 'r') as f:
    snapshot_data = json.load(f)
    
payload = {
    'data': snapshot_data,
    'period_name': 'Desember 2025',
    'selected_periods': ['Des-25'],
    'selected_components': ['DANA PIHAK KETIGA', 'PINJAMAN', 'SML %', 'NPL %'],
    'selected_rka': []
}

with open('payload.json', 'w') as f:
    json.dump(payload, f)
