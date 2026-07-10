import json
import urllib.request

with open('/tmp/snapshot.json', 'r') as f:
    data = json.load(f)

payload = json.dumps({'data': data}).encode('utf-8')

for endpoint in ['kc', 'unit', 'kcp']:
    req = urllib.request.Request(f'http://127.0.0.1:8003/api/export/{endpoint}', data=payload, headers={'Content-Type': 'application/json'})
    try:
        response = urllib.request.urlopen(req)
        print(f"{endpoint} status:", response.status)
        if response.status == 200:
            content = response.read()
            print(f"{endpoint} size:", len(content))
    except urllib.error.HTTPError as e:
        print(f"{endpoint} error:", e.code, e.read().decode())

